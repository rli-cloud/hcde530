import { useSyncExternalStore } from "react";
import { getFolders, getItems, subscribe, type Folder, type SavedItem } from "./storage";

const EMPTY_FOLDERS: Folder[] = [];
const EMPTY_ITEMS: SavedItem[] = [];

export function useFolders(): Folder[] {
  return useSyncExternalStore(
    (cb) => subscribe(cb),
    () => getFolders(),
    () => EMPTY_FOLDERS,
  );
}

export function useItems(): SavedItem[] {
  return useSyncExternalStore(
    (cb) => subscribe(cb),
    () => getItems(),
    () => EMPTY_ITEMS,
  );
}
