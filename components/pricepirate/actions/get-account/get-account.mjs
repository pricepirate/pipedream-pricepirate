import pricepirate from "../../pricepirate.app.mjs";
import { DOCS_URL } from "../../common/constants.mjs";
import { pluralize } from "../../common/utils.mjs";

export default {
  key: "pricepirate-get-account",
  name: "Get Account",
  description: "Get the account's spendable credit balance, concurrency and daily limits, and the marketplaces and lookup types it is entitled to."
    + " Use it to check that enough credits are left before starting a large lookup: each query costs one credit."
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
  },
  async run({ $ }) {
    const account = await this.pricepirate.getAccount({
      $,
    });
    $.export("$summary", `Account has ${pluralize(account.credits?.balance ?? 0, "credit")} available`);
    return account;
  },
};
