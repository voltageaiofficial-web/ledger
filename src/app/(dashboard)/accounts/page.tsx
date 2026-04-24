"use client";

import { Suspense } from "react";
import {
  useAccounts,
  useFxRates,
  useTransactions,
} from "@/lib/hooks/use-overview-data";
import { AccountCard } from "@/components/accounts/account-card";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { Skeleton } from "@/components/ui/skeleton";

function AccountsContent() {
  const { data: accounts } = useAccounts();
  const { data: fxRates } = useFxRates();
  const { data: transactions } = useTransactions();

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Account balances">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Balances
          </h2>
          {accounts && (
            <AddTransactionDialog
              accounts={accounts.map((a) => ({
                id: a.id,
                name: a.name,
                institution: a.institution,
                currency: a.currency,
              }))}
            />
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {accounts
            ? accounts.map((a) => (
                <AccountCard key={a.id} account={a} fxRates={fxRates} />
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[132px] rounded-[var(--radius-card)]" />
              ))}
        </div>
      </section>

      <section aria-label="Transactions">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Transactions
        </h2>
        <TransactionsTable
          transactions={transactions}
          accounts={
            accounts?.map((a) => ({
              id: a.id,
              name: a.name,
              institution: a.institution,
            })) ?? []
          }
        />
      </section>
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense fallback={<div className="h-[400px]" />}>
      <AccountsContent />
    </Suspense>
  );
}
