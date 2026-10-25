"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Globe, Phone, FileText, Plus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCountryThunk,
  getCountriesThunk,
} from "@/features/location/countrycodeSlice";
import { AppDispatch, RootState } from "@/store/store";
import { toast } from "react-toastify";

// Validation Schema
const schema = z.object({
  country_name: z.string().min(1, "Country name is required"),
  country_code: z.string().min(1, "Country code is required"),
  phone_code: z.string().min(1, "Phone code is required"),
});

type countryData = z.infer<typeof schema>;

export default function CountryCodeForm() {
  const dispatch = useDispatch<AppDispatch>();

  const { countries, loading } = useSelector(
    (state: RootState) => state.country,
  );

  const [editItem, setEditItem] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<countryData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    dispatch(getCountriesThunk());
  }, [dispatch]);

  const onSubmit = async (data: countryData) => {
    try {
      const res = await dispatch(createCountryThunk(data)).unwrap();
      dispatch(getCountriesThunk());

      toast.success("✅ Country added successfully!");

      reset();
      setShowModal(false);
    } catch (error: any) {
      toast.error("❌ Failed to add country!");
      console.error("Error:", error);
    }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    reset(item);
    setShowModal(true);
  };

  const handleCancel = () => {
    setEditItem(null);
    reset();
    setShowModal(false);
  };

  const openAddModal = () => {
    reset();
    setEditItem(null);
    setShowModal(true);
  };

  return (
    <div className="p-6 w-[1200px] mx-auto bg-white shadow-xl rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Country Code Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage country codes and phone codes
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Country
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCancel}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">
                  {editItem ? "Edit Country Code" : "Add New Country Code"}
                </h3>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Country Name */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">
                      Country Name *
                    </label>
                    <div className="relative">
                      <input
                        {...register("country_name")}
                        className="w-full pl-10 py-3 border rounded-lg"
                        placeholder="India"
                      />
                      <Globe
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                        size={18}
                      />
                    </div>
                    {errors.country_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.country_name.message}
                      </p>
                    )}
                  </div>

                  {/* Country Code */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">
                      Country Code *
                    </label>
                    <div className="relative">
                      <input
                        {...register("country_code")}
                        className="w-full pl-10 py-3 border rounded-lg"
                        placeholder="IN"
                      />
                      <FileText
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                        size={18}
                      />
                    </div>
                    {errors.country_code && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.country_code.message}
                      </p>
                    )}
                  </div>

                  {/* Phone Code */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">
                      Phone Code *
                    </label>
                    <div className="relative">
                      <input
                        {...register("phone_code")}
                        className="w-full pl-10 py-3 border rounded-lg"
                        placeholder="+91"
                      />
                      <Phone
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                        size={18}
                      />
                    </div>
                    {errors.phone_code && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone_code.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-6 mt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg"
                  >
                    {loading ? "Saving..." : "Add Country"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Table */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Saved Country Codes ({countries.length})
        </h3>

        {loading ? (
          <p>Loading...</p>
        ) : countries.length === 0 ? (
          <p>No country codes found</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Country Name</th>
                  <th className="p-3 text-left">Country Code</th>
                  <th className="p-3 text-left">Phone Code</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((c: any) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">{c.country_name}</td>
                    <td className="p-3">{c.country_code}</td>
                    <td className="p-3">{c.phone_code}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleEdit(c)}
                        className="px-3 py-1 bg-blue-500 text-white rounded mr-2"
                      >
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-red-500 text-white rounded">
                        Delete
                      </button>
                    </td>
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