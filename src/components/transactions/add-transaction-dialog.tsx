"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { addTransaction } from "@/lib/mock/transactions";
import type { Transaction, TransactionCategory, Currency } from "@/lib/types";

const CATEGORIES: TransactionCategory[] = [
  "Groceries",
  "Dining",
  "Transport",
  "Subscriptions",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Shopping",
  "Travel",
  "Other",
];

const schema = z.object({
  merchant: z.string().min(1, "Required").max(60),
  category: z.enum([
    "Groceries",
    "Dining",
    "Transport",
    "Subscriptions",
    "Utilities",
    "Healthcare",
    "Entertainment",
    "Shopping",
    "Travel",
    "Other",
  ]),
  amount: z.number({ error: "Must be a number" }).positive("Must be positive"),
  accountId: z.string().min(1),
  date: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function AddTransactionDialog({
  accounts,
  openDefault = false,
  onOpenChange,
}: {
  accounts: { id: string; name: string; institution: string; currency: Currency }[];
  openDefault?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(openDefault);
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      merchant: "",
      category: "Groceries",
      amount: 0,
      accountId: accounts[0]?.id ?? "",
      date: today,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const acc = accounts.find((a) => a.id === values.accountId);
      const tx: Omit<Transaction, "id"> = {
        accountId: values.accountId,
        date: values.date,
        merchant: values.merchant,
        category: values.category,
        amount: -Math.abs(values.amount),
        currency: acc?.currency ?? "USD",
      };
      return addTransaction(tx);
    },
    onMutate: async (values) => {
      await qc.cancelQueries({ queryKey: ["transactions"] });
      const previous = qc.getQueriesData({ queryKey: ["transactions"] });
      const optimistic: Transaction = {
        id: `tx-optimistic-${Date.now()}`,
        accountId: values.accountId,
        date: values.date,
        merchant: values.merchant,
        category: values.category,
        amount: -Math.abs(values.amount),
        currency: accounts.find((a) => a.id === values.accountId)?.currency ?? "USD",
      };
      qc.setQueriesData<Transaction[]>(
        { queryKey: ["transactions"] },
        (old) => (old ? [optimistic, ...old] : [optimistic]),
      );
      return { previous };
    },
    onError: (_err, _values, ctx) => {
      ctx?.previous.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const onSubmit = async (values: FormValues) => {
    await mutation.mutateAsync(values);
    reset({ ...values, merchant: "", amount: 0 });
    setOpen(false);
    onOpenChange?.(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        onOpenChange?.(v);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="primary" size="sm">
          <Plus className="size-4" />
          Add transaction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
          <DialogDescription>
            Records a new expense against the selected account. Changes persist
            for this session.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
          aria-label="Add transaction form"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="merchant">Merchant</Label>
            <Input id="merchant" {...register("merchant")} placeholder="e.g. Franklin BBQ" />
            {errors.merchant && (
              <span className="text-xs text-[var(--color-negative)]">
                {errors.merchant.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Category</Label>
              <Select id="category" {...register("category")}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <span className="text-xs text-[var(--color-negative)]">
                  {errors.amount.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="account">Account</Label>
              <Select id="account" {...register("accountId")}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.institution} · {a.currency}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
