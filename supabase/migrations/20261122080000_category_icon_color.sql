ALTER TABLE public.categories
  ADD COLUMN icon  TEXT NOT NULL DEFAULT 'tag',
  ADD COLUMN color TEXT NOT NULL DEFAULT '#64748b' CHECK (color ~ '^#[0-9a-fA-F]{6}$');
