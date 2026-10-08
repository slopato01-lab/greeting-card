/**
 * Хранилище фото черновика — IndexedDB браузера.
 *
 * Сам черновик (слои, тексты, анимация) лежит в localStorage: он мал
 * и пишется раз в три секунды. Фото туда не влезут — у localStorage
 * около 5 МБ на сайт, а одно фото до 1 МБ. Поэтому фото кладутся сюда
 * один раз, при добавлении, а слой хранит только id.
 *
 * Все функции глотают ошибки: в приватном режиме Safari и во встроенных
 * браузерах IndexedDB бывает недоступна. Тогда фото живут только
 * до перезагрузки, а редактор продолжает работать.
 */

const DB_NAME = "otkrytochka-editor";
const STORE = "assets";

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | null,
): Promise<T | null> {
  const db = await openDb();
  if (db === null) return null;
  try {
    return await new Promise<T | null>((resolve) => {
      const tx = db.transaction(STORE, mode);
      const request = run(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request === null ? null : request.result);
      tx.onerror = () => resolve(null);
      tx.onabort = () => resolve(null);
    });
  } catch {
    return null;
  } finally {
    db.close();
  }
}

export async function putAsset(id: string, blob: Blob): Promise<boolean> {
  const done = await withStore("readwrite", (store) => store.put(blob, id));
  return done !== null;
}

export async function getAsset(id: string): Promise<Blob | null> {
  const value = await withStore<unknown>("readonly", (store) => store.get(id));
  return value instanceof Blob ? value : null;
}

/**
 * Удаляет фото, на которые больше не ссылается черновик. Зовётся после
 * записи черновика: удалённый слой не должен держать мегабайт в браузере.
 */
export async function pruneAssets(keep: ReadonlySet<string>): Promise<void> {
  const keys = await withStore<IDBValidKey[]>("readonly", (store) => store.getAllKeys());
  if (keys === null) return;
  const stale = keys.filter((key) => typeof key === "string" && !keep.has(key));
  if (stale.length === 0) return;
  await withStore("readwrite", (store) => {
    for (const key of stale) store.delete(key);
    return null;
  });
}
