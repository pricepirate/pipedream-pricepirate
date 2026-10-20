import pricepirate from "../../pricepirate.app.mjs";
import common from "../../common/lookup.mjs";
import {
  DOCS_URL,
  OPERATIONS,
  OUTPUT_MODES,
} from "../../common/constants.mjs";

export default {
  ...common,
  key: "pricepirate-get-offers-by-ean",
  name: "Get Offers by EAN",
  description: "Get the current shop offers (price, shipping, total, availability, shop) for up to 1,000 EANs on one marketplace and country: Idealo, Amazon, Google Shopping, Bol, Klarna or PriceRunner."
    + " Returns one flat item per offer with the query and product context. A query without offers still returns one item with its `status` and `errorCode`."
    + " Waits for the lookup to finish (usually 1–2 minutes); for large batches use **Start Price Job** and then **Get Job Results**."
    + " Use **Get Product Details by EAN** for product-level data without offers."
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
      return OUTPUT_MODES.OFFERS;
    },
    getQueries() {
      return this.eans;
    },
  },
};
