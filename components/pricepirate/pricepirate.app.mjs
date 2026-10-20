import { axios } from "@pipedream/platform";
import {
  BASE_URL,
  DEFAULT_MAX_WAIT_SECONDS,
  INTEGRATION_HEADER,
  INTEGRATION_NAME,
  MARKETPLACES,
  MAX_QUERIES,
  MAX_WAIT_SECONDS,
  OUTPUT_MODES,
  POLL_INTERVAL_SECONDS,
} from "./common/constants.mjs";
import { sleep } from "./common/utils.mjs";

const RETRYABLE_STATUSES = [
  429,
  502,
  503,
];
const TERMINAL_STATUSES = [
  "completed",
  "failed",
];

const countryList = (marketplace) => (MARKETPLACES[marketplace]?.countries ?? []).join("`, `");

export default {
  type: "app",
  app: "pricepirate",
  propDefinitions: {
    marketplace: {
      type: "string",
      label: "Marketplace",
      description: "The marketplace to look up, e.g. `idealo`. One of `idealo`, `amazon`, `google-shopping`, `bol`, `klarna`, `pricerunner`. `klarna` and `pricerunner` support EAN lookups only.",
      options({ operation } = {}) {
        return Object.entries(MARKETPLACES)
          .filter(([
            , { operations },
          ]) => !operation || operations.includes(operation))
          .map(([
            value,
            { label },
          ]) => ({
            label,
            value,
          }));
      },
    },
    country: {
      type: "string",
      label: "Country",
      description: "Two-letter country code of the marketplace, e.g. `de`. Valid values depend on **Marketplace**:"
        + ` idealo: \`${countryList("idealo")}\`;`
        + ` amazon: \`${countryList("amazon")}\`;`
        + ` google-shopping: \`${countryList("google-shopping")}\`;`
        + ` bol: \`${countryList("bol")}\`;`
        + ` klarna: \`${countryList("klarna")}\`;`
        + ` pricerunner: \`${countryList("pricerunner")}\`.`,
      options({ marketplace } = {}) {
        return MARKETPLACES[marketplace]?.countries ?? [];
      },
    },
    eans: {
      type: "string[]",
      label: "EANs",
      description: `EAN or GTIN codes to look up, 1 to ${MAX_QUERIES} per run, e.g. \`["4013474101469", "4006381333931"]\`. Each code costs one credit.`,
    },
    productIds: {
      type: "string[]",
      label: "Product IDs",
      description: `Marketplace product IDs to look up, 1 to ${MAX_QUERIES} per run: an ASIN for \`amazon\` (e.g. \`B0BSHF7WHW\`), the product ID from the product URL for \`idealo\`, \`google-shopping\` and \`bol\`. Each ID costs one credit.`,
    },
    includeDetail: {
      type: "boolean",
      label: "Include Product Detail (Amazon Only)",
      description: "Amazon only: also fetch the product detail page, e.g. `true`. `false` is faster and returns offers only. Ignored for other marketplaces. Defaults to `true`.",
      optional: true,
    },
    zipcode: {
      type: "string",
      label: "Delivery Zip Code (Amazon Only)",
      description: "Amazon only: delivery postal code that prices and availability are calculated for, e.g. `80331` or `SW1A 1AA`. Supported for `de`, `us`, `uk`, `fr`, `it`, `es`, `ca`, `jp`, `in`, `ie` and `za`. Leave empty for the market default. Ignored for other marketplaces.",
      optional: true,
    },
    maxWaitSeconds: {
      type: "integer",
      label: "Max Wait (Seconds)",
      description: `How long to wait for the job to finish, e.g. \`240\`. Most jobs finish in 1–2 minutes; large batches can take up to about 15. Defaults to \`${DEFAULT_MAX_WAIT_SECONDS}\`, maximum \`${MAX_WAIT_SECONDS}\`. In a workflow, raise the workflow's timeout above this value. If the job is still running when the wait ends, the step fails with the job ID; use **Get Job Results** within about one hour to fetch the results.`,
      min: 10,
      max: MAX_WAIT_SECONDS,
      default: DEFAULT_MAX_WAIT_SECONDS,
      optional: true,
    },
    skipEmpty: {
      type: "boolean",
      label: "Skip Queries Without Offers",
      description: "Leave out queries that returned no data (`not_found` or `error`), e.g. `true`. By default each such query still returns one item with its `status` and `errorCode`, so no input row disappears silently.",
      default: false,
      optional: true,
    },
    jobId: {
      type: "string",
      label: "Job ID",
      description: "The job ID, e.g. `3f6c0a7e-5d1b-4c39-9a51-2f1f0f8f6b2e`. **Start Price Job** returns it as `job_id`, and so does the error of a lookup that ran out of wait time. Results are kept for about one hour after the job completes.",
      async options({ prevContext }) {
        const {
          jobs = [], next_cursor: nextCursor,
        } = await this.listJobs({
          params: {
            limit: 50,
            cursor: prevContext?.cursor,
          },
        });
        return {
          options: jobs.map((job) => ({
            label: `${job.source} ${job.country.toUpperCase()} · ${job.operation} · ${job.query_count} queries · ${job.created_at}`,
            value: job.job_id,
          })),
          context: {
            cursor: nextCursor,
          },
        };
      },
    },
    outputMode: {
      type: "string",
      label: "Output",
      description: "How to return the results, e.g. `offers`. `offers`: one item per offer, like **Get Offers by EAN**. `products`: one item per query with product fields, like **Get Product Details by EAN**. `raw`: the job JSON as the API returns it.",
      options: [
        {
          label: "One item per offer",
          value: OUTPUT_MODES.OFFERS,
        },
        {
          label: "One item per product",
          value: OUTPUT_MODES.PRODUCTS,
        },
        {
          label: "Raw job JSON",
          value: OUTPUT_MODES.RAW,
        },
      ],
      default: OUTPUT_MODES.OFFERS,
    },
  },
  methods: {
    _makeRequest({
      $ = this, headers, ...args
    }) {
      return axios($, {
        baseURL: BASE_URL,
        headers: {
          "x-api-key": this.$auth.api_key,
          [INTEGRATION_HEADER]: INTEGRATION_NAME,
          ...headers,
        },
        ...args,
      });
    },
    /**
     * Creates a lookup job. Charges one credit per query.
     * @param {Object} args.data - `{ source, operation, country, queries, options }`
     * @returns {Promise<{ job_id: string }>}
     */
    createJob(args = {}) {
      return this._makeRequest({
        method: "POST",
        url: "/jobs",
        ...args,
      });
    },
    /**
     * Polls a job. A poll in a terminal status also settles refunds.
     * @returns {Promise<Object>} the job view with `status` and `results`
     */
    getJob({
      jobId, ...args
    }) {
      return this._makeRequest({
        url: `/jobs/${encodeURIComponent(jobId)}`,
        ...args,
      });
    },
    /**
     * Lists the account's job history, newest first.
     * @returns {Promise<{ jobs: Object[], next_cursor: string|null }>}
     */
    listJobs(args = {}) {
      return this._makeRequest({
        url: "/jobs",
        ...args,
      });
    },
    /**
     * Returns the account's credit balance, limits and entitlements.
     */
    getAccount(args = {}) {
      return this._makeRequest({
        url: "/account",
        ...args,
      });
    },
    /**
     * Calls `fn`, waiting and retrying on 429, 502 and 503 (honouring
     * `Retry-After`) until `deadline`. Only used for idempotent reads.
     */
    async _withRetry(fn, deadline) {
      for (;;) {
        try {
          return await fn();
        } catch (err) {
          const status = err.response?.status;
          if (!RETRYABLE_STATUSES.includes(status)) throw err;
          const retryAfter = Number(err.response.headers?.["retry-after"]) || 10;
          if (Date.now() + retryAfter * 1000 > deadline) throw err;
          await sleep(retryAfter * 1000);
        }
      }
    },
    /**
     * Polls a job every 5 seconds until it is terminal or `maxWaitSeconds`
     * runs out, then makes one full poll that returns the results and settles
     * refunds.
     * @returns {Promise<{ job: Object, timedOut: boolean }>}
     */
    async waitForJob({
      $, jobId, maxWaitSeconds = DEFAULT_MAX_WAIT_SECONDS,
    }) {
      const deadline = Date.now() + maxWaitSeconds * 1000;
      for (;;) {
        const job = await this._withRetry(() => this.getJob({
          $,
          jobId,
          params: {
            omit_partials: true,
          },
        }), deadline);
        if (TERMINAL_STATUSES.includes(job.status)) break;
        if (Date.now() + POLL_INTERVAL_SECONDS * 1000 > deadline) {
          return {
            job,
            timedOut: true,
          };
        }
        await sleep(POLL_INTERVAL_SECONDS * 1000);
      }
      const job = await this._withRetry(() => this.getJob({
        $,
        jobId,
      }), Date.now() + 60 * 1000);
      return {
        job,
        timedOut: false,
      };
    },
  },
};
