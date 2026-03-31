import { useState, useEffect } from "react";
import { Plus, Pill, Clock, Trash2, Check, Bell, BellOff, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  notes: string;
  createdAt: string;
  takenToday: string[]; // ISO date strings when taken
}

const STORAGE_KEY = "chronos_medications";

const getMedications = (): Medication[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
};

const saveMedications = (meds: Medication[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meds));
};

const todayStr = () => new Date().toISOString().split("T")[0];

const MedicationReminders = () => {
  const [medications, setMedications] = useState<Medication[]>(getMedications);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [times, setTimes] = useState("08:00");
  const [notes, setNotes] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");

  useEffect(() => { saveMedications(medications); }, [medications]);

  const addMedication = () => {
    if (!name.trim()) { toast.error("Please enter medication name"); return; }
    const med: Medication = {
      id: Date.now().toString(),
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      times: times.split(",").map(t => t.trim()),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      takenToday: [],
    };
    setMedications(prev => [med, ...prev]);
    setName(""); setDosage(""); setTimes("08:00"); setNotes("");
    setShowAdd(false);
    toast.success("Medication added!");
  };

  const markTaken = (id: string) => {
    const now = new Date().toISOString();
    setMedications(prev => prev.map(m =>
      m.id === id ? { ...m, takenToday: [...m.takenToday, now] } : m
    ));
    toast.success("Marked as taken ✓");
  };

  const deleteMed = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    toast.success("Medication removed");
  };

  const isTakenToday = (med: Medication) => {
    const today = todayStr();
    return med.takenToday.some(t => t.startsWith(today));
  };

  const todaysTakenCount = medications.filter(isTakenToday).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <Pill className="text-primary" size={24} />
            Medications
          </h2>
          <p className="text-sm text-muted-foreground font-body mt-1">
            {todaysTakenCount}/{medications.length} taken today
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView(view === "list" ? "calendar" : "list")}
            className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            {view === "list" ? <Calendar size={18} /> : <Pill size={18} />}
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium font-body hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {medications.length > 0 && (
        <div className="mb-6 bg-muted/30 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(todaysTakenCount / medications.length) * 100}%` }}
          />
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-4 animate-fade-slide-up">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Medication name"
            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              placeholder="Dosage (e.g., 500mg)"
              className="bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="daily">Daily</option>
              <option value="twice">Twice daily</option>
              <option value="weekly">Weekly</option>
              <option value="as-needed">As needed</option>
            </select>
          </div>
          <input
            value={times}
            onChange={e => setTimes(e.target.value)}
            placeholder="Time(s) — e.g., 08:00, 20:00"
            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <div className="flex gap-2">
            <button onClick={addMedication} className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium font-body hover:bg-primary/90 transition-colors">
              Save Medication
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Medication list */}
      {medications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Pill className="text-muted-foreground/40" size={48} />
          <p className="text-muted-foreground text-sm font-body">No medications added yet</p>
          <p className="text-muted-foreground/60 text-xs font-body">Tap "Add" to start tracking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map(med => {
            const taken = isTakenToday(med);
            return (
              <div key={med.id} className={`bg-card border rounded-2xl p-4 transition-all ${taken ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-display font-semibold ${taken ? "text-primary" : "text-foreground"}`}>
                        {med.name}
                      </h3>
                      {taken && <Check size={16} className="text-primary" />}
                    </div>
                    {med.dosage && <p className="text-sm text-muted-foreground font-body">{med.dosage}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-body">
                      <span className="flex items-center gap-1"><Clock size={12} /> {med.times.join(", ")}</span>
                      <span className="capitalize">{med.frequency}</span>
                    </div>
                    {med.notes && <p className="text-xs text-muted-foreground/70 mt-2 font-body">{med.notes}</p>}
                  </div>
                  <div className="flex gap-1.5 ml-3">
                    {!taken && (
                      <button onClick={() => markTaken(med.id)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Mark as taken">
                        <Check size={16} />
                      </button>
                    )}
                    <button onClick={() => deleteMed(med.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicationReminders;
