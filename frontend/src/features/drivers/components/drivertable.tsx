"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Pencil, RefreshCw, Search, X } from "lucide-react";

import type { AppDispatch, RootState } from "@/store/store";

import {
  getDriversThunk,
  clearError,
  getDriverByIdThunk,
  resetSuccess,
} from "@/features/drivers/driverSlice";

import Pagination from "@/components/ui/pagination";
import DriverForm from "./DriverFormData";
import DriverViewModal from "./driverModelView";

// =====================================================
// PAGE HEADER
// =====================================================
import LeadPageHeader from "@/components/ui/PageHeader/TablePageHeader";

// =====================================================
// REUSABLE TABLE COMPONENTS
// =====================================================
import Table from "@/components/ui/Table/Table";
import TableHeader from "@/components/ui/Table/TableHeader";
import TableRow from "@/components/ui/Table/TableRow";
import TableCell from "@/components/ui/Table/TableCell";

// =====================================================
// TYPES
// =====================================================
interface DriverTableProps {
  onEdit?: (driver: any) => void;
  onView?: (driver: any) => void;
}

// =====================================================
// DRIVER TABLE
// =====================================================
const DriverTable: React.FC<DriverTableProps> = ({ onEdit, onView }) => {
  const dispatch = useDispatch<AppDispatch>();

  // =====================================================
  // REDUX
  // =====================================================
  const { drivers, loading, error, successMessage } = useSelector(
    (state: RootState) => state.driver,
  );

  // =====================================================
  // STATES
  // =====================================================
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const [showEditForm, setShowEditForm] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);

  const [editLoading, setEditLoading] = useState(false);

  const [viewLoading, setViewLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  // =====================================================
  // SUCCESS TOAST
  // =====================================================
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  // =====================================================
  // SUCCESS MESSAGE
  // =====================================================
  useEffect(() => {
    if (successMessage) {
      setToastMessage(successMessage);
      setShowSuccessToast(true);

      const timer = setTimeout(() => {
        setShowSuccessToast(false);
        dispatch(resetSuccess());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // =====================================================
  // FETCH DRIVERS
  // =====================================================
  useEffect(() => {
    dispatch(getDriversThunk());
  }, [dispatch]);

  // =====================================================
  // FILTER DRIVERS
  // =====================================================
  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];

    if (searchTerm.trim() === "") {
      return drivers;
    }

    const term = searchTerm.toLowerCase().trim();

    return drivers.filter((driver: any) => {
      const firstName =
        driver.personalInfo?.firstName || driver.first_name || "";

      const lastName = driver.personalInfo?.lastName || driver.last_name || "";

      const fullName = `${firstName} ${lastName}`.toLowerCase();

      const employeeId = (
        driver.employmentInfo?.employeeId ||
        driver.employee_id ||
        ""
      ).toLowerCase();

      const phone = (
        driver.personalInfo?.phone ||
        driver.phone ||
        ""
      ).toLowerCase();

      const licenseNumber = (
        driver.licenseInfo?.licenseNumber ||
        driver.license_number ||
        ""
      ).toLowerCase();

      const email = (
        driver.personalInfo?.email ||
        driver.email ||
        ""
      ).toLowerCase();

      const vendor = (
        driver.personalInfo?.vendor ||
        driver.vendor ||
        ""
      ).toLowerCase();

      const city = (
        driver.addressInfo?.city ||
        driver.city ||
        ""
      ).toLowerCase();

      return (
        fullName.includes(term) ||
        employeeId.includes(term) ||
        phone.includes(term) ||
        licenseNumber.includes(term) ||
        email.includes(term) ||
        vendor.includes(term) ||
        city.includes(term)
      );
    });
  }, [drivers, searchTerm]);

  // =====================================================
  // PAGINATION
  // =====================================================
  const totalPages = Math.ceil(filteredDrivers.length / rowsPerPage);

  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  // =====================================================
  // PAGE CHANGE
  // =====================================================
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // =====================================================
  // DRIVER HELPERS
  // =====================================================
  const getDriverName = (driver: any) => {
    const firstName = driver.personalInfo?.firstName || driver.first_name || "";

    const lastName = driver.personalInfo?.lastName || driver.last_name || "";

    return `${firstName} ${lastName}`.trim() || "—";
  };

  const getEmployeeId = (driver: any) =>
    driver.employmentInfo?.employeeId || driver.employee_id || "—";

  const getPhone = (driver: any) =>
    driver.personalInfo?.phone || driver.phone || "—";

  const getEmail = (driver: any) =>
    driver.personalInfo?.email || driver.email || "—";

  const getLicenseNumber = (driver: any) =>
    driver.licenseInfo?.licenseNumber || driver.license_number || "—";

  const getLicenseType = (driver: any) =>
    driver.licenseInfo?.licenseType || driver.license_type || null;

  const getVendor = (driver: any) =>
    driver.personalInfo?.vendor || driver.vendor || null;

  const getCity = (driver: any) =>
    driver.addressInfo?.city || driver.city || "—";

  const getState = (driver: any) =>
    driver.addressInfo?.state || driver.state || "—";

  const getBloodGroup = (driver: any) =>
    driver.personalInfo?.bloodGroup || driver.blood_group || null;

  // =====================================================
  // EDIT DRIVER
  // =====================================================
  const handleEditClick = async (driver: any) => {
    try {
      setEditLoading(true);

      const driverData = await dispatch(getDriverByIdThunk(driver.id)).unwrap();

      setSelectedDriver(driverData);
      setShowEditForm(true);

      onEdit?.(driverData);
    } catch (error) {
      console.error("Error fetching driver:", error);

      setToastMessage("Failed to load driver data");

      setShowSuccessToast(true);
    } finally {
      setEditLoading(false);
    }
  };

  // =====================================================
  // VIEW DRIVER
  // =====================================================
  const handleViewClick = async (driver: any) => {
    try {
      setViewLoading(true);

      const driverData = await dispatch(getDriverByIdThunk(driver.id)).unwrap();

      setSelectedDriver(driverData);
      setShowViewModal(true);

      onView?.(driverData);
    } catch (error) {
      console.error("Error fetching driver:", error);

      setToastMessage("Failed to load driver details");

      setShowSuccessToast(true);
    } finally {
      setViewLoading(false);
    }
  };

  // =====================================================
  // EDIT FORM
  // =====================================================
  if (showEditForm) {
    return (
      <DriverForm
        initialData={selectedDriver}
        mode="edit"
        onBack={() => {
          setShowEditForm(false);
          setSelectedDriver(null);
          dispatch(getDriversThunk());
        }}
      />
    );
  }

  // =====================================================
  // LOADING
  // =====================================================
  if (loading || editLoading || viewLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

          <span className="text-gray-600">
            {editLoading
              ? "Fetching driver details for edit..."
              : viewLoading
                ? "Fetching driver details..."
                : "Loading drivers..."}
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================
  if (error) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-4 text-red-600">Error: {error}</p>

          <button
            type="button"
            onClick={() => {
              dispatch(clearError());
              dispatch(getDriversThunk());
            }}
            className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================
  return (
    <div className="flex w-full flex-col overflow-hidden">
      {/* =====================================================
          VIEW MODAL
      ===================================================== */}
      <DriverViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedDriver(null);
        }}
        driverData={selectedDriver}
      />

      {/* =====================================================
          SUCCESS TOAST
      ===================================================== */}
      {showSuccessToast && (
        <div className="fixed right-4 top-4 z-50 animate-slide-in-right">
          <div className="flex items-center gap-3 rounded-lg border-l-4 border-green-500 bg-green-50 p-4 shadow-lg">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

            <p className="font-medium text-green-700">{toastMessage}</p>

            <button
              type="button"
              onClick={() => setShowSuccessToast(false)}
              className="text-green-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="mb-4 shrink-0">
        <LeadPageHeader
          title="Driver List"
          description={`${filteredDrivers.length} drivers under management`}
        >
          <div className="flex items-center gap-3">
            {/* SEARCH */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type="text"
                placeholder="Search by name, ID, phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-64 rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X
                    size={16}
                    className="text-gray-400 transition hover:text-gray-600"
                  />
                </button>
              )}
            </div>

            {/* REFRESH */}
            <button
              type="button"
              onClick={() => {
                dispatch(getDriversThunk());
              }}
              className="flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-300 active:scale-[0.98]"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </LeadPageHeader>
      </div>

      {/* =====================================================
          DRIVER TABLE
      ===================================================== */}
      <div className="flex min-h-0 flex-1 flex-col">
        <Table minWidth="min-w-[1600px]" maxHeight="max-h-[920px]">
          {/* =====================================================
              TABLE HEADER
          ===================================================== */}
          <TableHeader>
            <TableRow alternate={false}>
              <TableCell header sticky>
                #
              </TableCell>

              <TableCell header>Employee ID</TableCell>

              <TableCell header>Driver Name</TableCell>

              <TableCell header>Phone</TableCell>

              <TableCell header>Email</TableCell>

              <TableCell header>License Number</TableCell>

              <TableCell header>License Type</TableCell>

              <TableCell header>Vendor</TableCell>

              <TableCell header>City</TableCell>

              <TableCell header>State</TableCell>

              <TableCell header>Blood Group</TableCell>

              <TableCell header>Actions</TableCell>
            </TableRow>
          </TableHeader>

          {/* =====================================================
              TABLE BODY
          ===================================================== */}
          <tbody>
            {/* EMPTY */}
            {paginatedDrivers.length === 0 && (
              <tr>
                <td
                  colSpan={12}
                  className="px-5 py-16 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search size={34} className="text-gray-300" />

                    <span className="text-sm font-medium">
                      {searchTerm
                        ? "No matching drivers found"
                        : "No drivers found"}
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {/* DATA */}
            {paginatedDrivers.map((driver: any, index: number) => (
              <TableRow key={driver.id ?? index} index={index}>
                {/* S.NO */}
                <TableCell sticky rowIndex={index}>
                  {(currentPage - 1) * rowsPerPage + index + 1}
                </TableCell>

                {/* EMPLOYEE ID */}
                <TableCell>
                  <span className="font-mono text-xs font-medium text-blue-600">
                    {getEmployeeId(driver)}
                  </span>
                </TableCell>

                {/* DRIVER NAME */}
                <TableCell>
                  <span className="font-medium text-gray-800">
                    {getDriverName(driver)}
                  </span>
                </TableCell>

                {/* PHONE */}
                <TableCell>{getPhone(driver)}</TableCell>

                {/* EMAIL */}
                <TableCell>{getEmail(driver)}</TableCell>

                {/* LICENSE NUMBER */}
                <TableCell>
                  <span className="font-mono text-xs">
                    {getLicenseNumber(driver)}
                  </span>
                </TableCell>

                {/* LICENSE TYPE */}
                <TableCell>
                  {getLicenseType(driver) ? (
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {getLicenseType(driver)}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>

                {/* VENDOR */}
                <TableCell>
                  {getVendor(driver) ? (
                    <span className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                      {getVendor(driver)}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>

                {/* CITY */}
                <TableCell>{getCity(driver)}</TableCell>

                {/* STATE */}
                <TableCell>{getState(driver)}</TableCell>

                {/* BLOOD GROUP */}
                <TableCell>
                  {getBloodGroup(driver) ? (
                    <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                      {getBloodGroup(driver)}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>

                {/* ACTIONS */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {/* EDIT */}
                    <button
                      type="button"
                      onClick={() => handleEditClick(driver)}
                      className="rounded-lg bg-blue-100 p-2 text-blue-700 transition hover:bg-blue-200"
                      title="Edit Driver"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* VIEW */}
                    <button
                      type="button"
                      onClick={() => handleViewClick(driver)}
                      className="rounded-lg bg-gray-100 p-2 text-gray-700 transition hover:bg-gray-200"
                      title="View Driver"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>

        {/* =====================================================
            PAGINATION
        ===================================================== */}
        {filteredDrivers.length > 0 && (
          <div className="mt-2 shrink-0 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredDrivers.length}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* =====================================================
          ANIMATION
      ===================================================== */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }

          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DriverTable;
