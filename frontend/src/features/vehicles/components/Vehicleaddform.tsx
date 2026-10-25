"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { vehicles, type Vehiclea } from "@/features/vehicles/data/vehicles";

interface VehicleAddFormState {
  name: string;
  model: string;
  year: string;
  brand: string;
}

const emptyForm: VehicleAddFormState = {
  name: "",
  model: "",
  year: "",
  brand: "",
};

export default function VehicleAddForm() {
  const [formState, setFormState] = useState<VehicleAddFormState>(emptyForm);
  const [submitted, setSubmitted] = useState<Vehiclea[]>([]);

  const nextId = useMemo(() => {
    const catalogMax = vehicles.reduce((acc, vehicle) => Math.max(acc, vehicle.id), 0);
    const sessionMax = submitted.reduce((acc, vehicle) => Math.max(acc, vehicle.id), 0);
    return Math.max(catalogMax, sessionMax) + 1;
  }, [submitted]);

  const handleChange = (field: keyof VehicleAddFormState) => (value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!formState.name.trim() || !formState.model.trim()) {
      return;
    }

    const newVehicle: Vehiclea = {
      id: nextId,
      name: formState.name.trim(),
      model: formState.model.trim(),
      year: formState.year.trim(),
      brand: formState.brand.trim(),
    };

    setSubmitted((prev) => [newVehicle, ...prev]);
    setFormState(emptyForm);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Register a new vehicle</h2>
        <p className="mt-1 text-sm text-slate-500">
          Use this lightweight form while the full workflow is being wired to the back office.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Vehicle name</span>
              <input
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={formState.name}
                onChange={(event) => handleChange("name")(event.target.value)}
                placeholder="Eg. Tourist Shuttle"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Model</span>
              <input
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={formState.model}
                onChange={(event) => handleChange("model")(event.target.value)}
                placeholder="Eg. Sprinter"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Model year</span>
              <input
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={formState.year}
                onChange={(event) => handleChange("year")(event.target.value)}
                placeholder="Eg. 2024"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Brand</span>
              <input
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={formState.brand}
                onChange={(event) => handleChange("brand")(event.target.value)}
                placeholder="Eg. Mercedes-Benz"
              />
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-indigo-700"
            >
              Save vehicle
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-800">Recent submissions</h3>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Session only
          </span>
        </div>
        {submitted.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Fill the form above to preview vehicles while the persistence layer is finalised.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Model</th>
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2">Brand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submitted.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="px-3 py-2 text-slate-600">{vehicle.id}</td>
                    <td className="px-3 py-2 text-slate-700">{vehicle.name}</td>
                    <td className="px-3 py-2 text-slate-700">{vehicle.model}</td>
                    <td className="px-3 py-2 text-slate-700">{vehicle.year || "—"}</td>
                    <td className="px-3 py-2 text-slate-700">{vehicle.brand || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
