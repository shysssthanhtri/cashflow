ALTER TABLE public.transactions ADD COLUMN client_id uuid;

-- Lets retried batch pushes from the client be idempotent.
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_household_client_id_key UNIQUE (household_id, client_id);
