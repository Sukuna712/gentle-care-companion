import { useState, useEffect } from "react";
import { Plus, Users, User, Trash2, Edit2, Check, Baby, Heart, PawPrint } from "lucide-react";
import { toast } from "sonner";

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: string;
  icon: string;
  allergies: string;
  conditions: string;
  notes: string;
  createdAt: string;
}

const STORAGE_KEY = "chronos_family";

const getProfiles = (): FamilyMember[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};
const saveProfiles = (p: FamilyMember[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(p));

const icons: { id: string; icon: typeof User; label: string }[] = [
  { id: "adult", icon: User, label: "Adult" },
  { id: "child", icon: Baby, label: "Child" },
  { id: "elder", icon: Heart, label: "Elder" },
  { id: "pet", icon: PawPrint, label: "Pet" },
];

const FamilyProfiles = () => {
  const [profiles, setProfiles] = useState<FamilyMember[]>(getProfiles);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [age, setAge] = useState("");
  const [icon, setIcon] = useState("adult");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => { saveProfiles(profiles); }, [profiles]);

  const resetForm = () => {
    setName(""); setRelationship(""); setAge(""); setIcon("adult");
    setAllergies(""); setConditions(""); setNotes("");
    setShowAdd(false); setEditId(null);
  };

  const saveProfile = () => {
    if (!name.trim()) { toast.error("Please enter a name"); return; }
    const profile: FamilyMember = {
      id: editId || Date.now().toString(),
      name: name.trim(),
      relationship: relationship.trim(),
      age: age.trim(),
      icon,
      allergies: allergies.trim(),
      conditions: conditions.trim(),
      notes: notes.trim(),
      createdAt: editId ? profiles.find(p => p.id === editId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
    };
    if (editId) {
      setProfiles(prev => prev.map(p => p.id === editId ? profile : p));
      toast.success("Profile updated!");
    } else {
      setProfiles(prev => [profile, ...prev]);
      toast.success("Profile added!");
    }
    resetForm();
  };

  const editProfile = (p: FamilyMember) => {
    setName(p.name); setRelationship(p.relationship); setAge(p.age);
    setIcon(p.icon); setAllergies(p.allergies); setConditions(p.conditions);
    setNotes(p.notes); setEditId(p.id); setShowAdd(true); setSelectedProfile(null);
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    setSelectedProfile(null);
    toast.success("Profile removed");
  };

  const getIcon = (iconId: string) => icons.find(i => i.id === iconId)?.icon || User;

  const selected = profiles.find(p => p.id === selectedProfile);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <Users className="text-primary" size={24} />
          Family Profiles
        </h2>
        <button
          onClick={() => { resetForm(); setShowAdd(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium font-body hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Add/Edit form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-4 animate-fade-slide-up">
          <div className="flex gap-2 justify-center">
            {icons.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setIcon(id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-body transition-all ${
                  icon === id ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground border border-transparent"
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input value={relationship} onChange={e => setRelationship(e.target.value)} placeholder="Relationship (e.g., Daughter)" className="bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <input value={age} onChange={e => setAge(e.target.value)} placeholder="Age" className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <input value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Allergies (comma separated)" className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <input value={conditions} onChange={e => setConditions(e.target.value)} placeholder="Medical conditions (comma separated)" className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes" rows={2} className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          <div className="flex gap-2">
            <button onClick={saveProfile} className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium font-body hover:bg-primary/90 transition-colors">
              {editId ? "Update" : "Save"} Profile
            </button>
            <button onClick={resetForm} className="px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Cancel</button>
          </div>
        </div>
      )}

      {/* Detail view */}
      {selected && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 animate-fade-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {(() => { const Icon = getIcon(selected.icon); return <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"><Icon className="text-primary" size={24} /></div>; })()}
              <div>
                <h3 className="font-display font-bold text-foreground text-lg">{selected.name}</h3>
                {selected.relationship && <p className="text-sm text-muted-foreground font-body">{selected.relationship} · {selected.age}</p>}
              </div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => editProfile(selected)} className="p-2 rounded-lg bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={16} /></button>
              <button onClick={() => deleteProfile(selected.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
          {selected.allergies && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground font-body mb-1">Allergies</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.allergies.split(",").map((a, i) => (
                  <span key={i} className="px-2.5 py-1 bg-destructive/10 text-destructive text-xs rounded-full font-body">{a.trim()}</span>
                ))}
              </div>
            </div>
          )}
          {selected.conditions && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground font-body mb-1">Conditions</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.conditions.split(",").map((c, i) => (
                  <span key={i} className="px-2.5 py-1 bg-accent/20 text-accent text-xs rounded-full font-body">{c.trim()}</span>
                ))}
              </div>
            </div>
          )}
          {selected.notes && (
            <div>
              <p className="text-xs text-muted-foreground font-body mb-1">Notes</p>
              <p className="text-sm text-foreground/80 font-body">{selected.notes}</p>
            </div>
          )}
          <button onClick={() => setSelectedProfile(null)} className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground font-body transition-colors">
            ← Back to all profiles
          </button>
        </div>
      )}

      {/* Profile grid */}
      {!selected && profiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Users className="text-muted-foreground/40" size={48} />
          <p className="text-muted-foreground text-sm font-body">No family profiles yet</p>
          <p className="text-muted-foreground/60 text-xs font-body">Add profiles to track health for your whole family</p>
        </div>
      )}
      {!selected && profiles.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {profiles.map(p => {
            const Icon = getIcon(p.icon);
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProfile(p.id)}
                className="bg-card border border-border rounded-2xl p-5 text-left hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                  <Icon className="text-primary" size={20} />
                </div>
                <h3 className="font-display font-semibold text-foreground text-sm">{p.name}</h3>
                {p.relationship && <p className="text-xs text-muted-foreground font-body">{p.relationship}</p>}
                {p.allergies && <p className="text-xs text-destructive/70 font-body mt-1">⚠ {p.allergies.split(",").length} allerg{p.allergies.split(",").length > 1 ? "ies" : "y"}</p>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FamilyProfiles;
