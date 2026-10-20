import pricepirate from "../../pricepirate.app.mjs";
import common from "../../common/lookup.mjs";
import {
  DOCS_URL,
  OPERATIONS,
  OUTPUT_MODES,
} from "../../common/constants.mjs";

export default {
  ...common,
  key: "pricepirate-get-product-details-by-ean",
  name: "Get Product Details by EAN",
  description: "Get product-level data for up to 1,000 EANs on one marketplace and country: name, brand, URL, images, categories, reviews, lowest, average and highest price, and offer count."
    + " Returns one item per EAN without the offers list; each item has a `status` of `found`, `not_found` or `error`."
    + " Waits for the lookup to finish (usually 1–2 minutes); for large batches use **Start Price Job** and then **Get Job Results**."
    + " Use **Get Offers by EAN** for the individual shop offers."
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
    eans: {
      propDefinition: [
        pricepirate,
        "eans",
      ],
    },
    zipcode: {
      propDefinition: [
        pricepirate,
        "zipcode",
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
    },
  },
  methods: {
    ...common.methods,
    getOperation() {
      return OPERATIONS.GTIN;
    },
    getOutputMode() {
      return OUTPUT_MODES.PRODUCTS;
    },
    getQueries() {
      return this.eans;
    },
  },
};
