export const SUPPORTED_CURRENCIES = [
  { code: "EUR", label: "EUR · Euro (€)" },
  { code: "BRL", label: "BRL · Real (R$)" },
  { code: "USD", label: "USD · Dólar (US$)" },
  { code: "GBP", label: "GBP · Libra (£)" },
  { code: "JPY", label: "JPY · Iene (¥)" },
  { code: "ARS", label: "ARS · Peso argentino" },
  { code: "CLP", label: "CLP · Peso chileno" },
  { code: "CHF", label: "CHF · Franco suíço" },
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]["code"];

export const SUPPORTED_CURRENCY_CODES = SUPPORTED_CURRENCIES.map((currency) => currency.code) as [
  SupportedCurrency,
  ...SupportedCurrency[],
];
