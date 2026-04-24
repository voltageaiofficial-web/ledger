"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAccounts,
  fetchAllHoldings,
  fetchFxRates,
  fetchMonthlySummary,
  fetchNetWorthSeries,
  fetchTransactions,
} from "@/lib/mock";

export function useAccounts() {
  return useQuery({ queryKey: ["accounts"], queryFn: fetchAccounts });
}

export function useHoldings() {
  return useQuery({ queryKey: ["holdings"], queryFn: fetchAllHoldings });
}

export function useFxRates() {
  return useQuery({ queryKey: ["fx"], queryFn: fetchFxRates });
}

export function useNetWorthSeries() {
  return useQuery({
    queryKey: ["net-worth-series"],
    queryFn: fetchNetWorthSeries,
  });
}

export function useMonthlySummary() {
  return useQuery({
    queryKey: ["monthly-summary"],
    queryFn: fetchMonthlySummary,
  });
}

export function useTransactions(filter?: Parameters<typeof fetchTransactions>[0]) {
  return useQuery({
    queryKey: ["transactions", filter],
    queryFn: () => fetchTransactions(filter),
  });
}
