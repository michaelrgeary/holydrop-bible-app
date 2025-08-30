-- Seed file for initial development data
-- This will only run in development environments

-- Note: In a real scenario, you would first create users through Supabase Auth
-- For now, we'll create sample profile entries

-- Sample profiles (these IDs would normally come from auth.users)
insert into public.profiles (id, username, email) values
  ('11111111-1111-1111-1111-111111111111', 'john_doe', 'john@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'jane_smith', 'jane@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'bible_scholar', 'scholar@example.com')
on conflict do nothing;

-- Sample annotations for Genesis 1:1
insert into public.annotations (user_id, book, chapter, verse, text) values
  ('11111111-1111-1111-1111-111111111111', 'Genesis', 1, 1, 'The Hebrew word "bara" (created) implies creation ex nihilo - out of nothing. This demonstrates God''s absolute sovereignty and power.'),
  ('22222222-2222-2222-2222-222222222222', 'Genesis', 1, 1, 'Notice the Trinity implied here: God (Father), the Spirit hovering over the waters (verse 2), and the Word speaking creation into existence (John 1:1).'),
  ('33333333-3333-3333-3333-333333333333', 'Genesis', 1, 1, '"In the beginning" - Not just a temporal marker, but establishing God as the origin of all things, outside of time itself.')
on conflict do nothing;

-- Sample annotations for John 3:16
insert into public.annotations (user_id, book, chapter, verse, text) values
  ('11111111-1111-1111-1111-111111111111', 'John', 3, 16, 'The word "world" (Greek: kosmos) emphasizes the universal scope of God''s love - not just Israel, but all humanity.'),
  ('22222222-2222-2222-2222-222222222222', 'John', 3, 16, '"Gave" is in the aorist tense, pointing to a specific, completed act - the crucifixion. God''s love is not abstract but demonstrated in history.'),
  ('33333333-3333-3333-3333-333333333333', 'John', 3, 16, 'This verse is the gospel in miniature: God''s love, Christ''s sacrifice, our faith, eternal life. Everything essential is here.')
on conflict do nothing;

-- Add some sample votes
insert into public.votes (user_id, annotation_id, vote_type)
select 
  '11111111-1111-1111-1111-111111111111',
  id,
  'up'
from public.annotations
where user_id = '22222222-2222-2222-2222-222222222222'
limit 2
on conflict do nothing;

insert into public.votes (user_id, annotation_id, vote_type)
select 
  '22222222-2222-2222-2222-222222222222',
  id,
  'up'
from public.annotations
where user_id = '33333333-3333-3333-3333-333333333333'
limit 2
on conflict do nothing;