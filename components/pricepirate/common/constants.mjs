export const BASE_URL = "https://api-v2.pricepirate.com/api/v2";
export const INTEGRATION_HEADER = "x-pricepirate-integration";
export const INTEGRATION_NAME = "pipedream";
export const DOCS_URL = "https://pricepirate.com/en/price-api/";

export const POLL_INTERVAL_SECONDS = 5;
export const DEFAULT_MAX_WAIT_SECONDS = 240;
export const MAX_WAIT_SECONDS = 720;
export const MAX_QUERIES = 1000;

export const OPERATIONS = Object.freeze({
  GTIN: "search-by-gtin",
  ID: "search-by-id",
});

// Live marketplaces and the countries the API accepts for each.
export const MARKETPLACES = Object.freeze({
  "idealo": {
    label: "Idealo",
    operations: [
      OPERATIONS.GTIN,
      OPERATIONS.ID,
    ],
    countries: [
      "de",
      "at",
      "fr",
      "it",
      "es",
      "uk",
    ],
  },
  "amazon": {
    label: "Amazon",
    operations: [
      OPERATIONS.GTIN,
      OPERATIONS.ID,
    ],
    countries: [
      "de",
      "fr",
      "it",
      "es",
      "uk",
      "nl",
      "be",
      "pl",
      "se",
      "ie",
      "tr",
      "us",
      "ca",
      "mx",
      "br",
      "au",
      "jp",
      "in",
      "sg",
      "ae",
      "sa",
      "eg",
      "za",
    ],
  },
  "google-shopping": {
    label: "Google Shopping",
    operations: [
      OPERATIONS.GTIN,
      OPERATIONS.ID,
    ],
    countries: [
      "de",
      "at",
      "ch",
      "fr",
      "it",
      "es",
      "nl",
      "pl",
      "ro",
      "uk",
      "us",
      "ca",
      "au",
      "jp",
      "in",
    ],
  },
  "bol": {
    label: "Bol",
    operations: [
      OPERATIONS.GTIN,
      OPERATIONS.ID,
    ],
    countries: [
      "nl",
      "be",
    ],
  },
  "klarna": {
    label: "Klarna",
    operations: [
      OPERATIONS.GTIN,
    ],
    countries: [
      "de",
      "at",
      "fr",
      "it",
      "es",
      "nl",
      "ie",
      "se",
      "dk",
      "no",
      "fi",
      "us",
    ],
  },
  "pricerunner": {
    label: "PriceRunner",
    operations: [
      OPERATIONS.GTIN,
    ],
    countries: [
      "uk",
      "se",
      "dk",
    ],
  },
});

export const OUTPUT_MODES = Object.freeze({
  OFFERS: "offers",
  PRODUCTS: "products",
  RAW: "raw",
});
