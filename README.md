# PricePirate for Pipedream

Pipedream actions for [PricePirate](https://pricepirate.com/en/price-api/), the price-data API: current product and offer data by EAN/GTIN or marketplace product ID on Idealo, Amazon, Google Shopping, Bol, Klarna and PriceRunner.

This repository is where the integration is developed. The components are submitted to the [Pipedream registry](https://github.com/PipedreamHQ/pipedream) and run in Pipedream Workflows, Pipedream Connect and Pipedream's MCP servers. `components/pricepirate/` mirrors the registry layout one-to-one.

## Actions

| Action | What it does |
| --- | --- |
| Get Offers by EAN | One item per shop offer for up to 1,000 EANs. Waits for the lookup. |
| Get Offers by Product ID | The same, by marketplace product ID (e.g. Amazon ASIN). |
| Get Product Details by EAN | One item per EAN with product-level fields, without offers. |
| Get Product Details by Product ID | The same, by marketplace product ID. |
| Start Price Job | Starts a lookup and returns the `job_id` immediately. |
| Get Job Results | Status and results of a job: offers, products or raw JSON. |
| Get Account | Credit balance, limits and entitlements. |

Field names follow the API's snake_case, so the [API documentation](https://pricepirate.com/docs/solutions/price-data-api) applies one-to-one.

## Authentication

One API key, sent as the `x-api-key` header. Create it in the PricePirate dashboard; new accounts get 100 free credits, and each query costs one credit.

## Long-running lookups

Lookups are asynchronous jobs that usually finish in 1–2 minutes. The waiting actions poll every 5 seconds up to **Max Wait** (240 s by default, 720 s maximum) and then fail with the `job_id`, which **Get Job Results** accepts for about one hour. Use **Start Price Job** + **Get Job Results** for large batches.

## Development

The actions follow Pipedream's [component guidelines](https://pipedream.com/docs/components/contributing/guidelines). To lint, copy `components/pricepirate` into a checkout of `PipedreamHQ/pipedream` and run `npx eslint components/pricepirate`.

## Support

info@gaponik.com

## License

[MIT](LICENSE). Published by UCX Media – Sergei Gaponik.
