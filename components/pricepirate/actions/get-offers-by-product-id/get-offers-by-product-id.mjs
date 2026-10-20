import pricepirate from "../../pricepirate.app.mjs";
import common from "../../common/lookup.mjs";
import {
  DOCS_URL,
  OPERATIONS,
  OUTPUT_MODES,
} from "../../common/constants.mjs";

export default {
  ...common,
  key: "pricepirate-get-offers-by-product-id",
  name: "Get Offers by Product ID",
  description: "Get the current shop offers (price, shipping, total, availability, shop) for up to 1,000 marketplace product IDs, such as Amazon ASINs, on Idealo, Amazon, Google Shopping or Bol."
    + " Returns one flat item per offer with the query and product context. A query without offers still returns one item with its `status` and `errorCode`."
    + " Waits for the lookup to finish (usually 1–2 minutes); for large batches use **Start Price Job** and then **Get Job Results**."
    + " Use **Get Offers by EAN** when you have EANs instead of product IDs."
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
        () => ({
          operation: OPERATIONS.ID,
        }),
      ],
      description: "The marketplace to look up, e.g. `amazon`. One of `idealo`, `amazon`, `google-shopping`, `bol`.",
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
    productIds: {
      propDefinition: [
        pricepirate,
        "productIds",
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
      return OPERATIONS.ID;
    },
    getOutputMode() {
      return OUTPUT_MODES.OFFERS;
    },
    getQueries() {
      return this.productIds;
    },
  },
};
