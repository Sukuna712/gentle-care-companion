import { useState, useEffect, useRef } from "react";
import { Camera, Plus, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";

interface TimelineEntry {
  id: string;
  imageUrl: string;
  note: string;
  status: "improving" | "same" | "worsening";
  timestamp: string;
}

interface InjuryRecord {
  id: string;
  name: string;
  entries: TimelineEntry[];
  createdAt: string;
}

const STORAGE_KEY = "chronos-injury-timeline";

const getRecords = (): InjuryRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
};

const saveRecords = (records: InjuryRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const InjuryTimeline = () => {
  const [records, setRecords] = useState<InjuryRecord[]>(getRecords);
  const [activeRecord, setActiveRecord] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [addingEntry, setAddingEntry] = useState(false);
  const [entryNote, setEntryNote] = useState("");
  const [entryStatus, setEntryStatus] = useState<"improving" | "same" | "worsening">("same");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveRecords(records); }, [records]);

  const createRecord = () => {
    if (!newName.trim()) return;
    const record: InjuryRecord = {
      id: Date.now().toString(),
      name: newName.trim(),
      entries: [],
      createdAt: new Date().toISOString(),
    };
    setRecords((prev) => [record, ...prev]);
    setActiveRecord(record.id);
    setNewName("");
    setShowNewForm(false);
  };

  const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCapturedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addEntry = () => {
    if (!activeRecord || !capturedImage) return;
    const entry: TimelineEntry = {
      id: Date.now().toString(),
      imageUrl: capturedImage,
      note: entryNote.trim(),
      status: entryStatus,
      timestamp: new Date().toISOString(),
    };
    setRecords((prev) =>
      prev.map((r) => r.id === activeRecord ? { ...r, entries: [...r.entries, entry] } : r)
    );
    setCapturedImage(null);
    setEntryNote("");
    setEntryStatus("same");
    setAddingEntry(false);
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (activeRecord === id) setActiveRecord(null);
  };

  const active = records.find((r) => r.id === activeRecord);

  const statusIcon = (s: string) => {
    if (s === "improving") return <TrendingUp size={14} className="text-green-400" />;
    if (s === "worsening") return <TrendingDown size={14} className="text-destructive" />;
    return <Minus size={14} className="text-muted-foreground" />;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-display font-bold text-foreground">Injury Timeline</h2>
        <p className="text-xs text-muted-foreground font-body">Track your healing progress with photos</p>
      </div>

      <div className="flex-1 px-4 pb-4 space-y-3">
        {!activeRecord ? (
          <>
            {showNewForm ? (
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Injury name (e.g., Left knee scrape)"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <button onClick={createRecord} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium font-body">
                    Create
                  </button>
                  <button onClick={() => setShowNewForm(false)} className="px-4 bg-secondary text-foreground rounded-lg py-2 text-sm font-body">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewForm(true)}
                className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl py-3 text-sm font-medium font-body transition-colors"
              >
                <Plus size={16} /> Track new injury
              </button>
            )}

            {records.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveRecord(r.id)}
                className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-body font-medium text-foreground text-sm">{r.name}</h3>
                    <p className="text-xs text-muted-foreground font-body">
                      {r.entries.length} entries · Started {format(new Date(r.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteRecord(r.id); }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </button>
            ))}

            {records.length === 0 && !showNewForm && (
              <p className="text-center text-muted-foreground text-sm font-body py-8">
                No injuries being tracked yet. Start by tapping "Track new injury".
              </p>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveRecord(null)}
              className="text-sm text-primary font-body hover:underline"
            >
              ← Back to all injuries
            </button>

            <h3 className="font-display font-bold text-foreground">{active?.name}</h3>

            {addingEntry ? (
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                {capturedImage ? (
                  <img src={capturedImage} alt="Captured" className="w-full h-40 object-cover rounded-lg" />
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/30 transition-colors"
                  >
                    <Camera size={24} />
                    <span className="text-xs font-body">Tap to capture photo</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileCapture} />

                <input
                  value={entryNote}
                  onChange={(e) => setEntryNote(e.target.value)}
                  placeholder="Notes (e.g., Less swelling today)"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />

                <div className="flex gap-2">
                  {(["improving", "same", "worsening"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setEntryStatus(s)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-body font-medium transition-colors ${
                        entryStatus === s
                          ? s === "improving" ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : s === "worsening" ? "bg-destructive/20 text-destructive border border-destructive/30"
                          : "bg-secondary border border-border text-foreground"
                          : "bg-secondary/50 text-muted-foreground border border-transparent"
                      }`}
                    >
                      {statusIcon(s)}
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button onClick={addEntry} disabled={!capturedImage} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium font-body disabled:opacity-50">
                    Save entry
                  </button>
                  <button onClick={() => { setAddingEntry(false); setCapturedImage(null); }} className="px-4 bg-secondary text-foreground rounded-lg py-2 text-sm font-body">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingEntry(true)}
                className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl py-3 text-sm font-medium font-body transition-colors"
              >
                <Camera size={16} /> Add follow-up photo
              </button>
            )}

            <div className="space-y-3">
              {active?.entries.map((entry, i) => (
                <div key={entry.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <img src={entry.imageUrl} alt={`Entry ${i + 1}`} className="w-full h-36 object-cover" />
                  <div className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-body">
                        {format(new Date(entry.timestamp), "MMM d, yyyy · h:mm a")}
                      </span>
                      <div className="flex items-center gap-1">
                        {statusIcon(entry.status)}
                        <span className="text-xs font-body text-muted-foreground capitalize">{entry.status}</span>
                      </div>
                    </div>
                    {entry.note && <p className="text-sm font-body text-foreground/80">{entry.note}</p>}
                  </div>
                </div>
              ))}

              {active?.entries.length === 0 && (
                <p className="text-center text-muted-foreground text-sm font-body py-4">
                  No entries yet. Add your first photo to start tracking.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InjuryTimeline;
