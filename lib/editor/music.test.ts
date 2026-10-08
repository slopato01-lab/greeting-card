/**
 * Разбор ссылок Яндекс Музыки: во фрейм уходит только адрес Яндекса
 * с числовыми id, что бы человек ни вставил.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import { parseYandexLink, yandexEmbedUrl } from "./music.ts";

test("ссылка из «Поделиться» и код для вставки дают один трек", () => {
  const expected = { kind: "yandex", album: "4766", track: "57703" };
  for (const input of [
    "https://music.yandex.ru/album/4766/track/57703",
    "https://music.yandex.by/album/4766/track/57703?utm_source=share",
    "music.yandex.ru/album/4766/track/57703",
    '<iframe frameborder="0" src="https://music.yandex.ru/iframe/album/4766/track/57703"></iframe>',
    "https://music.yandex.ru/iframe/#track/57703/4766",
  ]) {
    assert.deepEqual(parseYandexLink(input), expected, input);
  }
});

test("чужой домен, плейлист и мусор не проходят", () => {
  for (const input of [
    "https://evil.example/album/4766/track/57703",
    "https://music.yandex.ru.evil.example/album/4766/track/57703",
    "https://music.yandex.ru/users/someone/playlists/3",
    "javascript:alert(1)",
    "",
  ]) {
    assert.equal(parseYandexLink(input), null, input);
  }
});

test("адрес фрейма собирается только из id", () => {
  assert.equal(
    yandexEmbedUrl({ album: "4766", track: "57703" }),
    "https://music.yandex.ru/iframe/album/4766/track/57703",
  );
});
