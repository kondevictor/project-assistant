INSERT INTO "DocumentTemplate" ("id", "name", "type", "description", "content", "createdAt", "updatedAt")
VALUES
  ('tpl-ncnda', 'NCNDA', 'ncnda', 'Non-Compete Non-Disclosure Agreement', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('tpl-mou', 'MOU', 'mou', 'Memorandum of Understanding', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('tpl-mandate', 'Mandate', 'mandate', 'Mandate Agreement', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('tpl-partnership', 'Partnership', 'partnership', 'Partnership Agreement', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;