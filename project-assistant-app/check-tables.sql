DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name
  LOOP
    RAISE NOTICE '%', r.table_name;
  END LOOP;
END $$;