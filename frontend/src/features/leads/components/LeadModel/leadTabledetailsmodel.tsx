import { useEffect, useState } from "react";
import {
  X,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Car,
  Users,
  Package,
  Flag,
  Briefcase,
  Clock,
  FileText,
  Tag,
  PhoneCall,
  Star,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface LeadDetailsModelProps {
  lead: any;
  isOpen: boolean;
  onClose: () => void;
}
const DetailRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number | null;
  icon?: React.ReactNode;
}) => (
  <div className="flex flex-col space-y-1">
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      {icon && <span className="text-gray-400 w-3.5 h-3.5">{icon}</span>}
      <span>{label}</span>
    </div>
    <div className="text-sm text-gray-900 break-words">
      {value || <span className="text-gray-400">—</span>}
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: string; bgColor: string }> = {
    New: { color: "text-blue-700", bgColor: "bg-blue-50" },
    KYC: { color: "text-amber-700", bgColor: "bg-amber-50" },
    RFQ: { color: "text-red-700", bgColor: "bg-red-50" },
    HOT: { color: "text-pink-700", bgColor: "bg-pink-50" },
    Book: { color: "text-green-700", bgColor: "bg-green-50" },
    Lost: { color: "text-gray-700", bgColor: "bg-gray-50" },
  };

  const config = statusConfig[status] || {
    color: "text-gray-700",
    bgColor: "bg-gray-50",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-medium ${config.bgColor} ${config.color}`}
    >
      {status || "N/A"}
    </span>
  );
};

const LeadDetailsModel = ({ lead, isOpen, onClose }: LeadDetailsModelProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return null;
    try {
      return new Date(dateTime).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-100 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white border-b border-gray-200 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Lead Details
            </h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <p>ID: {lead.id || "—"}</p>
              <p>City: {lead.city || "—"}</p>
              <p>
                Date:{" "}
                {lead.enquiryTime
                  ? new Date(lead.enquiryTime).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Quick Info Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <StatusBadge status={lead.status} />
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Source</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                <Tag size={14} className="text-gray-400" />
                {lead.source || "—"}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Telecaller</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                <PhoneCall size={14} className="text-gray-400" />
                {lead.telecaller || "—"}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Follow Up</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                <Clock size={14} className="text-gray-400" />
                {lead.followup || "—"}
              </div>
            </div>
          </div>

          {/* Customer Information - Blue theme */}
          <div className="rounded-xl border border-blue-200 overflow-hidden">
            <div className="px-5 py-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                <h3 className="font-medium text-gray-900">
                  Customer Information
                </h3>
              </div>
            </div>
            <div className="p-5 bg-blue-50/30">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                <DetailRow
                  label="Full Name"
                  value={lead.fullName}
                  icon={<User size={12} />}
                />
                <DetailRow
                  label="Phone Number"
                  value={lead.customerPhone}
                  icon={<Phone size={12} />}
                />
                <DetailRow
                  label="Alternate Phone"
                  value={lead.alternatePhone}
                  icon={<Phone size={12} />}
                />
                <DetailRow
                  label="Customer Category"
                  value={lead.customerType}
                  icon={<Building2 size={12} />}
                />
                <DetailRow
                  label="Customer Type"
                  value={lead.customerCategoryType}
                  icon={<Building2 size={12} />}
                />
                <DetailRow
                  label="Company"
                  value={lead.companyName}
                  icon={<Building2 size={12} />}
                />
                <DetailRow
                  label="Email Address"
                  value={lead.customerEmail}
                  icon={<Mail size={12} />}
                />
                <DetailRow
                  label="Country"
                  value={lead.countryName}
                  icon={<Flag size={12} />}
                />
                <DetailRow
                  label="Customer City"
                  value={lead.customerCity}
                  icon={<MapPin size={12} />}
                />
              </div>
            </div>
          </div>

          {/* Travel Details - Pink theme */}
          <div className="rounded-xl border border-pink-200 overflow-hidden">
            <div className="px-5 py-4 bg-pink-50 border-b border-pink-200">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-pink-500" />
                <h3 className="font-medium text-gray-900">Travel Details</h3>
              </div>
            </div>
            <div className="p-5 bg-pink-50/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <DetailRow label="Trip Type" value={lead.tripType} />
                <DetailRow label="Service Type" value={lead.serviceType} />
                <DetailRow
                  label="Pickup Date & Time"
                  value={formatDateTime(lead.pickupDateTime)}
                  icon={<Calendar size={12} />}
                />
                <DetailRow
                  label="Drop Date & Time"
                  value={formatDateTime(lead.dropDateTime)}
                  icon={<Calendar size={12} />}
                />
                <DetailRow
                  label="Pickup City"
                  value={lead.pickupcity}
                  icon={<MapPin size={12} />}
                />
                <DetailRow
                  label="Drop City"
                  value={lead.dropcity}
                  icon={<MapPin size={12} />}
                />
                <DetailRow label="Duration (Days)" value={lead.days} />
                <DetailRow label="Distance (KM)" value={lead.km} />
                <div className="col-span-2">
                  <DetailRow
                    label="Pickup Address"
                    value={lead.pickupAddress}
                  />
                </div>
                <div className="col-span-2">
                  <DetailRow label="Drop Address" value={lead.dropAddress} />
                </div>
              </div>
            </div>
          </div>

          {/* Passenger & Baggage Details - Green theme */}
          <div className="rounded-xl border border-green-200 overflow-hidden">
            <div className="px-5 py-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-green-600" />
                <h3 className="font-medium text-gray-900">
                  Passenger & Baggage Details
                </h3>
              </div>
            </div>
            <div className="p-5 bg-green-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Users size={14} /> Passenger Information
                  </h4>
                  <div className="space-y-3">
                    <DetailRow
                      label="Total Passengers"
                      value={lead.passengerTotal}
                    />
                    {lead.petsNumber && (
                      <DetailRow
                        label="Pets"
                        value={`${lead.petsNumber} ${lead.petsNames ? `(${lead.petsNames})` : ""}`}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Package size={14} /> Baggage Details
                  </h4>
                  <div className="space-y-3">
                    <DetailRow
                      label="Total Baggage"
                      value={lead.totalBaggage}
                    />
                    {(lead.smallBaggage ||
                      lead.mediumBaggage ||
                      lead.largeBaggage ||
                      lead.airportBaggage) && (
                      <div className="flex flex-wrap gap-3 mt-2">
                        {lead.smallBaggage && (
                          <span className="text-xs bg-white px-2 py-1 rounded border border-green-200">
                            Small: {lead.smallBaggage}
                          </span>
                        )}
                        {lead.mediumBaggage && (
                          <span className="text-xs bg-white px-2 py-1 rounded border border-green-200">
                            Medium: {lead.mediumBaggage}
                          </span>
                        )}
                        {lead.largeBaggage && (
                          <span className="text-xs bg-white px-2 py-1 rounded border border-green-200">
                            Large: {lead.largeBaggage}
                          </span>
                        )}
                        {lead.airportBaggage && (
                          <span className="text-xs bg-white px-2 py-1 rounded border border-green-200">
                            Airport: {lead.airportBaggage}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Requirements - Purple theme */}
          <div className="rounded-xl border border-purple-200 overflow-hidden">
            <div className="px-5 py-4 bg-purple-50 border-b border-purple-200">
              <div className="flex items-center gap-2">
                <Car size={18} className="text-purple-600" />
                <h3 className="font-medium text-gray-900">
                  Vehicle Requirements
                </h3>
              </div>
            </div>
            <div className="p-5 bg-purple-50/30">
              {lead.vehicles &&
              Array.isArray(lead.vehicles) &&
              lead.vehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {lead.vehicles.map((vehicle: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200"
                    >
                      <span className="font-medium text-gray-900">
                        {vehicle.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {vehicle.quantity}x
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No vehicles specified</p>
              )}
            </div>
          </div>

          {/* Trip Itinerary - Yellow/Orange theme */}
          {lead.itinerary &&
            Array.isArray(lead.itinerary) &&
            lead.itinerary.length > 0 && (
              <div className="rounded-xl border border-amber-200 overflow-hidden">
                <div className="px-5 py-4 bg-amber-50 border-b border-amber-200">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-amber-600" />
                    <h3 className="font-medium text-gray-900">
                      Trip Itinerary
                    </h3>
                  </div>
                </div>
                <div className="p-5 bg-amber-50/30">
                  <div className="space-y-2">
                    {lead.itinerary.map((item: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200"
                      >
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <p className="text-sm text-gray-700 flex-1">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {/* Additional Information - Gray theme */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-gray-500" />
                <h3 className="font-medium text-gray-900">
                  Additional Information
                </h3>
              </div>
            </div>
            <div className="p-5 bg-gray-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <DetailRow
                  label="Occasion"
                  value={lead.occasion}
                  icon={<Star size={12} />}
                />
                <DetailRow label="Remarks" value={lead.remarks} />
                {lead.lost_reason && (
                  <>
                    <DetailRow label="Lost Reason" value={lead.lost_reason} />
                    <DetailRow
                      label="Lost Reason Details"
                      value={lead.message}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end p-4 bg-white border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModel;
