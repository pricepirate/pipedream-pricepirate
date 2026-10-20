import {
  DEFAULT_MAX_WAIT_SECONDS,
  MARKETPLACES,
  OUTPUT_MODES,
} from "./constants.mjs";
import {
  buildJobData,
  pluralize,
  toOfferItems,
  toProductItems,
} from "./utils.mjs";

/**
 * Shared run logic of the lookup actions: create a job, wait for it, and
 * return one item per offer or per product. Each action sets `operation`,
 * `outputMode` and `queries` through the methods below.
 */
export default {
  methods: {
    getOperation() {
      throw new Error("getOperation not implemented");
    },
    getOutputMode() {
      throw new Error("getOutputMode not implemented");
    },
    getQueries() {
      throw new Error("getQueries not implemented");
    },
  },
  async run({ $ }) {
    const data = buildJobData({
      marketplace: this.marketplace,
      operation: this.getOperation(),
      country: this.country,
      queries: this.getQueries(),
      includeDetail: this.includeDetail,
      zipcode: this.zipcode,
    });
    const { job_id: jobId } = await this.pricepirate.createJob({
      $,
      data,
    });
    $.export("job_id", jobId);

    const maxWaitSeconds = this.maxWaitSeconds ?? DEFAULT_MAX_WAIT_SECONDS;
    const {
      job, timedOut,
    } = await this.pricepirate.waitForJob({
      $,
      jobId,
      maxWaitSeconds,
    });
    if (timedOut) {
      throw new Error(`Job ${jobId} is still running after ${maxWaitSeconds} seconds (${job.done ?? 0} of ${job.total ?? data.queries.length} queries done). Use Get Job Results with this job ID within about one hour to fetch the results, or raise Max Wait.`);
    }
    if (job.status === "failed") {
      throw new Error(`Job ${jobId} failed and was refunded. Try again in a new job.`);
    }

    const where = `${MARKETPLACES[data.source].label} (${data.country.toUpperCase()})`;
    const found = job.results.filter((entry) => entry.status === "found").length;
    const total = job.results.length;
    if (this.getOutputMode() === OUTPUT_MODES.PRODUCTS) {
      const items = toProductItems(job, {
        skipEmpty: this.skipEmpty,
      });
      $.export("$summary", `Found ${found} of ${pluralize(total, "product")} on ${where}`);
      return items;
    }
    const items = toOfferItems(job, {
      skipEmpty: this.skipEmpty,
    });
    const offers = job.results.reduce((sum, entry) => sum + (entry.result?.offers?.length ?? 0), 0);
    $.export("$summary", `Found ${pluralize(offers, "offer")} for ${found} of ${pluralize(total, "query", "queries")} on ${where}`);
    return items;
  },
};
