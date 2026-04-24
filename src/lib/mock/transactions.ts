import { addDays, format, startOfMonth, subMonths } from "date-fns";
import type { Transaction, TransactionCategory, Currency } from "@/lib/types";
import { MOCK_LATENCY_MS, persona } from "./persona";
import { mulberry32, pick, randBetween, round2 } from "./seed";

type Template = {
  merchants: readonly string[];
  category: TransactionCategory;
  min: number;
  max: number;
  perMonth: [number, number];
  currency?: Currency;
  accountId?: string;
};

const US_ACCOUNT = "chase-checking";
const AU_ACCOUNT = "cba-everyday";

const templates: Template[] = [
  { merchants: ["HEB", "Whole Foods", "Trader Joe's", "Central Market"], category: "Groceries", min: 28, max: 142, perMonth: [4, 6] },
  { merchants: ["Franklin BBQ", "Uchi", "Veracruz Tacos", "Via 313", "Torchy's", "Chipotle", "Sweetgreen"], category: "Dining", min: 14, max: 84, perMonth: [6, 10] },
  { merchants: ["Shell", "Chevron", "HEB Fuel"], category: "Transport", min: 32, max: 68, perMonth: [2, 4] },
  { merchants: ["Uber", "Lyft", "Metro Rail"], category: "Transport", min: 8, max: 34, perMonth: [2, 5] },
  { merchants: ["Netflix", "Spotify", "1Password", "iCloud+", "YouTube Premium", "Gym Membership"], category: "Subscriptions", min: 8, max: 32, perMonth: [3, 5] },
  { merchants: ["Austin Energy", "AT&T Fiber", "Austin Water"], category: "Utilities", min: 55, max: 185, perMonth: [2, 3] },
  { merchants: ["CVS Pharmacy", "One Medical"], category: "Healthcare", min: 18, max: 140, perMonth: [0, 2] },
  { merchants: ["Alamo Drafthouse", "Continental Club", "Paramount Theatre", "Zilker Hillside"], category: "Entertainment", min: 12, max: 78, perMonth: [1, 3] },
  { merchants: ["Amazon", "Target", "REI", "Uniqlo"], category: "Shopping", min: 22, max: 180, perMonth: [1, 3] },
];

const auTemplates: Template[] = [
  { merchants: ["Coles", "Woolworths", "Aldi"], category: "Groceries", min: 22, max: 95, perMonth: [1, 2], currency: "AUD", accountId: AU_ACCOUNT },
  { merchants: ["Market Lane", "Industry Beans", "Seven Seeds"], category: "Dining", min: 8, max: 28, perMonth: [1, 3], currency: "AUD", accountId: AU_ACCOUNT },
];

function generate(): Transaction[] {
  const out: Transaction[] = [];
  const rng = mulberry32(20260424);
  const today = new Date("2026-04-24");
  const monthStart = startOfMonth(subMonths(today, 11));

  for (let m = 0; m < 12; m++) {
    const monthDate = new Date(monthStart);
    monthDate.setMonth(monthStart.getMonth() + m);
    const ym = format(monthDate, "yyyy-MM");

    out.push({
      id: `sal-${ym}`,
      accountId: US_ACCOUNT,
      date: `${ym}-01`,
      merchant: "Employer Payroll",
      description: "Semi-monthly salary",
      category: "Income",
      amount: round2(persona.monthlyTakeHomeUSD / 2),
      currency: "USD",
    });
    out.push({
      id: `sal2-${ym}`,
      accountId: US_ACCOUNT,
      date: `${ym}-15`,
      merchant: "Employer Payroll",
      description: "Semi-monthly salary",
      category: "Income",
      amount: round2(persona.monthlyTakeHomeUSD / 2),
      currency: "USD",
    });

    out.push({
      id: `rent-${ym}`,
      accountId: US_ACCOUNT,
      date: `${ym}-03`,
      merchant: "East Austin Lofts",
      description: "Monthly rent",
      category: "Rent",
      amount: -1650,
      currency: "USD",
    });

    if (m === persona.bonusMonthIndex) {
      out.push({
        id: `bonus-${ym}`,
        accountId: US_ACCOUNT,
        date: `${ym}-12`,
        merchant: "Employer Bonus",
        description: "Q4 performance bonus",
        category: "Income",
        amount: persona.bonusAmountUSD,
        currency: "USD",
      });
    }

    if (m % 2 === 0) {
      out.push({
        id: `xfer-rh-${ym}`,
        accountId: US_ACCOUNT,
        date: `${ym}-18`,
        merchant: "Robinhood Transfer",
        description: "ACH to brokerage",
        category: "Transfer",
        amount: -500,
        currency: "USD",
      });
    }

    if (m % 3 === 0) {
      out.push({
        id: `xfer-roth-${ym}`,
        accountId: US_ACCOUNT,
        date: `${ym}-20`,
        merchant: "Fidelity Roth IRA",
        description: "Monthly Roth contribution",
        category: "Transfer",
        amount: -500,
        currency: "USD",
      });
    }

    let seq = 0;
    for (let ti = 0; ti < templates.length; ti++) {
      const t = templates[ti];
      const count = Math.floor(randBetween(rng, t.perMonth[0], t.perMonth[1] + 1));
      for (let i = 0; i < count; i++) {
        const day = Math.floor(randBetween(rng, 2, 28));
        const amount = -round2(randBetween(rng, t.min, t.max));
        const merchant = pick(rng, t.merchants);
        out.push({
          id: `${ym}-t${ti}-${i}-${seq++}`,
          accountId: t.accountId ?? US_ACCOUNT,
          date: `${ym}-${String(day).padStart(2, "0")}`,
          merchant,
          category: t.category,
          amount,
          currency: t.currency ?? "USD",
        });
      }
    }

    for (let ti = 0; ti < auTemplates.length; ti++) {
      const t = auTemplates[ti];
      const count = Math.floor(randBetween(rng, t.perMonth[0], t.perMonth[1] + 1));
      for (let i = 0; i < count; i++) {
        const day = Math.floor(randBetween(rng, 2, 28));
        const amount = -round2(randBetween(rng, t.min, t.max));
        const merchant = pick(rng, t.merchants);
        out.push({
          id: `${ym}-AU-t${ti}-${i}-${seq++}`,
          accountId: t.accountId ?? AU_ACCOUNT,
          date: `${ym}-${String(day).padStart(2, "0")}`,
          merchant,
          category: t.category,
          amount,
          currency: t.currency ?? "AUD",
        });
      }
    }

    if (rng() > 0.55) {
      out.push({
        id: `travel-${ym}`,
        accountId: US_ACCOUNT,
        date: `${ym}-${String(Math.floor(randBetween(rng, 5, 26))).padStart(2, "0")}`,
        merchant: pick(rng, ["Southwest Airlines", "Airbnb", "Delta", "Marriott"]),
        category: "Travel",
        amount: -round2(randBetween(rng, 180, 620)),
        currency: "USD",
      });
    }
  }

  out.sort((a, b) => (a.date < b.date ? 1 : -1));
  return out;
}

let store: Transaction[] = generate();

async function delay<T>(v: T): Promise<T> {
  await new Promise((r) => setTimeout(r, MOCK_LATENCY_MS));
  return v;
}

export async function fetchTransactions(filter?: {
  accountId?: string;
  category?: TransactionCategory;
  from?: string;
  to?: string;
}) {
  let list = store.slice();
  if (filter?.accountId) list = list.filter((t) => t.accountId === filter.accountId);
  if (filter?.category) list = list.filter((t) => t.category === filter.category);
  if (filter?.from) list = list.filter((t) => t.date >= filter.from!);
  if (filter?.to) list = list.filter((t) => t.date <= filter.to!);
  return delay(list);
}

export async function addTransaction(tx: Omit<Transaction, "id">) {
  const id = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const full: Transaction = { ...tx, id };
  store = [full, ...store];
  return delay(full);
}

export async function deleteTransaction(id: string) {
  store = store.filter((t) => t.id !== id);
  return delay(true);
}
