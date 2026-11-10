-- ============================================================================
-- Learning to Draw — reviews: 🚩 flags, faces (how it went), right/wrong results, print log
-- Family Supabase project. Signed-in family account only. Prefix: ltd_  App: learning-to-draw
-- Safe to re-run. Test first with test_001_reviews_rollback.sql.
--
-- One row per review. kind:
--   flag    a sheet to rework (reason, note); status open until fixed / replaced / kept
--   rating  a face for one child: score 1 too easy · 2 just right · 3 too hard (status done)
--   result  one question answered: score 1 right · 0 wrong · null skipped (status done)
--   printed the sheet was printed (status done)
-- who is 'younger' / 'older' / '' (no names in this table). code is the sheets (LD- codes).
-- Pages keep reviews on the device first and sync here when signed in (newest updated_at wins).
-- ============================================================================

create table if not exists public.ltd_reviews (
    id          uuid primary key default gen_random_uuid(),
    code        text not null,
    kind        text not null check (kind in ('flag', 'rating', 'result', 'printed')),
    reason      text not null default '',
    who         text not null default '' check (who in ('', 'younger', 'older')),
    score       smallint check (score between 0 and 3),
    note        text not null default '',
    status      text not null default 'open' check (status in ('open', 'fixed', 'replaced', 'kept', 'done')),
    resolution  text not null default '',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    resolved_at timestamptz,
    unique (code, kind, created_at)
);
alter table public.ltd_reviews enable row level security;
create index if not exists ltd_reviews_open on public.ltd_reviews (code) where kind = 'flag' and status = 'open';

drop policy if exists "Authenticated can manage ltd_reviews" on public.ltd_reviews;
create policy "Authenticated can manage ltd_reviews" on public.ltd_reviews for all to authenticated using (true) with check (true);
revoke all on public.ltd_reviews from anon;
comment on table public.ltd_reviews is 'Learning to Draw: flags, faces, results and prints per sheets (LD- codes). Synced from the pages; read by the review skills.';

insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
select 'learning-to-draw', 'ltd_reviews', 'table', 'owner', 'Learning to Draw reviews: flags, faces, right/wrong results, print log.', 'ShimmyCane/Learning-to-Draw'
where not exists (select 1 from public.app_table_registry where app = 'learning-to-draw' and object_name = 'ltd_reviews');

-- Check: this should list only other apps' objects, never ltd_*.
-- select * from public.app_table_unregistered;
