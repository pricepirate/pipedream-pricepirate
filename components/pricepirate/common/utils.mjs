import { ConfigurationError } from "@pipedream/platform";
import {
  MARKETPLACES,
  MAX_QUERIES,
} from "./constants.mjs";

const OFFER_FIELDS = [
  "shop_name",
  "shop_url",
  "price",
  "shipping",
  "total",
  "currency",
  "availability_code",
  "availability_text",
  "condition",
  "position",
  "marketplace_name",
  "shop_review_rating",
  "shop_review_count",
  "free_return",
  "voucher",
  "direct_sale",
  "title",
  "sellerId",
];

const PRODUCT_FIELDS = [
  "id",
  "name",
  "url",
  "ean",
  "brand",
  "description",
  "image_urls",
  "categories",
  "review_rating",
  "review_count",
  "price_min",
  "price_avg",
  "price_max",
  "offers_count",
  "platform_data",
];

const pick = (source, fields) => Object.fromEntries(
  fields.map((field) => [
    field,
    source?.[field] ?? null,
  ]),
);

export const pluralize = (count, singular, plural = `${singular}s`) => `${count} ${count === 1
  ? singular
  : plural}`;

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Trims the queries, drops empty entries and removes duplicates.
 * @param {string[]|string} queries - EANs, GTINs or marketplace product IDs
 * @returns {string[]}
 */
export const normalizeQueries = (queries) => {
  const list = Array.isArray(queries)
    ? queries
    : String(queries ?? "").split(/[\n,;]/);
  return [
    ...new Set(list.map((query) => String(query).trim()).filter(Boolean)),
  ];
};

/**
 * Validates the inputs and builds the body for creating a job. Amazon is the
 * only marketplace that takes `options`.
 */
export const buildJobData = ({
  marketplace, operation, country, queries, includeDetail, zipcode,
}) => {
  const config = MARKETPLACES[marketplace];
  if (!config) {
    throw new ConfigurationError(`Unknown marketplace \`${marketplace}\`. Use one of: ${Object.keys(MARKETPLACES).join(", ")}.`);
  }
  if (!config.operations.includes(operation)) {
    throw new ConfigurationError(`${config.label} supports EAN lookups only.`);
  }
  const normalizedCountry = String(country ?? "").trim()
    .toLowerCase();
  if (!config.countries.includes(normalizedCountry)) {
    throw new ConfigurationError(`Unknown country \`${country}\` for ${config.label}. Use one of: ${config.countries.join(", ")}.`);
  }
  const list = normalizeQueries(queries);
  if (!list.length || list.length > MAX_QUERIES) {
    throw new ConfigurationError(`Provide between 1 and ${MAX_QUERIES} queries (got ${list.length}).`);
  }
  const options = marketplace === "amazon"
    ? {
      includeDetail,
      zipcode: zipcode?.trim() || undefined,
    }
    : undefined;
  return {
    source: marketplace,
    operation,
    country: normalizedCountry,
    queries: list,
    options,
  };
};

/**
 * Flattens a terminal job into one item per offer. A query without offers
 * (`not_found`, `error`, or a product with zero offers) still yields one item
 * with empty offer fields, unless `skipEmpty` is set.
 */
export const toOfferItems = (job, { skipEmpty = false } = {}) => job.results.flatMap((entry) => {
  const product = entry.result;
  const base = {
    query: entry.query,
    source: job.source,
    country: job.country,
    job_id: job.job_id,
    status: entry.status,
    error: entry.error ?? null,
    errorCode: entry.errorCode ?? null,
    product_id: product?.id ?? null,
    product_name: product?.name ?? null,
    product_url: product?.url ?? null,
    ean: product?.ean ?? null,
    brand: product?.brand ?? null,
    price_min: product?.price_min ?? null,
    offers_count: product?.offers_count ?? null,
    fetched_at: product?.fetched_at ?? null,
  };
  const offers = product?.offers ?? [];
  if (!offers.length) {
    return skipEmpty
      ? []
      : [
        {
          ...base,
          ...pick(null, OFFER_FIELDS),
        },
      ];
  }
  return offers.map((offer) => ({
    ...base,
    ...pick(offer, OFFER_FIELDS),
  }));
});

/**
 * Maps a terminal job to one item per query with the product-level fields
 * and no offers array.
 */
export const toProductItems = (job, { skipEmpty = false } = {}) => job.results
  .filter((entry) => !skipEmpty || entry.status === "found")
  .map((entry) => ({
    query: entry.query,
    status: entry.status,
    error: entry.error ?? null,
    errorCode: entry.errorCode ?? null,
    ...pick(entry.result, PRODUCT_FIELDS),
  }));
