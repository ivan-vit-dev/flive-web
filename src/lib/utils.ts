import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinute(minute: number, addedTime?: number | null): string {
  if (addedTime && addedTime > 0) return `${minute}+${addedTime}'`;
  return `${minute}'`;
}

export function getFirebaseErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/popup-closed-by-user": "Sign-in popup was closed.",
  };
  return messages[code] ?? "An unexpected error occurred. Please try again.";
}

const BROADCAST_SESSION_KEY = "flive_session";

export function getBroadcastSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BROADCAST_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setBroadcastSession(session: object) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BROADCAST_SESSION_KEY, JSON.stringify(session));
}

export function clearBroadcastSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BROADCAST_SESSION_KEY);
}

export function saveMatchClock(seconds: number): void {
  const session = getBroadcastSession();
  if (!session) return;
  setBroadcastSession({ ...session, clock: { seconds, savedAt: Date.now() } });
}

export function clearMatchClock(): void {
  const session = getBroadcastSession();
  if (!session) return;
  const { clock: _clock, ...rest } = session;
  setBroadcastSession(rest);
}
