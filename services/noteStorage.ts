import type { Note, Collection } from "../types";

export const NOTES_STORAGE_KEY = "azura-notes";
export const COLLECTIONS_STORAGE_KEY = "azura-note-collections";
export const NOTES_UPDATED_EVENT = "azura-notes-updated";
export const COLLECTIONS_UPDATED_EVENT = "azura-collections-updated";

const DEFAULT_NOTES: Note[] = [
  {
    id: "1",
    userId: "u1",
    type: "text",
    title: "Grocery List",
    content_text: "Milk, Bread, Cheese, Apples",
    tags: ["shopping", "home"],
    createdAt: new Date("2024-05-20"),
    updatedAt: new Date(),
    collectionId: "c1",
  },
  {
    id: "2",
    userId: "u1",
    type: "image",
    title: "Sunset Photo",
    file_url:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2532&auto=format&fit=crop",
    tags: ["photography", "nature"],
    createdAt: new Date("2024-05-19"),
    updatedAt: new Date(),
  },
  {
    id: "3",
    userId: "u1",
    type: "code",
    title: "useState Snippet",
    content_text: "const [value, setValue] = useState('');",
    tags: ["react", "javascript", "code"],
    createdAt: new Date("2024-05-18"),
    updatedAt: new Date(),
    collectionId: "c2",
  },
  {
    id: "4",
    userId: "u1",
    type: "audio",
    title: "Meeting Recording",
    file_url:
      "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
    tags: ["work", "meeting"],
    createdAt: new Date("2024-05-17"),
    updatedAt: new Date(),
    collectionId: "c1",
  },
  {
    id: "5",
    userId: "u1",
    type: "video",
    title: "Vacation Clip",
    file_url:
      "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    tags: ["travel", "vacation"],
    createdAt: new Date("2024-05-16"),
    updatedAt: new Date(),
  },
  {
    id: "6",
    userId: "u1",
    type: "file",
    title: "Project Proposal",
    file_url:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    mime: "application/pdf",
    size: 120400,
    tags: ["work", "project"],
    createdAt: new Date("2024-05-15"),
    updatedAt: new Date(),
    collectionId: "c1",
  },
  {
    id: "7",
    userId: "u1",
    type: "text",
    title: "Book Recommendations",
    content_text:
      "1. The Silent Patient\n2. Atomic Habits\n3. Project Hail Mary",
    tags: ["reading", "books"],
    createdAt: new Date("2024-05-14"),
    updatedAt: new Date(),
    collectionId: "c2",
  },
  {
    id: "8",
    userId: "u1",
    type: "image",
    title: "Architecture Idea",
    file_url:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop",
    tags: ["design", "architecture"],
    createdAt: new Date("2024-05-12"),
    updatedAt: new Date(),
  },
];

const DEFAULT_COLLECTIONS: Collection[] = [
  { id: "c1", userId: "u1", name: "Work Projects", createdAt: new Date() },
  { id: "c2", userId: "u1", name: "Personal", createdAt: new Date() },
];

type SerializedNote = Omit<Note, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type SerializedCollection = Omit<Collection, "createdAt"> & {
  createdAt: string;
};

function cloneDefaultNotes(): Note[] {
  return DEFAULT_NOTES.map((note) => ({
    ...note,
    createdAt: new Date(note.createdAt),
    updatedAt: new Date(note.updatedAt),
    tags: note.tags ? [...note.tags] : [],
  }));
}

function cloneDefaultCollections(): Collection[] {
  return DEFAULT_COLLECTIONS.map((collection) => ({
    ...collection,
    createdAt: new Date(collection.createdAt),
  }));
}

function deserializeNotes(serialized: SerializedNote[]): Note[] {
  return serialized.map((note) => ({
    ...note,
    tags: note.tags ?? [],
    createdAt: new Date(note.createdAt),
    updatedAt: new Date(note.updatedAt),
  }));
}

function deserializeCollections(
  serialized: SerializedCollection[]
): Collection[] {
  return serialized.map((collection) => ({
    ...collection,
    createdAt: new Date(collection.createdAt),
  }));
}

function serializeNotes(notes: Note[]): SerializedNote[] {
  return notes.map((note) => ({
    ...note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }));
}

function serializeCollections(
  collections: Collection[]
): SerializedCollection[] {
  return collections.map((collection) => ({
    ...collection,
    createdAt: collection.createdAt.toISOString(),
  }));
}

export function loadNotesFromStorage(): Note[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return cloneDefaultNotes();
  }

  const raw = window.localStorage.getItem(NOTES_STORAGE_KEY);
  if (!raw) {
    return cloneDefaultNotes();
  }

  try {
    const parsed = JSON.parse(raw) as SerializedNote[];
    return deserializeNotes(parsed);
  } catch (error) {
    console.error("Failed to parse notes storage", error);
    window.localStorage.removeItem(NOTES_STORAGE_KEY);
    return cloneDefaultNotes();
  }
}

export function saveNotesToStorage(notes: Note[]): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  window.localStorage.setItem(
    NOTES_STORAGE_KEY,
    JSON.stringify(serializeNotes(notes))
  );
  window.dispatchEvent(new CustomEvent(NOTES_UPDATED_EVENT));
}

export function loadCollectionsFromStorage(): Collection[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return cloneDefaultCollections();
  }

  const raw = window.localStorage.getItem(COLLECTIONS_STORAGE_KEY);
  if (!raw) {
    return cloneDefaultCollections();
  }

  try {
    const parsed = JSON.parse(raw) as SerializedCollection[];
    return deserializeCollections(parsed);
  } catch (error) {
    console.error("Failed to parse collections storage", error);
    window.localStorage.removeItem(COLLECTIONS_STORAGE_KEY);
    return cloneDefaultCollections();
  }
}

export function saveCollectionsToStorage(collections: Collection[]): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  window.localStorage.setItem(
    COLLECTIONS_STORAGE_KEY,
    JSON.stringify(serializeCollections(collections))
  );
  window.dispatchEvent(new CustomEvent(COLLECTIONS_UPDATED_EVENT));
}

export function getDefaultNotes(): Note[] {
  return cloneDefaultNotes();
}

export function getDefaultCollections(): Collection[] {
  return cloneDefaultCollections();
}

