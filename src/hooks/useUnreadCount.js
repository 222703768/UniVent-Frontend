import { useEffect, useSyncExternalStore } from "react";
import { getUnreadCount } from "@/api/notifications";

/*
 * Shared unread-notification count (FE 50).
 * One value for the whole app, so the Navbar badge and the Notifications screen stay in sync:
 * after "Mark all as read" or "Dismiss", call setUnreadCount(n) or refreshUnreadCount().
 */
let count = 0;
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => count;

export function setUnreadCount(next) {
  count = Math.max(0, Number(next) || 0);
  emit();
}

export async function refreshUnreadCount() {
  try {
    const result = await getUnreadCount();
    setUnreadCount(typeof result === "number" ? result : result?.count ?? result?.unreadCount ?? 0);
  } catch {
    // Keep the last known value; the bell simply shows no new badge.
  }
}

export function useUnreadCount({ enabled = true } = {}) {
  const value = useSyncExternalStore(subscribe, getSnapshot);
  useEffect(() => {
    if (enabled) refreshUnreadCount();
  }, [enabled]);
  return value;
}