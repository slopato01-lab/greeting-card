-- Открытки, на которые уже потрачена бесплатная (09.10.2026).
-- Повторное сохранение той же открытки без водяного знака лимит не тратит.
-- card_key — id шаблона редактора или «free» для свободного холста.

CREATE TABLE user_cards (
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  card_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, card_key)
);
