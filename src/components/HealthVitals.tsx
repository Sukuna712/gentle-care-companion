import { useState, useEffect } from "react";
import { Plus, Heart, Thermometer, Weight, Activity, TrendingUp, TrendingDown, Minus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface VitalEntry {
  id: string;
  type: "bp" | "heart_rate" | "temperature" | "weight";
  value: string;
  value2?: string; // diastolic for BP
  date: string;
  note?: string;
}

const STORAGE_KEY = "chronos_vitals";

const getVitals = (): VitalEntry[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};
const saveVitals = (v: VitalEntry[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(v));

const vitalConfig = {
  bp: { label: "Blood Pressure", unit: "mmHg", icon: Activity, color: "hsl(var(--primary))" },
  heart_rate: { label: "Heart Rate", unit: "bpm", icon: Heart, color: "hsl(var(--accent))" },
  temperature: { label: "Temperature", unit: "°F", icon: Thermometer, color: "hsl(30 90% 55%)" },
  weight: { label: "Weight", unit: "lbs", icon: Weight, color: "hsl(150 60% 45%)" },
};

type VitalType = keyof typeof vitalConfig;

const HealthVitals = () => {
  const [vitals, setVitals] = useState<VitalEntry[]>(getVitals);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedType, setSelectedType] = useState<VitalType>("heart_rate");
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => { saveVitals(vitals); }, [vitals]);

  const addEntry = () => {
    if (!value.trim()) { toast.error("Please enter a value"); return; }
    const entry: VitalEntry = {
      id: Date.now().toString(),
      type: selectedType,
      value: value.trim(),
      value2: selectedType === "bp" ? value2.trim() : undefined,
      date: new Date().toISOString(),
      note: note.trim() || undefined,
    };
    setVitals(prev => [entry, ...prev]);
    setValue(""); setValue2(""); setNote("");
    setShowAdd(false);
    toast.success("Vital recorded!");
  };

  const deleteEntry = (id: string) => {
    setVitals(prev => prev.filter(v => v.id !== id));
  };

  const getChartData = (type: VitalType) => {
    return vitals
      .filter(v => v.type === type)
      .reverse()
      .slice(-14)
      .map(v => ({
        date: new Date(v.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: parseFloat(v.value),
        ...(v.value2 ? { value2: parseFloat(v.value2) } : {}),
      }));
  };

  const getTrend = (type: VitalType) => {
    const entries = vitals.filter(v => v.type === type).slice(0, 5);
    if (entries.length < 2) return "neutral";
    const recent = parseFloat(entries[0].value);
    const older = parseFloat(entries[entries.length - 1].value);
    if (recent > older * 1.02) return "up";
    if (recent < older * 0.98) return "down";
    return "neutral";
  };

  const latestByType = (type: VitalType) => {
    return vitals.find(v => v.type === type);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <Activity className="text-primary" size={24} />
          Health Vitals
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium font-body hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> Log
        </button>
      </div>

      {/* Vitals overview cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {(Object.keys(vitalConfig) as VitalType[]).map(type => {
          const config = vitalConfig[type];
          const Icon = config.icon;
          const latest = latestByType(type);
          const trend = getTrend(type);
          return (
            <div key={type} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} style={{ color: config.color }} />
                <span className="text-xs text-muted-foreground font-body">{config.label}</span>
              </div>
              {latest ? (
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-display font-bold text-foreground">
                    {latest.value}{latest.value2 ? `/${latest.value2}` : ""}
                  </span>
                  <span className="text-xs text-muted-foreground font-body mb-1">{config.unit}</span>
                  {trend === "up" && <TrendingUp size={14} className="text-destructive mb-1 ml-1" />}
                  {trend === "down" && <TrendingDown size={14} className="text-primary mb-1 ml-1" />}
                  {trend === "neutral" && <Minus size={14} className="text-muted-foreground mb-1 ml-1" />}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground/50 font-body">No data</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-4 animate-fade-slide-up">
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(vitalConfig) as VitalType[]).map(type => {
              const config = vitalConfig[type];
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-body transition-all ${
                    selectedType === type ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground border border-transparent"
                  }`}
                >
                  <Icon size={18} />
                  {config.label.split(" ").slice(-1)[0]}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <input
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={selectedType === "bp" ? "Systolic" : `Value (${vitalConfig[selectedType].unit})`}
              type="number"
              className="flex-1 bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {selectedType === "bp" && (
              <input
                value={value2}
                onChange={e => setValue2(e.target.value)}
                placeholder="Diastolic"
                type="number"
                className="flex-1 bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={addEntry} className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium font-body hover:bg-primary/90 transition-colors">
              Save
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Charts */}
      {(Object.keys(vitalConfig) as VitalType[]).map(type => {
        const data = getChartData(type);
        if (data.length < 2) return null;
        const config = vitalConfig[type];
        return (
          <div key={type} className="bg-card border border-border rounded-2xl p-4 mb-4">
            <h3 className="text-sm font-display font-semibold text-foreground mb-3">{config.label} Trend</h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={40} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="value" stroke={config.color} strokeWidth={2} dot={{ r: 3 }} />
                {type === "bp" && <Line type="monotone" dataKey="value2" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}

      {/* Recent entries */}
      {vitals.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-display font-semibold text-foreground mb-3">Recent Entries</h3>
          <div className="space-y-2">
            {vitals.slice(0, 10).map(entry => {
              const config = vitalConfig[entry.type];
              const Icon = config.icon;
              return (
                <div key={entry.id} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Icon size={16} style={{ color: config.color }} />
                    <div>
                      <span className="text-sm font-body text-foreground font-medium">
                        {entry.value}{entry.value2 ? `/${entry.value2}` : ""} {config.unit}
                      </span>
                      <p className="text-xs text-muted-foreground font-body">
                        {new Date(entry.date).toLocaleDateString()} · {config.label}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deleteEntry(entry.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthVitals;
