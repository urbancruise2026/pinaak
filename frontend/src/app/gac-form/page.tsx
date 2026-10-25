"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

import { createWebsiteGacThunk } from "@/features/website/websiteSlice";
import { getCountriesThunk } from "@/features/location/countrycodeSlice";

// How many country rows are visible before the list scrolls
const VISIBLE_COUNTRY_ROWS = 10;
const COUNTRY_ROW_HEIGHT = 36; // px, matches the row's py-2 + text-sm sizing below

export default function GacFormPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { creating } = useSelector((state: RootState) => state.websiteGac);

  const countries = useSelector((state: RootState) => state.country.countries);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    country_code: "",
    city: "",
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setCountryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    dispatch(getCountriesThunk());
  }, [dispatch]);

  useEffect(() => {
    const extractCityFromUrl = (href: string): string | null => {
      try {
        const url = new URL(href.toLowerCase());
        const pathSegments = url.pathname.split("/").filter(Boolean);

        if (pathSegments.length > 0) {
          const rawCity = decodeURIComponent(pathSegments[0]);
          return rawCity.charAt(0).toUpperCase() + rawCity.slice(1);
        }
      } catch {
        // invalid URL, ignore
      }
      return null;
    };

    let detectedCity: string | null = null;

    try {
      detectedCity = extractCityFromUrl(window.parent.location.href);
    } catch {
      detectedCity = null;
    }

    if (!detectedCity && document.referrer) {
      detectedCity = extractCityFromUrl(document.referrer);
    }

    // Final fallback
    if (!detectedCity) {
      detectedCity = "India";
    }

    setFormData((prev) => ({
      ...prev,
      city: detectedCity as string,
    }));
  }, []);

  useEffect(() => {
    if (countries.length > 0 && !formData.country_code) {
      const defaultCountry =
        countries.find((item) => item.phone_code === "+91") || countries[0];

      setFormData((prev) => ({
        ...prev,
        country_code: defaultCountry.phone_code,
      }));
    }
  }, [countries, formData.country_code]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCountrySelect = (phoneCode: string) => {
    setFormData((prev) => ({
      ...prev,
      country_code: phoneCode,
    }));

    setCountryDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resultAction = await dispatch(createWebsiteGacThunk(formData));

    if (createWebsiteGacThunk.fulfilled.match(resultAction)) {
      setMessageType("success");
      setMessage("Successfully Submitted");

      setFormData((prev) => ({
        name: "",
        phone: "",
        country_code: prev.country_code,
        city: prev.city,
      }));
    } else {
      setMessageType("error");
      setMessage((resultAction.payload as string) || "Something went wrong");
    }

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="w-full bg-white border-2 border-lime-500">
        {/* Header */}
        <div className="bg-lime-500 py-3 sm:py-4 text-center px-2">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-wide text-white">
            GET A QUICK CALL
          </h1>
        </div>

        <div className="p-4 sm:p-6">
          {message && (
            <div
              className={`mb-4 sm:mb-5 rounded-md border px-4 py-3 text-center font-semibold text-sm sm:text-base ${
                messageType === "success"
                  ? "border-green-500 bg-green-100 text-green-700"
                  : "border-red-500 bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 md:flex-row md:items-center md:gap-5"
          >
            <input type="hidden" name="city" value={formData.city} />

            {/* Name */}
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="h-12 w-full rounded-md border border-gray-300 px-4 text-black outline-none focus:border-lime-500 md:w-1/3"
            />

            {/* Phone */}
            <div className="flex h-12 w-full overflow-visible rounded-md border border-gray-300 md:w-1/3 relative">
              {/* Country Code (custom dropdown, shows max 10 rows then scrolls) */}
              <div
                ref={countryDropdownRef}
                className="relative h-full flex-shrink-0"
              >
                <button
                  type="button"
                  onClick={() => setCountryDropdownOpen((prev) => !prev)}
                  className="w-20 sm:w-24 h-full border-r border-gray-300 bg-white text-black outline-none px-2 flex items-center justify-between gap-1 box-border"
                >
                  <span className="truncate text-sm sm:text-base">
                    {formData.country_code || "Code"}
                  </span>
                  <span className="text-gray-400 text-xs">▾</span>
                </button>

                {countryDropdownOpen && (
                  <ul
                    style={{
                      maxHeight: `${VISIBLE_COUNTRY_ROWS * COUNTRY_ROW_HEIGHT}px`,
                    }}
                    className="absolute z-20 top-full left-0 mt-1 w-28 max-w-[60vw] overflow-y-auto rounded-md border text-black border-gray-300 bg-white shadow-lg"
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

              {/* Phone */}
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="flex-1 min-w-0 px-4 text-black outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={creating}
              className="h-12 w-full shrink-0 rounded-md bg-amber-500 text-base sm:text-lg font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 md:w-44"
            >
              {creating ? "Submitting..." : "SUBMIT"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
