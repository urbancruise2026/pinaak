"use client";

import React, { useState, useEffect, useRef } from "react";
import { DSR_TABLE_BANNER, BannerColumn, GROUP_COLORS } from "./DsrTableHeader";
import { DsrRecord } from "@/types/types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchAllDsr } from "@/features/dsr/dsrSlice";
import Pagination from "@/components/ui/pagination";
import ViewDsrModal from "./viewDsrModel";
import { MoreVertical, ReceiptText, Share2, Printer } from "lucide-react";

import {
  Eye,
  Edit,
  Trash2,
  Search,
  Download,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import DsrForm from "./DsrForm";

export default function DsrTable({
  onEdit,
  onView,
  onDelete,
  onRefund,
  onShare,
  onPrint,
}: {
  onEdit?: (dsr: DsrRecord) => void;
  onView?: (dsr: DsrRecord) => void;
  onDelete?: (id: string) => void;
  onRefund?: (dsr: DsrRecord) => void;
  onShare?: (dsr: DsrRecord) => void;
  onPrint?: (dsr: DsrRecord) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const { dsrList, listLoading, listError, totalCount } = useSelector(
    (state: RootState) => state.dsr,
  );
  console.log("dsr listtss", dsrList);
  const safeDsrList: DsrRecord[] = Array.isArray(dsrList) ? dsrList : [];

  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("dsr_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const total = totalCount ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedDsr, setSelectedDsr] = useState<DsrRecord | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDsr, setViewDsr] = useState<DsrRecord | null>(null);

  // ✅ Dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const fetchData = () => {
    dispatch(
      fetchAllDsr({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        sortField,
        sortOrder,
      }),
    );
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchTerm, sortField, sortOrder]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleEditClick = (dsr: DsrRecord) => {
    setSelectedDsr(dsr);
    setShowEditForm(true);
    if (onEdit) onEdit(dsr);
  };

  const handleBackToList = () => {
    setShowEditForm(false);
    setSelectedDsr(null);
    fetchData();
  };

  const formatCurrency = (value: string | number | undefined) => {
    if (!value || value === "0" || value === 0) return "₹0";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const renderCell = (dsr: DsrRecord, column: BannerColumn) => {
    // Customer JSON data
    const customer =
      Array.isArray(dsr.customer_amount) && dsr.customer_amount.length > 0
        ? dsr.customer_amount[0]
        : {};

    // Vendor JSON data
    const vendor =
      Array.isArray(dsr.vendor_amount) && dsr.vendor_amount.length > 0
        ? dsr.vendor_amount[0]
        : {};

    // Customer payment mapping
    const customerMap: Record<string, any> = {
      customerAmountReceivedDate: customer?.amountReceivedDate,
      cusomerUcBankName: customer?.ucBankName,
      customerBankName: customer?.customerBankName,
      customerAmount_received: customer?.bookingAmount,
      customerAtherAmount: customer?.otherAmount,
      customerTransactionId: customer?.transactionId,
      customerRemarksAmountReceived: customer?.remarks,
      customerEnteredBy: customer?.enteredBy,
    };

    // Vendor payment mapping
    const vendorMap: Record<string, any> = {
      vendorAmountReceivedDate: vendor?.amountReceivedDate,
      vendorUcBankName: vendor?.ucBankName,
      vendorCustomerBankName: vendor?.customerBankName,
      vendorTransactionId: vendor?.transactionId,
      vendorBookingAmount: vendor?.bookingAmount,
      vendorOtherAmount: vendor?.otherAmount,
      vendorRemarksAmountReceived: vendor?.remarks,
      vendorEnteredBy: vendor?.enteredBy,
    };

    // Final value
    const value =
      customerMap[column.key] ??
      vendorMap[column.key] ??
      dsr[column.key as keyof DsrRecord];

    // ✅ Actions column
    if (column.key === "actions") {
      return (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => {
              setViewDsr(dsr);
              setViewModalOpen(true);
              onView?.(dsr);
            }}
            className="p-1 rounded text-blue-600 hover:bg-blue-100"
            title="View"
          >
            <Eye size={15} />
          </button>

          <button
            onClick={() => handleEditClick(dsr)}
            className="p-1 rounded text-orange-500 hover:bg-orange-100"
            title="Edit"
          >
            <Edit size={15} />
          </button>

          <button
            onClick={() => {
              if (window.confirm("Delete this DSR?")) onDelete?.(dsr.id!);
            }}
            className="p-1 rounded text-red-500 hover:bg-red-100"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>

          {/* ✅ More options dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdownId(openDropdownId === dsr.id ? null : dsr.id!);
              }}
              className="p-1 rounded text-gray-500 hover:bg-gray-100"
              title="More options"
            >
              <MoreVertical size={15} />
            </button>

            {openDropdownId === dsr.id && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <button
                  onClick={() => {
                    onRefund?.(dsr);
                    setOpenDropdownId(null);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 text-emerald-600 rounded-t-md"
                >
                  <ReceiptText size={14} /> Refund
                </button>
                <hr className="border-gray-100" />
                <button
                  onClick={() => {
                    onShare?.(dsr);
                    setOpenDropdownId(null);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 text-indigo-600"
                >
                  <Share2 size={14} /> Share
                </button>
                <hr className="border-gray-100" />
                <button
                  onClick={() => {
                    onPrint?.(dsr);
                    setOpenDropdownId(null);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 text-slate-500 rounded-b-md"
                >
                  <Printer size={14} /> Print
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Full Name tooltip
    if (column.key === "fullName") {
      return (
        <div className="relative group inline-block w-full">
          <span className="cursor-default">{String(value ?? "—")}</span>
          {dsr.customerPhone && (
            <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
              📞 Phone: {dsr.customerPhone}
            </div>
          )}
        </div>
      );
    }

    if (column.key === "total") {
      return (
        <div className="relative group inline-block w-full">
          <span className="cursor-help font-medium">
            {formatCurrency(value as string | number)}
          </span>

          {dsr.customer_amount &&
            Array.isArray(dsr.customer_amount) &&
            dsr.customer_amount.length > 0 && (
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 z-50 hidden group-hover:block bg-white border border-gray-300 rounded-lg shadow-2xl w-auto pointer-events-auto">
                <div className="p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold rounded-t-lg">
                  Customer Amount Details ({dsr.customer_amount.length} Records)
                </div>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-auto text-xs border-collapse table-auto">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr className="border-b-2 border-gray-300">
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">S.No</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">Booking Amount</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">Other Amount</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">Total Amount</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">Received Date</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">Transaction ID</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">UC Bank Name</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">Customer Bank Name</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">Remarks</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 whitespace-nowrap">Entered By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dsr.customer_amount.map((customer: any, index: number) => {
                        const bookingAmount = customer.bookingAmount || customer.customerAmount_received || "0";
                        const otherAmount = customer.otherAmount || customer.customerAtherAmount || "0";
                        return (
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-3 py-2.5 text-gray-900 font-medium border-r border-gray-200 bg-gray-50 whitespace-nowrap text-center">{index + 1}</td>
                            <td className="px-3 py-2.5 text-gray-900 font-medium border-r border-gray-200 whitespace-nowrap">{formatCurrency(bookingAmount)}</td>
                            <td className="px-3 py-2.5 text-gray-900 font-medium border-r border-gray-200 whitespace-nowrap">{formatCurrency(otherAmount)}</td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold text-orange-600 border-r border-gray-200 whitespace-nowrap">
                              {formatCurrency((parseFloat(bookingAmount) || 0) + (parseFloat(otherAmount) || 0))}
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 border-r border-gray-200 whitespace-nowrap">
                              {customer.amountReceivedDate || customer.customerAmountReceivedDate
                                ? new Date(customer.amountReceivedDate || customer.customerAmountReceivedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
                                : "—"}
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 font-mono text-xs border-r border-gray-200">
                              <div className="truncate" title={customer.transactionId || customer.customerTransactionId}>
                                {customer.transactionId || customer.customerTransactionId || "—"}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 border-r border-gray-200 whitespace-nowrap">{customer.ucBankName || customer.cusomerUcBankName || "—"}</td>
                            <td className="px-3 py-2.5 text-gray-900 border-r border-gray-200 whitespace-nowrap">{customer.customerBankName || "—"}</td>
                            <td className="px-3 py-2.5 text-gray-900 max-w-[250px] border-r border-gray-200" title={customer.remarks || customer.customerRemarksAmountReceived}>
                              <div className="truncate">{customer.remarks || customer.customerRemarksAmountReceived || "—"}</div>
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{customer.enteredBy || customer.customerEnteredBy || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 sticky bottom-0">
                      <tr className="border-t-2 border-gray-300">
                        <td className="px-3 py-2.5 font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap">Total</td>
                        <td className="px-3 py-2.5 font-bold text-gray-900 border-r border-gray-200 whitespace-nowrap">
                          {formatCurrency(dsr.customer_amount.reduce((sum: number, c: any) => { const amt = parseFloat(c.bookingAmount || c.customerAmount_received || "0"); return sum + (isNaN(amt) ? 0 : amt); }, 0))}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-gray-900 border-r border-gray-200 whitespace-nowrap">
                          {formatCurrency(dsr.customer_amount.reduce((sum: number, c: any) => { const amt = parseFloat(c.otherAmount || c.customerAtherAmount || "0"); return sum + (isNaN(amt) ? 0 : amt); }, 0))}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-orange-600 border-r border-gray-200 whitespace-nowrap">
                          {formatCurrency(dsr.customer_amount.reduce((sum: number, c: any) => {
                            const b = parseFloat(c.bookingAmount || c.customerAmount_received || "0");
                            const o = parseFloat(c.otherAmount || c.customerAtherAmount || "0");
                            return sum + (isNaN(b) ? 0 : b) + (isNaN(o) ? 0 : o);
                          }, 0))}
                        </td>
                        <td colSpan={6} className="px-3 py-2.5 text-gray-500 whitespace-nowrap">Total Records: {dsr.customer_amount.length}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
        </div>
      );
    }

    if (column.key === "balance_amount") {
      return (
        <div className="relative group inline-block w-full">
          <span className="cursor-help font-medium">
            {formatCurrency(value as string | number)}
          </span>

          {dsr.vendor_amount &&
            Array.isArray(dsr.vendor_amount) &&
            dsr.vendor_amount.length > 0 && (
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 z-50 hidden group-hover:block bg-white border border-gray-300 rounded-lg shadow-2xl w-auto pointer-events-auto">
                <div className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-t-lg">
                  Vendor Payment Details ({dsr.vendor_amount.length} Records)
                </div>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-auto text-xs border-collapse table-auto">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr className="border-b-2 border-gray-300">
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">S.No</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">VDR Amt RCD</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">VDR OTHER Amt</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">Total Amount</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">VDR AMT RCD DATE</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">VDR TRANSACTION ID</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">UC BANK NAME</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">VENDOR BANK NAME</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap">VDR RMK AMT</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700 whitespace-nowrap">Enter BY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dsr.vendor_amount.map((vendor: any, index: number) => {
                        const bookingAmount = vendor.bookingAmount || vendor.vendorBookingAmount || "0";
                        const otherAmount = vendor.otherAmount || vendor.vendorOtherAmount || "0";
                        return (
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-3 py-2.5 text-gray-900 font-medium border-r border-gray-200 bg-gray-50 whitespace-nowrap text-center">{index + 1}</td>
                            <td className="px-3 py-2.5 text-gray-900 font-medium border-r border-gray-200 whitespace-nowrap">{formatCurrency(bookingAmount)}</td>
                            <td className="px-3 py-2.5 text-gray-900 font-medium border-r border-gray-200 whitespace-nowrap">{formatCurrency(otherAmount)}</td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold text-blue-600 border-r border-gray-200 whitespace-nowrap">
                              {formatCurrency((parseFloat(bookingAmount) || 0) + (parseFloat(otherAmount) || 0))}
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 border-r border-gray-200 whitespace-nowrap">
                              {vendor.amountReceivedDate || vendor.vendorAmountReceivedDate
                                ? new Date(vendor.amountReceivedDate || vendor.vendorAmountReceivedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
                                : "—"}
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 font-mono text-xs border-r border-gray-200">
                              <div className="truncate max-w-[200px]" title={vendor.transactionId || vendor.vendorTransactionId}>
                                {vendor.transactionId || vendor.vendorTransactionId || "—"}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 border-r border-gray-200 whitespace-nowrap">{vendor.ucBankName || vendor.vendorUcBankName || "—"}</td>
                            <td className="px-3 py-2.5 text-gray-900 border-r border-gray-200 whitespace-nowrap">{vendor.customerBankName || vendor.vendorCustomerBankName || "—"}</td>
                            <td className="px-3 py-2.5 text-gray-900 max-w-[250px] border-r border-gray-200" title={vendor.remarks || vendor.vendorRemarksAmountReceived}>
                              <div className="truncate">{vendor.remarks || vendor.vendorRemarksAmountReceived || "—"}</div>
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{vendor.enteredBy || vendor.vendorEnteredBy || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 sticky bottom-0">
                      <tr className="border-t-2 border-gray-300">
                        <td className="px-3 py-2.5 font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap">Total</td>
                        <td className="px-3 py-2.5 font-bold text-gray-900 border-r border-gray-200 whitespace-nowrap">
                          {formatCurrency(dsr.vendor_amount.reduce((sum: number, v: any) => { const amt = parseFloat(v.bookingAmount || v.vendorBookingAmount || "0"); return sum + (isNaN(amt) ? 0 : amt); }, 0))}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-gray-900 border-r border-gray-200 whitespace-nowrap">
                          {formatCurrency(dsr.vendor_amount.reduce((sum: number, v: any) => { const amt = parseFloat(v.otherAmount || v.vendorOtherAmount || "0"); return sum + (isNaN(amt) ? 0 : amt); }, 0))}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-blue-600 border-r border-gray-200 whitespace-nowrap">
                          {formatCurrency(dsr.vendor_amount.reduce((sum: number, v: any) => {
                            const b = parseFloat(v.bookingAmount || v.vendorBookingAmount || "0");
                            const o = parseFloat(v.otherAmount || v.vendorOtherAmount || "0");
                            return sum + (isNaN(b) ? 0 : b) + (isNaN(o) ? 0 : o);
                          }, 0))}
                        </td>
                        <td colSpan={6} className="px-3 py-2.5 text-gray-500 whitespace-nowrap">Total Records: {dsr.vendor_amount.length}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
        </div>
      );
    }

    // Currency fields
    const currencyFields = [
      "customer_rate", "customer_toll", "park_tax", "gst_amt", "other_amount",
      "tds", "remaining_amount", "vendor_rate", "vendor_toll", "vendor_park_tax",
      "customer_to_vendor", "outstanding", "balance_amount", "rate", "pay",
      "final_balance", "before_amt", "final_amt", "gst", "customerAmount_received",
      "customerAtherAmount", "vendorBookingAmount", "vendorOtherAmount",
    ];

    if (currencyFields.includes(column.key)) {
      return <span className="font-medium">{formatCurrency(value as string | number)}</span>;
    }

    // Date fields
    const dateFields = [
      "dsr_date", "pickupDateTime", "dropDateTime",
      "customerAmountReceivedDate", "vendorAmountReceivedDate",
    ];

    if (dateFields.includes(column.key) && value) {
      try {
        return new Date(value).toLocaleDateString("en-IN");
      } catch {
        return <span className="text-gray-400">—</span>;
      }
    }

    // Default render
    return value !== undefined && value !== null && value !== "" ? (
      String(value)
    ) : (
      <span className="text-gray-400">—</span>
    );
  };

  const getBannerGroups = () => {
    const groups: Array<{ id: string; label: string; colSpan: number; darkColor: string }> = [];
    let current: { id: string; label: string; colSpan: number; darkColor: string } | null = null;

    DSR_TABLE_BANNER.forEach((col, i) => {
      const colors = GROUP_COLORS[col.groupLabel];
      if (!current || current.label !== col.groupLabel) {
        if (current) groups.push(current);
        current = { id: `${col.groupLabel}-${i}`, label: col.groupLabel, colSpan: 1, darkColor: colors.dark };
      } else {
        current.colSpan += 1;
      }
    });

    if (current) groups.push(current);
    return groups;
  };

  const bannerGroups = getBannerGroups();

  const getCellBgClass = (column: BannerColumn) => {
    const colors = GROUP_COLORS[column.groupLabel];
    return colors.light;
  };

  // Edit Mode ON → DsrForm dikhao
  if (showEditForm && selectedDsr) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
            Back to DSR List
          </button>
        </div>
        <DsrForm editData={selectedDsr} onEditComplete={handleBackToList} />
      </div>
    );
  }

  // Main Table
  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4">
        <div className="pl-4 border-l-8 border-orange-500 bg-white px-4 rounded-md shadow-sm">
          <h2 className="text-3xl font-bold py-3 text-orange-600">DSR Records</h2>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, lead ID, booking ID..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n} rows</option>
              ))}
            </select>

            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* ERROR BANNER */}
      {listError && (
        <div className="mx-4 mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
          <span className="font-semibold">Error:</span>
          {listError}
          <button onClick={fetchData} className="ml-auto text-red-500 underline">Retry</button>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
        <table className="w-auto border-collapse">
          <thead className="sticky top-0 z-20">
            <tr>
              {bannerGroups.map((group) => (
                <th
                  key={group.id}
                  colSpan={group.colSpan}
                  className={`p-3 border-2 border-white ${group.darkColor}`}
                >
                  <div className="text-sm font-black uppercase tracking-wide text-white text-center">
                    {group.label}
                  </div>
                </th>
              ))}
            </tr>
            <tr>
              {DSR_TABLE_BANNER.map((column) => {
                const colors = GROUP_COLORS[column.groupLabel];
                return (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key)}
                    className={`
                      ${column.minWidthClass}
                      px-2 py-3 text-xs font-semibold text-white
                      border border-white cursor-pointer ${colors.dark}
                      hover:brightness-95 whitespace-nowrap
                      text-${column.align ?? "left"}
                    `}
                  >
                    {column.label}
                    {sortField === column.key && (sortOrder === "asc" ? " ↑" : " ↓")}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-red-500">
            {listLoading ? (
              <tr>
                <td colSpan={DSR_TABLE_BANNER.length} className="text-center py-20 border border-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
                  <p className="text-gray-400 mt-3 text-sm">Loading DSR records...</p>
                </td>
              </tr>
            ) : safeDsrList.length === 0 ? (
              <tr>
                <td colSpan={DSR_TABLE_BANNER.length} className="text-center py-12 border border-white">
                  <Search size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-lg">No DSR records found</p>
                  {searchTerm && <p className="text-gray-400 text-sm mt-1">Try changing your search</p>}
                </td>
              </tr>
            ) : (
              safeDsrList.map((dsr, rowIndex) => (
                <tr key={dsr.id || rowIndex} className="hover:shadow-md transition-all duration-200">
                  {DSR_TABLE_BANNER.map((column) => {
                    const cellBgClass = getCellBgClass(column);
                    return (
                      <td
                        key={column.key}
                        className={`
                          ${column.minWidthClass}
                          px-2 py-2 border border-gray-500 text-xs whitespace-nowrap
                          ${cellBgClass} text-black
                          ${column.align === "center" ? "text-center" : ""}
                        `}
                      >
                        {renderCell(dsr, column)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={total}
        rowsPerPage={pageSize}
        onPageChange={handlePageChange}
      />

      {/* View DSR Modal */}
      <ViewDsrModal
        dsr={viewDsr}
        isOpen={viewModalOpen}
        onClose={() => { setViewModalOpen(false); setViewDsr(null); }}
      />
    </div>
  );
}