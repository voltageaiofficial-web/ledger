export type Currency = "USD" | "AUD";

export type AccountKind = "checking" | "savings" | "brokerage" | "retirement";

export type Account = {
  id: string;
  name: string;
  institution: string;
  kind: AccountKind;
  currency: Currency;
  balance: number;
  last4?: string;
  colour?: string;
};

export type TransactionCategory =
  | "Income"
  | "Rent"
  | "Groceries"
  | "Dining"
  | "Transport"
  | "Subscriptions"
  | "Utilities"
  | "Healthcare"
  | "Entertainment"
  | "Travel"
  | "Shopping"
  | "Transfer"
  | "Other";

export type Transaction = {
  id: string;
  accountId: string;
  date: string;
  merchant: string;
  description?: string;
  category: TransactionCategory;
  amount: number;
  currency: Currency;
};

export type Holding = {
  id: string;
  accountId: string;
  ticker: string;
  name: string;
  assetClass: "US Equity" | "Intl Equity" | "Bond" | "Cash";
  quantity: number;
  avgCost: number;
  currentPrice: number;
  history30d: number[];
};

export type HistoryPoint = {
  date: string;
  value: number;
};

export type NetWorthPoint = HistoryPoint & {
  assets: number;
  liabilities: number;
};

export type FxRate = {
  from: Currency;
  to: Currency;
  rate: number;
  asOf: string;
};

export type MonthlySummary = {
  month: string;
  income: number;
  expenses: number;
  savings: number;
};

export type CategorySpend = {
  category: TransactionCategory;
  amount: number;
};
