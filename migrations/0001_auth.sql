-- Вход по коду на почту (09.10.2026). Описание — docs/SECURITY.md, «Аккаунты».
-- Время везде — секунды Unix. Коды и токены сессий хранятся только хэшами.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  -- Бесплатные открытки без водяного знака: две после регистрации
  -- (модель денег, docs/PRODUCT.md). Пока только показывается.
  free_left INTEGER NOT NULL DEFAULT 2
);

-- Один действующий код на почту. Строка живёт и после входа как
-- счётчик отправок: по нему ограничивается частота писем.
CREATE TABLE login_codes (
  email TEXT PRIMARY KEY,
  code_hash TEXT,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  sent_at INTEGER NOT NULL,
  window_start INTEGER NOT NULL,
  window_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX sessions_user ON sessions (user_id);
