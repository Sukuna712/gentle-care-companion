export interface HistoryEntry {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  messages: { role: "user" | "assistant"; content: string; imageUrl?: string }[];
  createdAt: string;
}

const STORAGE_KEY = "chronos-history";

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversation(
  messages: { role: "user" | "assistant"; content: string; imageUrl?: string }[]
): void {
  if (messages.length < 2) return;
  const firstUserMsg = messages.find((m) => m.role === "user");
  const firstAssistantMsg = messages.find((m) => m.role === "assistant");
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    title: firstUserMsg?.content?.slice(0, 60) || "Conversation",
    summary: firstAssistantMsg?.content?.slice(0, 120) || "",
    imageUrl: messages.find((m) => m.imageUrl)?.imageUrl,
    messages,
    createdAt: new Date().toISOString(),
  };
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
}

export function deleteHistoryEntry(id: string): void {
  const history = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
