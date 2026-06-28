import { MediaItemData } from "@/components/artifact/MediaRepeater";

const DB_NAME = "TalasArtifactDraftDB";
const STORE_NAME = "media_drafts";
const DB_VERSION = 1;
const LOCAL_STORAGE_KEY = "talas_artifact_draft_text";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save text draft to localStorage
export function saveDraftText(data: { title: string; content: string; collaborators: string[]; tags?: string[] }) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save draft text to localStorage:", e);
  }
}

// Load text draft from localStorage
export function loadDraftText(): { title: string; content: string; collaborators: string[]; tags?: string[] } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load draft text from localStorage:", e);
    return null;
  }
}

// Save media draft blobs to IndexedDB
export async function saveDraftMedia(items: MediaItemData[]) {
  if (typeof window === "undefined") return;
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Clear existing
    await new Promise((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = resolve;
      clearReq.onerror = reject;
    });

    // Save each item with its Blob
    for (const item of items) {
      let blobToSave = item.blob;
      if (!blobToSave && item.url.startsWith("blob:")) {
        try {
          const res = await fetch(item.url);
          blobToSave = await res.blob();
        } catch (fetchErr) {
          // ignore
        }
      }

      store.put({
        id: item.id,
        blob: blobToSave,
        caption: item.caption || "",
        aspect: item.aspect,
      });
    }
  } catch (e) {
    console.error("Failed to save draft media to IndexedDB:", e);
  }
}

// Load media draft blobs from IndexedDB
export async function loadDraftMedia(): Promise<MediaItemData[]> {
  if (typeof window === "undefined") return [];
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const records: Array<{ id: string; blob: Blob; caption?: string; aspect: "4:3" | "16:9" }> =
      await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

    return records.map((rec) => {
      const url = rec.blob ? URL.createObjectURL(rec.blob) : "";
      return {
        id: rec.id,
        url,
        blob: rec.blob,
        caption: rec.caption,
        aspect: rec.aspect,
      };
    });
  } catch (e) {
    console.error("Failed to load draft media from IndexedDB:", e);
    return [];
  }
}

// Clear all drafts
export async function clearArtifactDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();
  } catch (e) {
    console.error("Failed to clear artifact draft:", e);
  }
}
