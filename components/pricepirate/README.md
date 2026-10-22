# Overview

[PricePirate](https://pricepirate.com/en/price-api/)'s price-data API returns current product and offer data by EAN/GTIN or marketplace product ID across European marketplaces: Idealo, Amazon, Google Shopping, Bol, Klarna and PriceRunner. Every lookup returns prices, shipping, totals, availability and shop details in one schema, for up to 1,000 products per request.

# Example Use Cases

- Check competitor prices for your catalogue every morning and write the cheapest offer per EAN to Google Sheets.
- Alert a Slack channel when a competitor undercuts your price on Idealo or Amazon.
- Enrich a product feed with brand, images, categories and the lowest price per marketplace.

# Getting Started

1. Create an API key in the PricePirate dashboard. New accounts get 100 free credits; each query costs one credit.
2. Connect your PricePirate account in Pipedream with that key.
3. Use **Get Offers by EAN** or **Get Product Details by EAN** for small batches. They start the lookup and wait for it.
4. For large batches, use **Start Price Job**, wait a few minutes, then **Get Job Results**.

# Troubleshooting

## Lookups take time

Lookups usually finish in 1–2 minutes and can take up to about 15 for large batches. The waiting actions stop after **Max Wait** (240 seconds by default) and fail with the job ID; fetch the results with **Get Job Results** within about one hour. In a workflow, raise the workflow's timeout above **Max Wait** (HTTP-triggered workflows default to 30 seconds).

## Queries without offers

A query with no data still returns one item with `status` (`not_found` or `error`) and `errorCode`. Queries with `error` are refunded. Turn on **Skip Queries Without Offers** to leave them out.

## 429 errors

A 429 means your account's concurrency or daily limit was reached. Wait and try again, or check your limits with **Get Account**.
