import { useState } from "react";
import { getHistory, deleteHistoryEntry, clearHistory, type HistoryEntry } from "@/lib/historyStorage";
import { Clock, Trash2, Camera, MessageSquare, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface HistoryPanelProps {
  onRestore: (messages: HistoryEntry["messages"]) => void;
}

const HistoryPanel = ({ onRestore }: HistoryPanelProps) => {
  const [entries, setEntries] = useState<HistoryEntry[]>(getHistory());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryEntry(id);
    setEntries(getHistory());
  };

  const handleClearAll = () => {
    clearHistory();
    setEntries([]);
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
        <Clock size={48} className="opacity-40" />
        <p className="text-sm font-body">No history yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Previous Conversations
        </h2>
        <button
          onClick={handleClearAll}
          className="text-xs text-destructive hover:text-destructive/80 transition-colors font-body"
        >
          Clear all
        </button>
      </div>

      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/30"
        >
          <button
            onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
            className="w-full text-left p-4 flex items-start gap-3"
          >
            <div className="shrink-0 mt-0.5">
              {entry.imageUrl ? (
                <Camera size={18} className="text-primary" />
              ) : (
                <MessageSquare size={18} className="text-accent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate font-body">
                {entry.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 font-body">
                {entry.summary}
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1 font-body">
                {format(new Date(entry.createdAt), "MMM d, yyyy · h:mm a")}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => handleDelete(entry.id, e)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 size={14} />
              </button>
              <ChevronRight
                size={16}
                className={`text-muted-foreground transition-transform ${expandedId === entry.id ? "rotate-90" : ""}`}
              />
            </div>
          </button>

          {expandedId === entry.id && (
            <div className="px-4 pb-4 border-t border-border pt-3 space-y-2 animate-fade-slide-up">
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {entry.messages.map((msg, i) => (
                  <div key={i} className={`text-xs font-body ${msg.role === "user" ? "text-primary" : "text-foreground/80"}`}>
                    <span className="font-semibold capitalize">{msg.role === "user" ? "You" : "Chronos"}:</span>{" "}
                    {msg.content.slice(0, 200)}
                    {msg.content.length > 200 && "…"}
                  </div>
                ))}
              </div>
              <button
                onClick={() => onRestore(entry.messages)}
                className="w-full mt-2 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-lg py-2 font-medium transition-colors font-body"
              >
                Continue this conversation
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HistoryPanel;
