"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type DragEvent,
} from "react";

import { Button } from "@/components/Button";
import { CardView } from "@/components/card/CardView";
import { GhostButton } from "@/components/GhostButton";
import { pillVisual } from "@/components/site/pill";
import {
  SURPRISE_KINDS,
  type CardContent,
  type CardPhoto,
  type SurpriseKind,
} from "@/lib/card/content";
import {
  CATALOG_FILTERS,
  GAMES,
  type CatalogFilter,
  type GameKey,
  templateBySlug,
} from "@/lib/catalog/templates";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Конструктор открытки: шесть шагов из docs/PRODUCT.md.
 *
 * Что здесь настоящее: переходы между шагами, выбор повода и игры,
 * разбор и проверка выбранных файлов, тексты, черновик в localStorage
 * каждые три секунды, сводка в финале и превью — экран получателя
 * из собранного черновика.
 *
 * Превью раскрывается на месте шага и подменяет его содержимое, а не
 * накрывает страницу слоем: так не нужны ни оверлей, ни блокировка
 * прокрутки, ни ловушка фокуса — тем же решением живёт панель меню
 * в components/site/Header.tsx. Отдельным адресом превью быть не может:
 * фотографии существуют только в этой вкладке (см. ниже), и по ссылке
 * открытка приехала бы без единого снимка.
 *
 * Чего здесь нет намеренно:
 *
 * - **Загрузки на сервер.** Фотографии живут только в этой вкладке,
 *   через `URL.createObjectURL`. По docs/SECURITY.md каждое изображение
 *   обязано пересохраняться на сервере (EXIF, ориентация, полезная
 *   нагрузка внутри файла), а сервера ещё нет. Проверки размера и типа
 *   ниже — это удобство, а не безопасность: настоящая проверка идёт
 *   по сигнатуре файла и только на сервере.
 * - **Оплаты.** Кнопка выключена. По CLAUDE.md открытка создаётся
 *   по вебхуку платёжки, а не по возврату пользователя на сайт,
 *   и до приёма платежей этой кнопке нечего делать.
 * - **Черновика на сервере.** CLAUDE.md требует сохранять и локально,
 *   и на сервере. Работает пока только локальная половина.
 *
 * Фотографии в черновик не пишутся: десять снимков по 10 МБ не влезут
 * в localStorage ни в каком виде. После перезагрузки тексты и выбор
 * на месте, файлы нужно добавить заново.
 */

const STORAGE_KEY = "otkrytochka.draft.v1";
const DRAFT_INTERVAL_MS = 3000;

const MAX_PHOTOS = 10;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif", "image/webp"];
const ALLOWED_EXT = /\.(jpe?g|png|heic|heif|webp)$/i;

/**
 * Параметр перехода со страницы шаблона: /create?t=<slug>. Повод и игру
 * там уже выбрали, спрашивать их второй раз незачем.
 */
const TEMPLATE_PARAM = "t";

/**
 * То, что переживает перезагрузку: содержимое открытки минус файлы
 * плюс повод. Файлов здесь нет намеренно, повода нет в открытке —
 * он выбирает тему и игру, а получателю не показывается.
 */
type Draft = Omit<CardContent, "photos"> & { occasion: CatalogFilter | null };

const EMPTY: Draft = {
  occasion: null,
  game: null,
  greeting: "",
  sign: "",
  surpriseKind: "text",
  surpriseValue: "",
};

const STEP_TITLES = [
  "step.1.title",
  "step.2.title",
  "step.3.title",
  "step.4.title",
  "step.5.title",
  "step.6.title",
] as const satisfies ReadonlyArray<TextKey>;

const STEP_HINTS: ReadonlyArray<TextKey | null> = [
  null,
  "step.2.hint",
  "step.3.hint",
  "step.4.hint",
  "step.5.hint",
  null,
];

const LAST_STEP = STEP_TITLES.length - 1;

/**
 * Сырой черновик из хранилища. В приватном режиме Safari часть хранилищ
 * недоступна и обращение к ним бросает — черновик обязан переживать
 * это без падения, см. docs/TESTING.md.
 *
 * Читается через useSyncExternalStore: на сборке localStorage нет,
 * и серверный снимок обязан отличаться от клиентского без расхождения
 * при гидратации. Подписки нет — черновик меняем только мы сами,
 * и перерисовываться на собственную запись незачем.
 */
function subscribe(): () => void {
  return () => {};
}

function getStoredRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerRaw(): string | null {
  return null;
}

/**
 * Строка запроса. Читается тем же способом, что и черновик: на сборке
 * адреса нет, а серверный снимок обязан отличаться от клиентского без
 * расхождения при гидратации.
 *
 * Не useSearchParams: тот в статическом экспорте требует обёртки
 * в Suspense и взамен ничего не даёт — параметр всё равно приезжает
 * только на клиенте.
 *
 * Подписки нет: на /create ссылок с параметром не бывает, адрес меняется
 * только вместе с монтированием конструктора.
 */
function getSearch(): string {
  return window.location.search;
}

function getServerSearch(): string {
  return "";
}

/** Битый черновик не должен ронять конструктор. */
function parseDraft(raw: string | null): Draft {
  if (raw === null) return EMPTY;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY;

    // Любое поле, которое не совпало по типу, откатывается к пустому.
    const value = parsed as Partial<Record<keyof Draft, unknown>>;
    const kind = value.surpriseKind;
    const game = value.game;
    const occasion = value.occasion;

    return {
      occasion: CATALOG_FILTERS.some((f) => f === occasion) ? (occasion as CatalogFilter) : null,
      game: GAMES.some((g) => g === game) ? (game as GameKey) : null,
      greeting: typeof value.greeting === "string" ? value.greeting : "",
      sign: typeof value.sign === "string" ? value.sign : "",
      surpriseKind: SURPRISE_KINDS.some((k) => k.id === kind) ? (kind as SurpriseKind) : "text",
      surpriseValue: typeof value.surpriseValue === "string" ? value.surpriseValue : "",
    };
  } catch {
    return EMPTY;
  }
}

function Field({
  label,
  hint,
  children,
}: {
  label: TextKey;
  hint?: TextKey;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-[8px]">
      <span className="font-ui text-card xl:text-card-d font-medium">{t(label)}</span>
      {hint === undefined ? null : <span className="font-ui text-note text-muted">{t(hint)}</span>}
      {children}
    </label>
  );
}

const INPUT =
  "font-ui text-card xl:text-card-d border-muted rounded-inner xl:rounded-inner-d " +
  "min-h-tap w-full border bg-white px-[16px] py-[12px] xl:px-[20px] xl:py-[16px]";

export function Constructor() {
  const [step, setStep] = useState(0);

  // Черновик из хранилища — снимок, правки поверх него — состояние.
  // Как только человек что-то поменял, снимок больше не смотрим:
  // писать в хранилище мы будем сами, и перечитывать свою же запись
  // значило бы затирать несохранённые правки последних трёх секунд.
  const storedRaw = useSyncExternalStore(subscribe, getStoredRaw, getServerRaw);
  const stored = useMemo(() => parseDraft(storedRaw), [storedRaw]);

  // Переход со страницы шаблона: /create?t=<slug> ставит повод и игру.
  // Выбор из ссылки выигрывает у черновика — человек только что нажал
  // «Создать открытку» на конкретном шаблоне, это свежее намерение.
  // Тексты, фотографии и сюрприз параметр не трогает: их не выбирали.
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const fromTemplate = useMemo(
    () => templateBySlug(new URLSearchParams(search).get(TEMPLATE_PARAM) ?? ""),
    [search],
  );

  const base = useMemo(
    () =>
      fromTemplate === undefined
        ? stored
        : { ...stored, occasion: fromTemplate.filter, game: fromTemplate.game },
    [stored, fromTemplate],
  );

  const [edits, setEdits] = useState<Draft | null>(null);
  const draft = edits ?? base;

  const update = (patch: Partial<Draft>) => setEdits({ ...draft, ...patch });

  const [photos, setPhotos] = useState<ReadonlyArray<CardPhoto>>([]);
  const [photoError, setPhotoError] = useState<TextKey | null>(null);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  const nextId = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepStarted = useRef(false);
  const createdUrls = useRef<Set<string>>(new Set());

  // Раз в три секунды, как требует CLAUDE.md. Пишем по таймеру,
  // а не на каждое нажатие клавиши: иначе на длинном тексте это
  // сотни обращений к диску.
  useEffect(() => {
    const timer = window.setInterval(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        setSaved(true);
      } catch {
        // Приватный режим Safari: сохранить некуда, но работу
        // это не останавливает.
        setSaved(false);
      }
    }, DRAFT_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [draft]);

  // Ссылки на файлы живут, пока живёт вкладка, и держат файлы в памяти.
  // Выданные ссылки копятся в ref, а не берутся из состояния: иначе
  // эффект пришлось бы пересоздавать на каждое добавленное фото,
  // и он отзывал бы ссылки, которые ещё показываются.
  useEffect(() => {
    const urls = createdUrls.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  // После перехода фокус уходит на заголовок нового шага: иначе с
  // клавиатуры он остаётся на кнопке «Дальше», которая уже уехала.
  // Первый рендер пропускаем — там фокус ничего не терял.
  //
  // Возврат из превью — тот же случай: кнопки «Назад» на странице
  // больше нет. Пока превью раскрыто, заголовка шага в документе нет
  // и фокусировать нечего — фокус в это время держит сам экран
  // получателя.
  useEffect(() => {
    if (!stepStarted.current) {
      stepStarted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step, preview]);

  const addFiles = (files: FileList) => {
    const accepted: CardPhoto[] = [];
    let error: TextKey | null = null;

    for (const file of Array.from(files)) {
      if (photos.length + accepted.length >= MAX_PHOTOS) break;

      // HEIC с айфона в части браузеров приезжает с пустым type —
      // тогда судим по расширению. Настоящая проверка всё равно
      // будет на сервере, по сигнатуре файла.
      const typeOk = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXT.test(file.name);
      if (!typeOk) {
        error = "error.photoFormat";
        continue;
      }
      if (file.size > MAX_BYTES) {
        error = "error.photoTooBig";
        continue;
      }

      nextId.current += 1;
      const url = URL.createObjectURL(file);
      createdUrls.current.add(url);
      accepted.push({ id: nextId.current, name: file.name, url });
    }

    setPhotoError(error);
    if (accepted.length > 0) setPhotos((current) => [...current, ...accepted]);
  };

  const removePhoto = (id: number) => {
    setPhotos((current) => {
      const gone = current.find((photo) => photo.id === id);
      if (gone !== undefined) {
        URL.revokeObjectURL(gone.url);
        createdUrls.current.delete(gone.url);
      }
      return current.filter((photo) => photo.id !== id);
    });
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  };

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files !== null) addFiles(event.target.files);
    // Иначе повторный выбор того же файла не даёт события change.
    event.target.value = "";
  };

  // Первые два шага — выбор, без него дальше идти незачем. Остальные
  // можно пропустить: открытка без подписи существует, без игры нет.
  const canGoNext =
    step === 0 ? draft.occasion !== null : step === 1 ? draft.game !== null : step < LAST_STEP;

  const summary: ReadonlyArray<{ label: TextKey; value: string }> = [
    {
      label: "create.summary.occasion",
      value: draft.occasion === null ? t("create.summary.empty") : t(draft.occasion),
    },
    {
      label: "create.summary.game",
      value: draft.game === null ? t("create.summary.empty") : t(draft.game),
    },
    {
      label: "create.summary.photos",
      value: photos.length === 0 ? t("create.summary.empty") : String(photos.length),
    },
    {
      label: "create.summary.words",
      value: draft.greeting.trim() === "" ? t("create.summary.empty") : draft.greeting,
    },
    {
      label: "create.summary.surprise",
      value: draft.surpriseValue.trim() === "" ? t("create.summary.empty") : draft.surpriseValue,
    },
  ];

  const hint = STEP_HINTS[step];

  // Превью занимает место шага целиком: полоса прогресса и заголовок
  // «Всё готово» рядом с открыткой получателя только мешают — человек
  // смотрит не на шаг конструктора, а на то, что получил адресат.
  // Шапка сайта остаётся: выход со страницы должен быть виден всегда.
  if (preview) {
    return (
      <div className="page-shell pt-[30px] pb-[70px] xl:pt-[50px] xl:pb-[120px]">
        <CardView
          card={{
            game: draft.game,
            greeting: draft.greeting,
            sign: draft.sign,
            surpriseKind: draft.surpriseKind,
            surpriseValue: draft.surpriseValue,
            photos,
          }}
          onExit={() => setPreview(false)}
        />
      </div>
    );
  }

  return (
    <div className="page-shell pt-[30px] pb-[70px] xl:pt-[50px] xl:pb-[120px]">
      {/* Полоса прогресса декоративная: то же самое сказано словами
          строкой выше, и скринридер читает именно её. */}
      <p className="font-ui text-note text-muted">
        {t("create.step")} {step + 1} {t("create.of")} {STEP_TITLES.length}
      </p>
      <div aria-hidden="true" className="bg-line mt-[10px] h-[6px] w-full rounded-full">
        <div
          className="bg-pink h-full rounded-full transition-[width]"
          style={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }}
        />
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-h2 xl:text-h2-d mt-[24px] font-semibold tracking-tight xl:mt-[40px]"
      >
        {t(STEP_TITLES[step] ?? "step.1.title")}
      </h2>

      {hint === undefined || hint === null ? null : (
        <p className="font-ui text-card xl:text-card-d text-body mt-[10px] leading-[1.4]">
          {t(hint)}
        </p>
      )}

      <div className="mt-[30px] xl:mt-[45px]">
        {/* ── 1. Повод ─────────────────────────────────────── */}
        {step === 0 ? (
          <div className="flex flex-wrap gap-[10px] xl:gap-5">
            {CATALOG_FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={draft.occasion === key}
                onClick={() => update({ occasion: key })}
                className="pill-tap"
              >
                <span className={pillVisual("canvas", draft.occasion === key)}>{t(key)}</span>
              </button>
            ))}
          </div>
        ) : null}

        {/* ── 2. Игра ──────────────────────────────────────── */}
        {step === 1 ? (
          <ul role="list" className="grid gap-[20px] xl:grid-cols-3 xl:gap-5">
            {GAMES.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  aria-pressed={draft.game === key}
                  onClick={() => update({ game: key })}
                  className={
                    "rounded-card xl:rounded-card-d flex w-full flex-col border-2 bg-white p-[8px] text-left transition-colors " +
                    (draft.game === key ? "border-pink" : "hover:border-line border-transparent")
                  }
                >
                  {/* Живого превью нет: игровых модулей ещё не существует. */}
                  <span
                    aria-hidden="true"
                    className="bg-photo rounded-inner block h-[150px] w-full"
                  />
                  <span className="font-display text-h3 xl:text-h3-d px-[12px] py-[14px] font-semibold tracking-tight">
                    {t(key)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {/* ── 3. Фото ──────────────────────────────────────── */}
        {step === 2 ? (
          <div>
            <label
              onDrop={onDrop}
              onDragOver={(event) => event.preventDefault()}
              className="border-muted rounded-card xl:rounded-card-d hover:bg-canvas flex min-h-[160px] cursor-pointer flex-col items-center justify-center border-2 border-dashed bg-white px-[20px] py-[30px] text-center transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-black"
            >
              <span className="font-ui text-card xl:text-card-d font-medium">
                {t("create.photos.pick")}
              </span>
              <span className="font-ui text-note text-muted mt-[8px]">
                {t("create.photos.limit")}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
                multiple
                onChange={onPick}
                className="sr-only"
              />
            </label>

            {photoError === null ? null : (
              <p role="alert" className="font-ui text-card text-pink mt-[14px] leading-[1.4]">
                {t(photoError)}
              </p>
            )}

            {photos.length === 0 ? (
              <p className="font-ui text-card xl:text-card-d text-body mt-[20px] leading-[1.4]">
                {t("empty.photos")}
              </p>
            ) : (
              <>
                <p className="font-ui text-note text-muted mt-[20px]">
                  {t("create.photos.count")} {photos.length} / {MAX_PHOTOS}
                </p>
                <ul role="list" className="mt-[12px] grid grid-cols-2 gap-[12px] xl:grid-cols-5">
                  {photos.map((photo) => (
                    <li key={photo.id} className="relative">
                      {/* Обычный img: оптимизатор Next в статическом
                          экспорте недоступен, а это и не файл сборки —
                          это blob из вкладки пользователя. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt=""
                        className="rounded-inner aspect-square w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        aria-label={t("create.photos.remove")}
                        className="bg-ink absolute top-[6px] right-[6px] flex size-[32px] items-center justify-center rounded-full text-white"
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : null}

        {/* ── 4. Слова ─────────────────────────────────────── */}
        {step === 3 ? (
          <div className="flex flex-col gap-[24px] xl:max-w-[800px]">
            <Field label="create.words.greeting">
              <textarea
                rows={3}
                value={draft.greeting}
                onChange={(event) => update({ greeting: event.target.value })}
                className={INPUT}
              />
            </Field>

            <Field label="create.words.sign">
              <textarea
                rows={2}
                value={draft.sign}
                onChange={(event) => update({ sign: event.target.value })}
                className={INPUT}
              />
            </Field>
          </div>
        ) : null}

        {/* ── 5. Сюрприз ───────────────────────────────────── */}
        {step === 4 ? (
          <div className="flex flex-col gap-[24px] xl:max-w-[800px]">
            <fieldset>
              <legend className="font-ui text-card xl:text-card-d font-medium">
                {t("create.surprise.kind")}
              </legend>
              <div className="mt-[12px] flex flex-wrap gap-[10px]">
                {SURPRISE_KINDS.map((kind) => (
                  <button
                    key={kind.id}
                    type="button"
                    aria-pressed={draft.surpriseKind === kind.id}
                    onClick={() => update({ surpriseKind: kind.id })}
                    className="pill-tap"
                  >
                    <span className={pillVisual("canvas", draft.surpriseKind === kind.id)}>
                      {t(kind.label)}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <Field label="create.surprise.value">
              <textarea
                rows={3}
                value={draft.surpriseValue}
                onChange={(event) => update({ surpriseValue: event.target.value })}
                className={INPUT}
              />
            </Field>
          </div>
        ) : null}

        {/* ── 6. Готово ────────────────────────────────────── */}
        {step === LAST_STEP ? (
          <div>
            <p className="font-ui text-card xl:text-card-d text-body leading-[1.4] xl:max-w-[900px]">
              {t("create.done.lead")}
            </p>

            <dl className="rounded-card xl:rounded-card-d mt-[24px] flex flex-col gap-[16px] bg-white px-[22px] py-[24px] xl:mt-[40px] xl:px-[40px] xl:py-[34px]">
              {summary.map((row) => (
                <div key={row.label} className="flex flex-col gap-[2px] xl:flex-row xl:gap-[20px]">
                  <dt className="font-ui text-note-d text-muted xl:w-[220px] xl:shrink-0">
                    {t(row.label)}
                  </dt>
                  <dd className="font-ui text-card xl:text-card-d break-words">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-[30px] flex flex-col gap-[10px] xl:mt-[45px]">
              {/* Единственное живое действие этого шага. Оплаты нет,
                  и до неё превью — это и есть конец пути: посмотреть,
                  что получилось, и вернуться править. */}
              <Button
                labelKey="cta.preview"
                onClick={() => setPreview(true)}
                className="xl:w-[450px]"
              />
              <Button labelKey="cta.pay" disabled className="xl:w-[450px]" />
              <p className="font-ui text-note text-muted">{t("create.pay.soon")}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Навигация ──────────────────────────────────────── */}
      {step === LAST_STEP ? null : (
        <div className="mt-[40px] flex flex-col gap-[5px] xl:mt-[60px] xl:flex-row xl:gap-5">
          <Button
            labelKey="cta.next"
            disabled={!canGoNext}
            onClick={() => setStep((value) => Math.min(value + 1, LAST_STEP))}
            className="xl:w-[360px]"
          />
          <GhostButton
            labelKey="cta.back"
            disabled={step === 0}
            onClick={() => setStep((value) => Math.max(value - 1, 0))}
            className="xl:w-[360px]"
          />
        </div>
      )}

      {step === LAST_STEP ? (
        <div className="mt-[24px]">
          <GhostButton
            labelKey="cta.back"
            onClick={() => setStep((value) => Math.max(value - 1, 0))}
            className="xl:w-[360px]"
          />
        </div>
      ) : null}

      <p className="font-ui text-note text-muted mt-[30px]">
        {t("create.draft.local")}
        {saved ? ` ${t("create.draft.saved")}.` : ""}
      </p>
    </div>
  );
}
