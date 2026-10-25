"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

import { createTripBookingThunk } from "@/features/website/websiteSlice";
import { getCountriesThunk } from "@/features/location/countrycodeSlice";

import Car from "@/assets/images/car.webp";
import Tempo from "@/assets/images/tempo-traveller.webp";
import Urbania from "@/assets/images/urbania.webp";
import Minibus from "@/assets/images/mini-bus.webp";
import LuxuryBus from "@/assets/images/luxury-bus.webp";
import SemiSleeperBus from "@/assets/images/sleeperbus.webp";
import LuxuryCarSUV from "@/assets/images/luxury-car.webp";

const SUV = LuxuryCarSUV;

type VehicleCategory = "Economy" | "Premium" | "Royal" | "Royal Vip";

interface VehicleModel {
  key: string;
  label: string;
  image: StaticImageData;
}

const VEHICLE_MODELS: VehicleModel[] = [
  { key: "tempo_traveller", label: "TEMPO TRAVELLER", image: Tempo },
  { key: "urbania", label: "URBANIA", image: Urbania },
  { key: "minibus", label: "MINIBUS", image: Minibus },
  { key: "luxury_bus", label: "LUXURY BUS", image: LuxuryBus },
  {
    key: "semi_sleeper_bus",
    label: "SEMI/ SLEEPER BUS",
    image: SemiSleeperBus,
  },
  { key: "luxury_car_suv", label: "LUXURY CAR/ SUV", image: LuxuryCarSUV },
  { key: "suv", label: "SUV", image: SUV },
  { key: "car", label: "CAR", image: Car },
];

const VEHICLE_CATEGORIES: VehicleCategory[] = [
  "Economy",
  "Premium",
  "Royal",
  "Royal Vip",
];

// How many country rows are visible before the list scrolls
const VISIBLE_COUNTRY_ROWS = 10;
const COUNTRY_ROW_HEIGHT = 36; // px, matches the row's py-2 + text-sm sizing below

// 🆕 Sirf ye 2 cities officially supported hai — baaki sab "India" fallback
const CITY_MAP: Record<string, string> = {
  delhi: "Delhi",
  mumbai: "Mumbai",
};

// 🆕 Kisi bhi URL string se pehla path-segment nikal ke city map karo
// e.g. "https://urbancruise.in/delhi/get-a-quotation-route-infomation/" -> "Delhi"
const detectCityFromHref = (href: string): string | null => {
  try {
    const url = new URL(href);
    const firstSegment = url.pathname
      .split("/")
      .filter(Boolean)[0]
      ?.toLowerCase();

    if (firstSegment && CITY_MAP[firstSegment]) {
      return CITY_MAP[firstSegment];
    }
  } catch {
    // invalid URL, ignore
  }
  return null;
};

export default function TripBookingFormPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { creating } = useSelector((state: RootState) => state.websiteGac);

  const countries = useSelector((state: RootState) => state.country.countries);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  // Thank-you modal: shown on successful submit, auto-closes after 5s
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  // Custom country-code dropdown open/close state
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    city: "", // hidden field, auto-detected
    pickup_address: "",
    pickup_date: "",
    drop_address: "",
    drop_date: "",
    travel_itinerary: "",
    passengers: "",
    baggages: "",
    vehicle_category: "" as VehicleCategory | "",
    vehicle_model: "",
    full_name: "",
    country_code: "",
    phone: "",
    email: "",
    trip_message: "",
  });

  const ITINERARY_MAX = 250;

  // Load all countries
  useEffect(() => {
    dispatch(getCountriesThunk());
  }, [dispatch]);

  // 🆕 Detect city — priority order (sabse reliable pehle):
  // 1) Iframe's own query param (?city=delhi) — agar embed karte waqt explicitly set kiya ho
  // 2) Parent window ka URL (same-origin ho to) — real page URL: urbancruise.in/delhi/...
  // 3) document.referrer — cross-origin me bhi kaam karta hai, jab page load hota hai iframe ke andar
  // 4) Fallback: "India"
  useEffect(() => {
    let detectedCity: string | null = null;

    // 1) Apne khud ke query param se
    try {
      const ownParams = new URLSearchParams(window.location.search);
      const cityParam = ownParams.get("city")?.toLowerCase();
      if (cityParam && CITY_MAP[cityParam]) {
        detectedCity = CITY_MAP[cityParam];
      }
    } catch {
      detectedCity = null;
    }

    // 2) Parent frame ka URL (same-origin par hi accessible hoga)
    if (!detectedCity) {
      try {
        detectedCity = detectCityFromHref(window.parent.location.href);
      } catch {
        detectedCity = null;
      }
    }

    // 3) document.referrer (cross-origin embed me ye kaam aayega)
    if (!detectedCity && document.referrer) {
      detectedCity = detectCityFromHref(document.referrer);
    }

    // 4) Final fallback
    if (!detectedCity) {
      detectedCity = "India";
    }

    setFormData((prev) => ({
      ...prev,
      city: detectedCity as string,
    }));
  }, []);

  // Set default country code (defaults to +91 if present, else the first one)
  useEffect(() => {
    if (countries.length > 0 && !formData.country_code) {
      const defaultCountry =
        countries.find((item) => item.phone_code === "+91") || countries[0];

      setFormData((prev) => ({
        ...prev,
        country_code: defaultCountry.phone_code,
      }));
    }
  }, [countries]);

  // Close the country dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target as Node)
      ) {
        setCountryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "travel_itinerary" && value.length > ITINERARY_MAX) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reusable handler: click anywhere on a date input to open the calendar picker
  const handleDateFieldClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.showPicker?.();
  };

  const handleCountrySelect = (phoneCode: string) => {
    setFormData((prev) => ({ ...prev, country_code: phoneCode }));
    setCountryDropdownOpen(false);
  };

  const handleCategorySelect = (category: VehicleCategory) => {
    setFormData((prev) => ({ ...prev, vehicle_category: category }));
  };

  const handleModelSelect = (key: string) => {
    setFormData((prev) => ({ ...prev, vehicle_model: key }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resultAction = await dispatch(createTripBookingThunk(formData));

    // Bring the user back to the top of the page so they see the
    // thank-you modal / error message right away.
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (createTripBookingThunk.fulfilled.match(resultAction)) {
      setFormData({
        city: formData.city,
        pickup_address: "",
        pickup_date: "",
        drop_address: "",
        drop_date: "",
        travel_itinerary: "",
        passengers: "",
        baggages: "",
        vehicle_category: "",
        vehicle_model: "",
        full_name: "",
        country_code: formData.country_code,
        phone: "",
        email: "",
        trip_message: "",
      });

      // Show the thank-you modal, then auto-hide it after 5s so the
      // (already reset) form becomes visible again.
      setShowThankYouModal(true);
      setTimeout(() => {
        setShowThankYouModal(false);
      }, 5000);
    } else {
      setMessageType("error");
      setMessage((resultAction.payload as string) || "Something went wrong");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Thank-you modal: appears on successful submit, auto-closes after 5s */}
      {showThankYouModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-[10px] bg-white shadow-2xl px-8 py-10 text-center animate-[fadeIn_0.2s_ease-out]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lime-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="h-9 w-9 text-lime-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Thank You!</h3>
            <p className="text-gray-600 text-sm">
              Your trip booking request has been submitted successfully.
            </p>
          </div>
        </div>
      )}

      <div className="w-full bg-white">
        {/* Success / Error Message */}
        {message && (
          <div
            className={`mx-6 mt-6 rounded-md px-4 py-3 text-center font-semibold ${
              messageType === "success"
                ? "bg-green-100 border border-green-500 text-green-700"
                : "bg-red-100 border border-red-500 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Hidden city field */}
          <input type="hidden" name="city" value={formData.city} />

          {/* Trip Details */}
          <div className="bg-lime-500 text-black text-center py-3">
            <h2 className="text-2xl font-bold">Trip Details</h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-bold mb-1 text-black">
                Pickup Address <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="pickup_address"
                value={formData.pickup_address}
                onChange={handleChange}
                placeholder="Enter a location"
                required
                className="w-full h-12 border border-gray-300 rounded-md px-4 text-black text-base font-semibold placeholder:text-gray-400 outline-none focus:border-lime-500"
              />
            </div>

            <div>
              <label className="block text-base font-bold mb-1 text-black">
                Pickup Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="pickup_date"
                value={formData.pickup_date}
                onChange={handleChange}
                onClick={handleDateFieldClick}
                required
                className="w-full h-12 border border-gray-300 rounded-md px-4 text-black outline-none focus:border-lime-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-base font-bold mb-1 text-black">
                Drop Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="drop_address"
                value={formData.drop_address}
                onChange={handleChange}
                placeholder="Enter a location"
                required
                className="w-full h-12 border border-gray-300 rounded-md px-4 text-black placeholder:text-gray-400 outline-none focus:border-lime-500"
              />
            </div>

            <div>
              <label className="block text-base font-bold mb-1 text-black">
                Drop Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="drop_date"
                value={formData.drop_date}
                onChange={handleChange}
                onClick={handleDateFieldClick}
                required
                className="w-full h-12 border border-gray-300 rounded-md px-4 text-black outline-none focus:border-lime-500 cursor-pointer"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-base font-bold mb-1 text-black">
                Travel Itinerary <span className="text-red-500">*</span>
              </label>
              <textarea
                name="travel_itinerary"
                value={formData.travel_itinerary}
                onChange={handleChange}
                placeholder="Share Complete Travel Itinerary"
                required
                rows={5}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-black placeholder:text-gray-400 outline-none focus:border-lime-500 resize-none"
              />
              <p className="text-xs text-blue-600 mt-1">
                {formData.travel_itinerary.length} of {ITINERARY_MAX} max
                characters.
              </p>
            </div>

            <div>
              <label className="block text-base font-bold mb-1 text-black">
                No. of Passengers <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                name="passengers"
                value={formData.passengers}
                onChange={handleChange}
                placeholder="No. of Passengers"
                required
                className="w-full h-12 border border-gray-300 rounded-md px-4 text-black placeholder:text-gray-400 outline-none focus:border-lime-500"
              />
            </div>

            <div>
              <label className="block text-base font-bold mb-1 text-black">
                No. of Baggages <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                name="baggages"
                value={formData.baggages}
                onChange={handleChange}
                placeholder="No of Baggages"
                required
                className="w-full h-12 border border-gray-300 rounded-md px-4 text-black placeholder:text-gray-400 outline-none focus:border-lime-500"
              />
            </div>
          </div>

          {/* Select a Vehicle */}
          <div className="bg-lime-500 text-black text-center py-3">
            <h2 className="text-2xl font-bold">Select a Vehicle</h2>
          </div>

          <div className="p-6">
            <p className="text-base font-bold mb-1 text-black">
              Vehicle Category
            </p>
            <div className="flex flex-wrap gap-6 mb-6">
              {VEHICLE_CATEGORIES.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="vehicle_category"
                    checked={formData.vehicle_category === category}
                    onChange={() => handleCategorySelect(category)}
                    className="accent-lime-500 w-4 h-4"
                  />
                  <span className="text-sm text-black">{category}</span>
                </label>
              ))}
            </div>

            <p className="text-base font-bold mb-1 text-black">Vehicle Model</p>
            <p className="text-xs text-gray-500 mb-3">
              Click vehicle image to select vehicle
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {VEHICLE_MODELS.map((vehicle) => {
                const isSelected = formData.vehicle_model === vehicle.key;
                return (
                  <button
                    type="button"
                    key={vehicle.key}
                    onClick={() => handleModelSelect(vehicle.key)}
                    className={`border rounded-md p-3 flex flex-col items-center gap-2 transition ${
                      isSelected
                        ? "border-lime-500 ring-2 ring-lime-400"
                        : "border-gray-300 hover:border-lime-400"
                    }`}
                  >
                    {/* image wrapper — relative rakhna zaroori hai */}
                    <div className="relative w-full flex justify-center">
                      <Image
                        src={vehicle.image}
                        alt={vehicle.label}
                        width={150}
                        priority
                        className="rounded-xl object-contain flex-shrink-0"
                      />

                      {/* checkbox — hamesha visible, top-right corner */}
                      <span
                        className={`absolute top-0 right-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                          isSelected
                            ? "bg-green-500 border-green-500"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-3.5 h-3.5"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-blue-700">
                      {vehicle.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-lime-500 text-black text-center py-3">
            <h2 className="text-2xl font-bold">Your Contact Details</h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-bold mb-1 text-black">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Full Name *"
                required
                className="w-full h-12 border border-gray-300 rounded-md px-4 text-black placeholder:text-gray-400 outline-none focus:border-lime-500"
              />
            </div>

            <div>
              <label className="block text-base font-bold mb-1 text-black">
                Phone Number <span className="text-red-500">*</span>
              </label>

              {/* Country Code (custom dropdown, shows max 10 rows then scrolls) + Phone */}
              <div className="flex w-full border border-gray-300 rounded-md overflow-visible h-12 relative">
                <div
                  className="relative h-full flex-shrink-0"
                  ref={countryDropdownRef}
                >
                  <button
                    type="button"
                    onClick={() => setCountryDropdownOpen((prev) => !prev)}
                    className="w-24 h-full border-r border-gray-300 bg-white text-black outline-none px-2 flex items-center justify-between gap-1 box-border"
                  >
                    <span className="truncate">
                      {formData.country_code || "Code"}
                    </span>
                    <span className="text-gray-400 text-xs">▾</span>
                  </button>

                  {countryDropdownOpen && (
                    <ul
                      style={{
                        maxHeight: `${VISIBLE_COUNTRY_ROWS * COUNTRY_ROW_HEIGHT}px`,
                      }}
                      className="absolute z-20 top-full left-0 mt-1 w-28 overflow-y-auto rounded-md border text-black border-gray-300 bg-white shadow-lg"
                    >
                      {countries.map((country) => (
                        <li key={country.id}>
                          <button
                            type="button"
                            onClick={() =>
                              handleCountrySelect(country.phone_code)
                            }
                            title={country.name}
                            className={`w-full px-3 py-2 text-sm text-right hover:bg-lime-50 ${
                              formData.country_code === country.phone_code
                                ? "bg-lime-100 font-semibold"
                                : ""
                            }`}
                          >
                            {country.phone_code}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  className="flex-1 px-4 text-black placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-base font-bold mb-1 text-black">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full h-12 border border-gray-300 rounded-md px-4 text-black placeholder:text-gray-400 outline-none focus:border-lime-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-base font-bold mb-1 text-black">
                Message
              </label>
              <textarea
                name="trip_message"
                value={formData.trip_message}
                onChange={handleChange}
                placeholder="Message"
                rows={4}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-black placeholder:text-gray-400 outline-none focus:border-lime-500 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-center pb-8">
            <button
              type="submit"
              disabled={creating}
              className="w-full max-w-xs h-12 rounded-md bg-amber-500 text-white font-bold text-lg shadow-md hover:bg-amber-600 transition disabled:opacity-50"
            >
              {creating ? "Submitting..." : "SUBMIT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
