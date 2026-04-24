import type { Account } from "@/lib/types";
import { MOCK_LATENCY_MS } from "./persona";

const accounts: Account[] = [
  {
    id: "chase-checking",
    name: "Everyday Checking",
    institution: "Chase",
    kind: "checking",
    currency: "USD",
    balance: 38520.44,
    last4: "4821",
    colour: "#2563eb",
  },
  {
    id: "cba-everyday",
    name: "Smart Access",
    institution: "Commonwealth Bank",
    kind: "checking",
    currency: "AUD",
    balance: 6214.9,
    last4: "1903",
    colour: "#facc15",
  },
  {
    id: "robinhood",
    name: "Robinhood Brokerage",
    institution: "Robinhood",
    kind: "brokerage",
    currency: "USD",
    balance: 38012.73,
    colour: "#22c55e",
  },
  {
    id: "roth-ira",
    name: "Roth IRA",
    institution: "Fidelity",
    kind: "retirement",
    currency: "USD",
    balance: 31244.18,
    colour: "#7c5cff",
  },
];

async function delay<T>(v: T): Promise<T> {
  await new Promise((r) => setTimeout(r, MOCK_LATENCY_MS));
  return v;
}

export async function fetchAccounts() {
  return delay(accounts.slice());
}

export async function fetchAccount(id: string) {
  return delay(accounts.find((a) => a.id === id) ?? null);
}
