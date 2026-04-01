import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FormLabel } from "@/components/ui/form";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLng } from "leaflet";
import { useTranslation } from "react-i18next";

// Fix for default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/assets/marker-icon-2x.png",
  iconUrl: "/assets/marker-icon.png",
  shadowUrl: "/assets/marker-shadow.png",
});

const createCustomIcon = (color: string = "red") => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    className: "custom-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

interface Location {
  lat: string;
  lon: string;
}

interface LocationPickerProps {
  value?: Location;
  onChange: (lat: string, lon: string) => void;
  disabled?: boolean;
}

const LocationSelector: React.FC<{ onSelect: (lat: number, lon: number) => void; disabled?: boolean }> = ({ onSelect, disabled }) => {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      if (!disabled) onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange, disabled = false }) => {
  const { t } = useTranslation();
  const [mapOpen, setMapOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<LatLng | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultCenter: [number, number] = useMemo(() => {
    if (value?.lat && value?.lon) return [Number(value.lat), Number(value.lon)];
    return [33.8938, 35.5018]; // Beirut
  }, [value?.lat, value?.lon]);

  const hasValidLocation = useMemo(() => {
    return value?.lat && value?.lon && !isNaN(Number(value.lat)) && !isNaN(Number(value.lon));
  }, [value?.lat, value?.lon]);

  const handleUseCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError(t("Geolocation is not supported by your browser"));
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, enableHighAccuracy: true });
      });
      const { latitude, longitude } = position.coords;
      onChange(String(latitude), String(longitude));
    } catch (err) {
      const error = err as GeolocationPositionError;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setError(t("Location access denied. Please enable location permissions in your browser settings."));
          break;
        case error.POSITION_UNAVAILABLE:
          setError(t("Location information unavailable. Please check your connection and try again."));
          break;
        case error.TIMEOUT:
          setError(t("Location request timed out. Please try again."));
          break;
        default:
          setError(t("Unable to retrieve your location. Please try again."));
      }
    } finally {
      setIsLoading(false);
    }
  }, [onChange, t]);

  const handleMapSelect = useCallback((lat: number, lon: number) => {
    setTempLocation(new L.LatLng(lat, lon));
    setError(null);
  }, []);

  const handleSetLocation = useCallback(() => {
    if (tempLocation) {
      onChange(String(tempLocation.lat), String(tempLocation.lng));
      setMapOpen(false);
      setTempLocation(null);
    }
  }, [tempLocation, onChange]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setMapOpen(open);
    if (!open) {
      setTempLocation(null);
      setError(null);
    }
  }, []);

  const formatCoordinate = (coord: string): string => {
    const num = Number(coord);
    return !isNaN(num) ? num.toFixed(6) : coord;
  };

  return (
    <div className="space-y-3">
      <FormLabel className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        {t("Location")}
      </FormLabel>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button type="button" variant="outline" onClick={handleUseCurrentLocation} disabled={disabled || isLoading} className="flex items-center gap-2">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          {isLoading ? t("Getting Location...") : t("Use Current Location")}
        </Button>

        <Button type="button" variant="secondary" onClick={() => setMapOpen(true)} disabled={disabled} className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {t("Select on Map")}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive font-medium">{error}</p>}

      {hasValidLocation && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {t("Selected Location:")}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCoordinate(value?.lat!)}, {formatCoordinate(value?.lon!)}
          </p>
        </div>
      )}

      <Dialog open={mapOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("Select Location on Map")}</DialogTitle>
            <DialogDescription>
              {t("Click on the map to select your desired location. The marker will show your selected position.")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0">
            <MapContainer center={defaultCenter} zoom={hasValidLocation ? 13 : 10} style={{ width: "100%", height: "100%" }} className="rounded-lg">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationSelector onSelect={handleMapSelect} disabled={disabled} />
              {(tempLocation || hasValidLocation) && (
                <Marker
                  position={tempLocation ? [tempLocation.lat, tempLocation.lng] : [Number(value!.lat), Number(value!.lon)]}
                  icon={createCustomIcon(tempLocation ? "#3b82f6" : "#ef4444")}
                />
              )}
            </MapContainer>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {tempLocation && (
                <p>
                  {t("Selected:")} {tempLocation.lat.toFixed(6)}, {tempLocation.lng.toFixed(6)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setMapOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button type="button" onClick={handleSetLocation} disabled={!tempLocation}>
                {t("Confirm Location")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
