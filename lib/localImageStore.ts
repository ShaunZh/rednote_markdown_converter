const LOCAL_IMAGE_DB_NAME = 'rednote-local-images';
const LOCAL_IMAGE_DB_VERSION = 1;
const LOCAL_IMAGE_STORE_NAME = 'images';
const LOCAL_IMAGE_PREFIX = 'rednote-local://image/';

interface LocalImageRecord {
  id: string;
  blob: Blob;
  createdAt: number;
  name: string;
}

export type LocalImageRenderMode = 'blob-url' | 'data-url';

const objectUrlCache = new Map<string, string>();
const dataUrlCache = new Map<string, string>();
const pendingRenderSrcCache = new Map<string, Promise<string | null>>();

let openDbPromise: Promise<IDBDatabase> | null = null;

function getDatabase(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('当前浏览器不支持本地图片存储'));
  }

  if (openDbPromise) {
    return openDbPromise;
  }

  openDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(LOCAL_IMAGE_DB_NAME, LOCAL_IMAGE_DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(LOCAL_IMAGE_STORE_NAME)) {
        database.createObjectStore(LOCAL_IMAGE_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('打开本地图片存储失败'));
  });

  return openDbPromise;
}

function createLocalImageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `img-${crypto.randomUUID()}`;
  }

  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('本地图片存储失败'));
    transaction.onabort = () => reject(transaction.error ?? new Error('本地图片存储已中止'));
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('本地图片读取失败'));
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('本地图片转换失败'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('本地图片转换失败'));
    reader.readAsDataURL(blob);
  });
}

export function createLocalImageMarkdownSrc(id: string): string {
  return `${LOCAL_IMAGE_PREFIX}${id}`;
}

export function parseLocalImageId(src: string | null | undefined): string | null {
  if (!src || !src.startsWith(LOCAL_IMAGE_PREFIX)) {
    return null;
  }

  return src.slice(LOCAL_IMAGE_PREFIX.length) || null;
}

export function isLocalImageMarkdownSrc(src: string | null | undefined): boolean {
  return parseLocalImageId(src) !== null;
}

export async function saveLocalImage(file: File): Promise<string> {
  const database = await getDatabase();
  const id = createLocalImageId();
  const transaction = database.transaction(LOCAL_IMAGE_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(LOCAL_IMAGE_STORE_NAME);

  store.put({
    id,
    blob: file,
    createdAt: Date.now(),
    name: file.name,
  } satisfies LocalImageRecord);

  await waitForTransaction(transaction);
  return id;
}

async function getLocalImageRecord(id: string): Promise<LocalImageRecord | null> {
  const database = await getDatabase();
  const transaction = database.transaction(LOCAL_IMAGE_STORE_NAME, 'readonly');
  const store = transaction.objectStore(LOCAL_IMAGE_STORE_NAME);
  const result = await requestToPromise<LocalImageRecord | undefined>(store.get(id));
  return result ?? null;
}

export async function resolveLocalImageRenderSrc(
  src: string | null | undefined,
  renderMode: LocalImageRenderMode = 'blob-url'
): Promise<string | null> {
  const localImageId = parseLocalImageId(src);
  if (!localImageId) {
    return src ?? null;
  }

  if (renderMode === 'data-url') {
    const cachedDataUrl = dataUrlCache.get(localImageId);
    if (cachedDataUrl) {
      return cachedDataUrl;
    }
  } else {
    const cachedObjectUrl = objectUrlCache.get(localImageId);
    if (cachedObjectUrl) {
      return cachedObjectUrl;
    }
  }

  const pendingCacheKey = `${renderMode}:${localImageId}`;
  const pending = pendingRenderSrcCache.get(pendingCacheKey);
  if (pending) {
    return pending;
  }

  const nextPromise = getLocalImageRecord(localImageId)
    .then(async (record) => {
      if (!record) {
        return null;
      }

      if (renderMode === 'data-url') {
        const dataUrl = await blobToDataUrl(record.blob);
        dataUrlCache.set(localImageId, dataUrl);
        return dataUrl;
      }

      const objectUrl = URL.createObjectURL(record.blob);
      objectUrlCache.set(localImageId, objectUrl);
      return objectUrl;
    })
    .finally(() => {
      pendingRenderSrcCache.delete(pendingCacheKey);
    });

  pendingRenderSrcCache.set(pendingCacheKey, nextPromise);
  return nextPromise;
}
