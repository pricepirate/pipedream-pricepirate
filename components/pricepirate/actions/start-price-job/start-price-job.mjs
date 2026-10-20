import pricepirate from "../../pricepirate.app.mjs";
import {
  DOCS_URL,
  MARKETPLACES,
  MAX_QUERIES,
  OPERATIONS,
} from "../../common/constants.mjs";
import {
  buildJobData,
  pluralize,
} from "../../common/utils.mjs";

export default {
  key: "pricepirate-start-price-job",
  name: "Start Price Job",
  description: "Start a price lookup job for up to 1,000 EANs or product IDs without waiting for it to finish. Returns the `job_id` immediately."
    + " Use it for large batches or short step timeouts: wait a few minutes (for example with a Delay step), then call **Get Job Results** with the `job_id` within about one hour."
    + " For small batches, **Get Offers by EAN** and **Get Product Details by EAN** start the job and wait for it in one step."
    + ` [See the documentation](${DOCS_URL})`,
  version: "0.0.1",
  type: "action",
  ai: "optimized",
  annotations: {
    destructiveHint: false,
    openWorldHint: true,
    readOnlyHint: false,
  },
  props: {
    pricepirate,
    marketplace: {
      propDefinition: [
        pricepirate,
        "marketplace",
      ],
    },
    country: {
      propDefinition: [
        pricepirate,
        "country",
        (c) => ({
          marketplace: c.marketplace,
        }),
      ],
    },
    operation: {
      type: "string",
      label: "Lookup By",
      description: "What the queries are, e.g. `search-by-gtin`. `search-by-gtin`: EAN or GTIN codes. `search-by-id`: marketplace product IDs such as Amazon ASINs (not available for `klarna` and `pricerunner`).",
      options: [
        {
          label: "EAN / GTIN",
          value: OPERATIONS.GTIN,
        },
        {
          label: "Marketplace product ID",
          value: OPERATIONS.ID,
        },
      ],
      default: OPERATIONS.GTIN,
    },
    queries: {
      type: "string[]",
      label: "Queries",
      description: `EANs or product IDs to look up, matching **Lookup By**, 1 to ${MAX_QUERIES} per job, e.g. \`["4013474101469", "4006381333931"]\`. Each query costs one credit.`,
    },
    includeDetail: {
      propDefinition: [
        pricepirate,
        "includeDetail",
      ],
    },
    zipcode: {
      propDefinition: [
        pricepirate,
        "zipcode",
      ],
    },
  },
  async run({ $ }) {
    const data = buildJobData({
      marketplace: this.marketplace,
      operation: this.operation,
      country: this.country,
      queries: this.queries,
      includeDetail: this.includeDetail,
      zipcode: this.zipcode,
    });
    const { job_id: jobId } = await this.pricepirate.createJob({
      $,
      data,
    });
    $.export("$summary", `Started job ${jobId} for ${pluralize(data.queries.length, "query", "queries")} on ${MARKETPLACES[data.source].label} (${data.country.toUpperCase()})`);
    return {
      job_id: jobId,
      status: "pending",
      source: data.source,
      operation: data.operation,
      country: data.country,
      query_count: data.queries.length,
    };
  },
};
