import pricepirate from "../../pricepirate.app.mjs";
import {
  DOCS_URL,
  MAX_WAIT_SECONDS,
  OUTPUT_MODES,
} from "../../common/constants.mjs";
import {
  pluralize,
  toOfferItems,
  toProductItems,
} from "../../common/utils.mjs";

export default {
  key: "pricepirate-get-job-results",
  name: "Get Job Results",
  description: "Get the status and results of a price lookup job started with **Start Price Job**, or of a lookup that ran out of wait time."
    + " Returns one item per offer, one item per product, or the raw job JSON. If the job is still running, returns `status: \"pending\"` with its progress instead; try again later or set **Max Wait**."
    + " Results are kept for about one hour after the job completes. Fetching a finished job also settles refunds for failed queries."
    + ` [See the documentation](${DOCS_URL})`,
  version: "0.0.1",
  type: "action",
  ai: "optimized",
  annotations: {
    destructiveHint: false,
    openWorldHint: true,
    readOnlyHint: true,
  },
  props: {
    pricepirate,
    jobId: {
      propDefinition: [
        pricepirate,
        "jobId",
      ],
    },
    outputMode: {
      propDefinition: [
        pricepirate,
        "outputMode",
      ],
    },
    skipEmpty: {
      propDefinition: [
        pricepirate,
        "skipEmpty",
      ],
    },
    maxWaitSeconds: {
      propDefinition: [
        pricepirate,
        "maxWaitSeconds",
      ],
      description: `How long to wait if the job is still running, e.g. \`120\`. Defaults to \`0\`: check once and return the current status. Maximum \`${MAX_WAIT_SECONDS}\`. In a workflow, raise the workflow's timeout above this value.`,
      min: 0,
      default: 0,
    },
  },
  async run({ $ }) {
    let result;
    try {
      result = await this.pricepirate.waitForJob({
        $,
        jobId: this.jobId,
        maxWaitSeconds: this.maxWaitSeconds ?? 0,
      });
    } catch (err) {
      if (err.response?.status === 404) {
        throw new Error(`Job ${this.jobId} was not found. Results are kept for about one hour after a job completes, and only jobs created with this API key's account are visible.`);
      }
      throw err;
    }
    const {
      job, timedOut,
    } = result;

    if (timedOut) {
      $.export("$summary", `Job ${this.jobId} is still running (${job.done ?? 0} of ${job.total ?? "?"} queries done)`);
      return {
        job_id: this.jobId,
        status: job.status,
        done: job.done,
        total: job.total,
      };
    }
    if (job.status === "failed") {
      throw new Error(`Job ${this.jobId} failed and was refunded. Try again in a new job.`);
    }
    if (this.outputMode === OUTPUT_MODES.RAW) {
      $.export("$summary", `Retrieved job ${this.jobId} (${pluralize(job.results.length, "query", "queries")})`);
      return job;
    }
    const found = job.results.filter((entry) => entry.status === "found").length;
    if (this.outputMode === OUTPUT_MODES.PRODUCTS) {
      const items = toProductItems(job, {
        skipEmpty: this.skipEmpty,
      });
      $.export("$summary", `Found ${found} of ${pluralize(job.results.length, "product")} in job ${this.jobId}`);
      return items;
    }
    const items = toOfferItems(job, {
      skipEmpty: this.skipEmpty,
    });
    const offers = job.results.reduce((sum, entry) => sum + (entry.result?.offers?.length ?? 0), 0);
    $.export("$summary", `Found ${pluralize(offers, "offer")} for ${found} of ${pluralize(job.results.length, "query", "queries")} in job ${this.jobId}`);
    return items;
  },
};
