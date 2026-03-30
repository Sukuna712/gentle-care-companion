import { useState } from "react";
import { Phone, MapPin, Share2, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const emergencyNumbers = [
  { country: "United States", number: "911", flag: "🇺🇸" },
  { country: "United Kingdom", number: "999", flag: "🇬🇧" },
  { country: "European Union", number: "112", flag: "🇪🇺" },
  { country: "Australia", number: "000", flag: "🇦🇺" },
  { country: "Canada", number: "911", flag: "🇨🇦" },
  { country: "India", number: "112", flag: "🇮🇳" },
  { country: "Japan", number: "119", flag: "🇯🇵" },
  { country: "Brazil", number: "192", flag: "🇧🇷" },
  { country: "South Africa", number: "10177", flag: "🇿🇦" },
  { country: "Mexico", number: "911", flag: "🇲🇽" },
];

const EmergencySOS = () => {
  const [locationShared, setLocationShared] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const shareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on this device");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setLocationShared(true);
        setLoadingLocation(false);

        if (navigator.share) {
          navigator.share({
            title: "My Emergency Location",
            text: `I need help! My location: ${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`,
            url: `https://maps.google.com/?q=${loc.lat},${loc.lng}`,
          }).catch(() => {});
        } else {
          navigator.clipboard.writeText(
            `Emergency! My location: https://maps.google.com/?q=${loc.lat},${loc.lng}`
          );
          toast.success("Location copied to clipboard");
        }
      },
      () => {
        toast.error("Unable to get location. Please enable location services.");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const openMaps = () => {
    if (location) {
      window.open(`https://maps.google.com/?q=hospitals+near+${location.lat},${location.lng}`, "_blank");
    } else {
      window.open("https://maps.google.com/search/hospitals+near+me", "_blank");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* SOS Header */}
      <div className="px-4 pt-4 pb-3 bg-destructive/10 border-b border-destructive/20">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-destructive" />
          <h2 className="text-lg font-display font-bold text-destructive">Emergency SOS</h2>
        </div>
        <p className="text-xs text-destructive/70 font-body mt-0.5">Quick access to emergency resources</p>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Share Location */}
        <button
          onClick={shareLocation}
          disabled={loadingLocation}
          className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl py-4 flex items-center justify-center gap-3 font-body font-bold text-base transition-colors shadow-lg shadow-destructive/20"
        >
          {loadingLocation ? (
            <span className="animate-pulse">Getting location...</span>
          ) : (
            <>
              <Share2 size={20} />
              Share My Location
            </>
          )}
        </button>

        {locationShared && location && (
          <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
            <MapPin size={16} className="text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-body text-foreground">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
              <p className="text-xs text-muted-foreground font-body">Location shared ✓</p>
            </div>
          </div>
        )}

        {/* Find Hospitals */}
        <button
          onClick={openMaps}
          className="w-full bg-primary/10 hover:bg-primary/20 text-primary rounded-xl py-3 flex items-center justify-center gap-2 font-body font-medium text-sm transition-colors"
        >
          <MapPin size={16} />
          Find Nearest Hospital
          <ExternalLink size={12} />
        </button>

        {/* Emergency Numbers */}
        <div>
          <h3 className="text-sm font-display font-bold text-foreground mb-2">Emergency Numbers</h3>
          <div className="grid grid-cols-1 gap-1.5">
            {emergencyNumbers.map((em) => (
              <a
                key={em.number + em.country}
                href={`tel:${em.number}`}
                className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-2.5 hover:border-primary/20 transition-colors group"
              >
                <span className="text-lg">{em.flag}</span>
                <div className="flex-1">
                  <p className="text-sm font-body text-foreground">{em.country}</p>
                </div>
                <div className="flex items-center gap-1.5 text-primary">
                  <Phone size={14} />
                  <span className="font-body font-bold text-sm">{em.number}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-body text-center py-2">
          In a life-threatening emergency, always call your local emergency number first.
        </p>
      </div>
    </div>
  );
};

export default EmergencySOS;
