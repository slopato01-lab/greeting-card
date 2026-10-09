-- Лимиты частоты запросов (09.10.2026). Описание — docs/SECURITY.md,
-- «Лимиты запросов». Ключ — SHA-256 от «область:IP», сам IP не хранится;
-- общий потолок писем — строка с ключом «mail:day».
-- Строки старше суток удаляются при каждом запросе кода.

CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);

CREATE INDEX rate_limits_window ON rate_limits (window_start);
