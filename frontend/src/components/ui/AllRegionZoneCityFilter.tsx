"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, Building2, Calendar } from "lucide-react";
import { AppDispatch, RootState } from "@/store/store";
import { fetchCitiesByZone } from "@/features/user/accessSlice";
import {
  fetchRegions,
  fetchZones,
} from "@/features/location/regionZoneCitySlice";
type CityOption = {
  id: string;
  name: string;
};

export interface AllRegionZoneCityFilterProps {
  selectedRegion: string;
  selectedZone: string;
  selectedCity: string;
  selectedYear?: string;

  onRegionChange: (region: string) => void;
  onZoneChange: (zone: string) => void;
  onCityChange: (cityId: string) => void;
  onYearChange?: (year: string) => void;

  regionOptions?: string[];
  zoneOptions?: CityOption[];
  cityOptions?: CityOption[];

  showYearMenu?: boolean;
  layout?: "grid" | "row";
}

export function AllRegionZoneCityFilter({
  selectedRegion,
  selectedZone,
  selectedCity,
  selectedYear = "",

  onRegionChange,
  onZoneChange,
  onCityChange,
  onYearChange = () => {},

  regionOptions,
  zoneOptions,
  cityOptions,

  showYearMenu = true,
  layout = "grid",
}: AllRegionZoneCityFilterProps) {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const { citiesByZone } = useSelector(
    (state: RootState) => state.travelAdvisor,
  );
  const { regions, zones } = useSelector((state: RootState) => state.location);

  // ✅ Super Admin check
  const isSuperAdmin = (currentUser as any)?.access_role === "SUPER_ADMIN";

  // ✅ Super admin ke liye saari regions ek baar load karo
  useEffect(() => {
    if (isSuperAdmin) {
      dispatch(fetchRegions());
    }
  }, [isSuperAdmin, dispatch]);

  // ✅ selectedRegion (name string) se region ka id nikaalo
  const selectedRegionObj = useMemo(
    () => regions.find((r) => r.region_name === selectedRegion),
    [regions, selectedRegion],
  );

  // ✅ Region select hote hi us region ki zones fetch karo (super admin ke liye)
  useEffect(() => {
    if (isSuperAdmin && selectedRegionObj) {
      dispatch(fetchZones(selectedRegionObj.id));
    }
  }, [isSuperAdmin, selectedRegionObj, dispatch]);

  // ✅ Zone select hote hi us zone ki cities fetch karo (sab role ke liye — pehle se hai)
  useEffect(() => {
    if (selectedZone) {
      dispatch(fetchCitiesByZone(Number(selectedZone)));
    }
  }, [selectedZone, dispatch]);

  const userRegionNames = (currentUser as any)?.region_names ?? [];
  const userZoneNames = (currentUser as any)?.zone_names ?? [];
  const userZoneIds = (currentUser as any)?.zone_ids ?? [];
  const userCityNames = (currentUser as any)?.city_names ?? [];
  const userCityIds = (currentUser as any)?.city_ids ?? [];

  // ✅ Region: Super Admin → saari regions, warna user-assigned
  const finalRegionOptions = useMemo(() => {
    if (regionOptions) return regionOptions;
    if (isSuperAdmin) return regions.map((r) => r.region_name);
    return userRegionNames;
  }, [regionOptions, isSuperAdmin, regions, userRegionNames]);

  // ✅ Zone: Super Admin → selected region ki zones, warna user-assigned
  const finalZoneOptions = useMemo(() => {
    if (zoneOptions) return zoneOptions;

    if (isSuperAdmin) {
      return zones.map((zone) => ({
        id: String(zone.id),
        name: zone.zone_name,
      }));
    }

    if (userZoneNames.length > 0) {
      return userZoneNames.map((name: string, idx: number) => ({
        id: String(userZoneIds?.[idx] ?? name),
        name,
      }));
    }

    return [];
  }, [zoneOptions, isSuperAdmin, zones, userZoneNames, userZoneIds]);

  // ✅ City: hamesha selected zone ki cities (sab role ke liye) — koi change nahi
  const finalCityOptions = useMemo<CityOption[]>(() => {
    if (cityOptions) return cityOptions;

    if (
      selectedZone &&
      citiesByZone?.cities &&
      citiesByZone.cities.length > 0
    ) {
      return citiesByZone.cities.map((city: any) => ({
        id: String(city.id),
        name: city.city_name,
      }));
    }

    if (userCityNames.length > 0) {
      return userCityNames.map((name: string, idx: number) => ({
        id: String(userCityIds?.[idx] ?? name),
        name,
      }));
    }

    return [];
  }, [cityOptions, selectedZone, citiesByZone, userCityNames, userCityIds]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, index) => currentYear - 2 + index);
  }, []);

  const selectClass =
    "w-full px-3 py-1 pr-10 text-sm font-semibold text-black bg-white border border-orange-500 rounded-full focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-200 appearance-none cursor-pointer hover:border-orange-300 transition-all h-9";

  return (
    <div className="w-full flex justify-end">
      <div
        className={
          layout === "row"
            ? "flex items-center gap-2 flex-nowrap"
            : "grid grid-cols-2 gap-2 w-full max-w-md"
        }
      >
        {/* Region */}
        <div className="relative w-full">
          <select
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className={selectClass}
            disabled={finalRegionOptions.length === 0}
          >
            <option value="">Region</option>
            {finalRegionOptions.map((region: string) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          <MapPin
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Zone */}
        <div className="relative w-full">
          <select
            value={selectedZone}
            onChange={(e) => {
              onZoneChange(e.target.value);
              onCityChange("");
            }}
            className={selectClass}
            disabled={finalZoneOptions.length === 0}
          >
            <option value="">Zone</option>
            {finalZoneOptions.map((zone: { id: string; name: string }) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
          <MapPin
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* City */}
        <div className="relative w-full">
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className={`${selectClass} text-black bg-white`}
            disabled={finalCityOptions.length === 0}
          >
            <option value="">City</option>
            {finalCityOptions.map((city: CityOption) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          <Building2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Year */}
        {showYearMenu && (
          <div className="relative w-full">
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className={selectClass}
            >
              <option value="">Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Calendar
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
