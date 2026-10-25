"use client";

import { useState, useEffect, useMemo } from "react";
import { Target, Filter } from "lucide-react";

export default function Dashboard() {
  const [leads, setLeads] = useState([
    {
      platform: "Google",
      date: "12 Nov 2021 9:30 PM",
      contactBy: "Peter John",
      source: "Call",
      email: "peterjohn@gmail.com",
      stage: 40,
      stageLabel: "First discussion Completed",
      status: "New",
      extraKm: "",
      tripStartDate: "",
      tripEndDate: "",
      price: "",
      people: "",
      remarks: "",
      followup: "",
      reminderType: "",
      reminderDate: "",
    },
    {
      platform: "Facebook",
      date: "12 Nov 2021 9:30 PM",
      contactBy: "Jasmine",
      source: "Email",
      email: "peterjohn@gmail.com",
      stage: 80,
      stageLabel: "Demo Completed",
      status: "RFQ",
      extraKm: "",
      tripStartDate: "",
      tripEndDate: "",
      price: "",
      people: "",
      remarks: "",
      followup: "",
      reminderType: "",
      reminderDate: "",
    },
    {
      platform: "Twitter",
      date: "12 Nov 2021 9:30 PM",
      contactBy: "Nick",
      source: "Call",
      email: "peterjohn@gmail.com",
      stage: 30,
      stageLabel: "Demo Completed",
      status: "Hot",
      extraKm: "",
      tripStartDate: "",
      tripEndDate: "",
      price: "",
      people: "",
      remarks: "",
      followup: "",
      reminderType: "",
      reminderDate: "",
    },
  ]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [selectedLeadForReminder, setSelectedLeadForReminder] =
    useState<any>(null);
  const [filters, setFilters] = useState({
    tripStartDate: "",
    tripEndDate: "",
    status: "",
    source: "",
  });

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filters.tripStartDate && lead.tripStartDate !== filters.tripStartDate)
        return false;
      if (filters.tripEndDate && lead.tripEndDate !== filters.tripEndDate)
        return false;
      if (filters.status && lead.status !== filters.status) return false;
      if (filters.source && lead.source !== filters.source) return false;
      return true;
    });
  }, [leads, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const activeLeads = leads.filter((l) => l.status !== "Lost").length;
    const lostLeads = leads.filter((l) => l.status === "Lost").length;
    const swapLeads = leads.filter((l) => l.extraKm !== "").length; // Assuming swap if extraKm is set
    const kyc = leads.filter((l) => l.stage >= 80).length; // Assuming KYC at stage 80+
    const closeTrip = leads.filter((l) => l.stage === 100).length;
    const conversionRate =
      totalLeads > 0 ? Math.round((closeTrip / totalLeads) * 100) : 0;
    return {
      totalLeads,
      activeLeads,
      lostLeads,
      swapLeads,
      kyc,
      closeTrip,
      conversionRate,
    };
  }, [leads]);

  // My Day Panel calculations
  const myDay = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const todaysFollowups = leads.filter(
      (l) => l.followup && l.followup.includes(today),
    );
    const todaysTripStarts = leads.filter(
      (l) => l.tripStartDate && l.tripStartDate.startsWith(today),
    );
    const upcomingReminders = leads
      .filter((l) => l.reminderDate)
      .sort(
        (a, b) =>
          new Date(a.reminderDate).getTime() -
          new Date(b.reminderDate).getTime(),
      );
    const nextReminder = upcomingReminders[0];
    const expectedRevenue = 500000;
    const collectedRevenue = leads
      .filter((l) => l.stage === 100)
      .reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
    return {
      todaysFollowups,
      todaysTripStarts,
      nextReminder,
      expectedRevenue,
      collectedRevenue,
    };
  }, [leads]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      leads.forEach((lead) => {
        if (lead.reminderDate) {
          const reminderTime = new Date(lead.reminderDate);
          const diff = reminderTime.getTime() - now.getTime();
          if (diff <= 60000 && diff > -60000) {
            // within 1 minute before or after
            setSelectedLeadForReminder(lead);
            setShowReminderPopup(true);
          }
        }
      });
    }, 30000); // check every 30 seconds
    return () => clearInterval(interval);
  }, [leads]);

  // Lead Health Score
  const getLeadHealth = (lead: any) => {
    if (lead.stage >= 80)
      return { score: "Strong", color: "bg-green-500", text: "text-white" };
    if (lead.status === "Hot" && lead.price)
      return {
        score: "High Chance 🔥",
        color: "bg-orange-500",
        text: "text-white",
      };
    if (lead.reminderDate && new Date(lead.reminderDate) < new Date())
      return { score: "Risk", color: "bg-red-500", text: "text-white" };
    if (!lead.followup)
      return { score: "Attention", color: "bg-yellow-500", text: "text-black" };
    return { score: "Normal", color: "bg-gray-500", text: "text-white" };
  };

  // Smart Follow-up Suggestions
  const getFollowupSuggestions = (lead: any) => {
    const suggestions = [];
    if (lead.status === "RFQ" && !lead.price)
      suggestions.push("Send quotation");
    if (lead.status === "Hot" && !lead.followup)
      suggestions.push("Call customer today");
    if (lead.tripStartDate) {
      const tripDate = new Date(lead.tripStartDate);
      const now = new Date();
      const diffDays =
        (tripDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
      if (diffDays <= 2 && diffDays > 0)
        suggestions.push("Confirm vehicle & payment");
    }
    return suggestions;
  };

  // Trip Readiness Checklist
  const getReadinessChecklist = (lead: any) => {
    const checks = [
      { label: "Price Final", done: !!lead.price },
      { label: "People Count", done: !!lead.people },
      { label: "Trip Dates", done: !!(lead.tripStartDate && lead.tripEndDate) },
      {
        label: "Reminder Set",
        done: !!(lead.reminderDate && lead.reminderType),
      },
      { label: "KYC Done", done: lead.status === "Kyc" || lead.stage >= 80 },
    ];
    const completed = checks.filter((c) => c.done).length;
    return { checks, completed, total: checks.length };
  };

  const [formData, setFormData] = useState({
    status: "",
    extraKm: "",
    stage: "",
    tripStartDate: "",
    tripEndDate: "",
    price: "",
    people: "",
    remarks: "",
    followup: "",
    reminderType: "",
    reminderDate: "",
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {/* My Day Panel */}
      <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">
          Today! What's my plan As a Team Leader Sristi{" "}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white bg-opacity-20 p-4 rounded text-black">
            <h3 className="font-semibold">Today's Follow-ups</h3>
            <p className="text-2xl font-bold">{myDay.todaysFollowups.length}</p>
            {myDay.todaysFollowups.length > 0 && (
              <p className="text-sm">Urgent items</p>
            )}
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded text-black">
            <h3 className="font-semibold">Today's Trip Starts</h3>
            <p className="text-2xl font-bold">
              {myDay.todaysTripStarts.length}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded text-black">
            <h3 className="font-semibold">Next Reminder</h3>
            <p className="text-lg">
              {myDay.nextReminder
                ? new Date(myDay.nextReminder.reminderDate).toLocaleString()
                : "No upcoming reminders"}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded text-black">
            <h3 className="font-semibold">Today Exprense Revenue</h3>
            <p className="text-2xl font-bold">
              {myDay.todaysTripStarts.length}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded text-black">
            <h3 className="font-semibold">Revenue</h3>
            <p className="text-lg">
              Target: ₹{myDay.expectedRevenue.toLocaleString()}
            </p>
            <p className="text-lg">
              Collected: ₹{myDay.collectedRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center mb-4">
          <Filter className="mr-2" />
          <h2 className="text-xl font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="date"
            placeholder="From Date"
            className="p-2 border rounded"
            value={filters.tripStartDate}
            onChange={(e) =>
              setFilters({ ...filters, tripStartDate: e.target.value })
            }
          />
          <input
            type="date"
            placeholder="To Date"
            className="p-2 border rounded"
            value={filters.tripEndDate}
            onChange={(e) =>
              setFilters({ ...filters, tripEndDate: e.target.value })
            }
          />
          <select
            className="p-2 border rounded"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="RFQ">RFQ</option>
            <option value="Hot">Hot</option>
            <option value="Book">Book</option>
            <option value="Veh-n">Veh-n</option>
            <option value="Lost">Lost</option>
            <option value="Kyc">Kyc</option>
          </select>
          <select
            className="p-2 border rounded"
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
          >
            <option value="">All Sources</option>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Reference">Reference</option>
            <option value="Repeat">Repeat</option>
            <option value="GAC">GAC</option>
            <option value="GAQ">GAQ</option>
            <option value="META">META</option>
            <option value="Google">Google</option>
          </select>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600 font-extrabold">Total Leads</p>
          <h2 className="text-2xl font-bold">{stats.totalLeads}</h2>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600 font-extrabold">Active Leads</p>
          <h2 className="text-2xl font-bold">{stats.activeLeads}</h2>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600 font-extrabold">Lost Leads</p>
          <h2 className="text-2xl font-bold">{stats.lostLeads}</h2>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600 font-extrabold">Swap Leads</p>
          <h2 className="text-2xl font-bold">{stats.swapLeads}</h2>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600 font-extrabold">KYC</p>
          <h2 className="text-2xl font-bold">{stats.kyc}</h2>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600 font-extrabold">Close Trip</p>
          <h2 className="text-2xl font-bold">{stats.closeTrip}</h2>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Target className="text-green-500 mr-3" size={24} />
            <div>
              <p className="text-gray-600 font-extrabold">Conversion Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.conversionRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Section */}
      <div
        className={`mb-8 mt-6 ${editingIndex !== null ? "pointer-events-none " : ""}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Leads</h2>
          <button className="bg-purple-600 text-white px-4 py-1 rounded">
            View All
          </button>
        </div>
        <div className="flex gap-6 overflow-x-auto">
          {filteredLeads.map((lead, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 min-w-[320px] border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${lead.platform === "Google" ? "bg-red-500" : lead.platform === "Facebook" ? "bg-blue-600" : "bg-blue-400"}`}
                  ></div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {lead.platform}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getLeadHealth(lead).color} ${getLeadHealth(lead).text}`}
                  >
                    {getLeadHealth(lead).score}
                  </span>
                </div>
                <p className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded-full">
                  {lead.date}
                </p>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Contact by:
                  </span>{" "}
                  {lead.contactBy}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Source:</span>{" "}
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {lead.source}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Email:</span>{" "}
                  {lead.email}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Status:</span>{" "}
                  {lead.status}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Reminder:</span>{" "}
                  <span
                    className="cursor-pointer text-blue-600 underline pointer-events-auto"
                    onClick={() => {
                      setSelectedLeadForReminder(lead);
                      setShowReminderPopup(true);
                    }}
                  >
                    {lead.reminderDate || "No reminder set"}
                  </span>
                </p>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${lead.stage >= 80 ? "bg-green-500" : lead.stage >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${lead.stage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  {lead.stageLabel}
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex-1">
                  View
                </button>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex-1"
                  onClick={() => {
                    setEditingIndex(i);
                    setFormData({
                      status: lead.status || "",
                      extraKm: lead.extraKm || "",
                      stage: lead.stage.toString(),
                      tripStartDate: lead.tripStartDate || "",
                      tripEndDate: lead.tripEndDate || "",
                      price: lead.price || "",
                      people: lead.people || "",
                      remarks: lead.remarks || "",
                      followup: lead.followup || "",
                      reminderType: lead.reminderType || "",
                      reminderDate: lead.reminderDate || "",
                    });
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {editingIndex !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-lg border-2 border-green-500">
            <h3 className="font-bold mb-4 text-center text-lg">
              Edit Lead:{" "}
              {editingIndex !== null ? leads[editingIndex].contactBy : ""}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <InputField
                    label="Trip Start Date"
                    type="datetime-local"
                    value={formData.tripStartDate}
                    onChange={(val) =>
                      setFormData({ ...formData, tripStartDate: val })
                    }
                  />
                  <InputField
                    label="Trip End Date"
                    type="datetime-local"
                    value={formData.tripEndDate}
                    onChange={(val) =>
                      setFormData({ ...formData, tripEndDate: val })
                    }
                  />
                </div>
                <div className="space-y-3">
                  <InputField
                    label="Price"
                    type="number"
                    value={formData.price}
                    onChange={(val) => setFormData({ ...formData, price: val })}
                  />
                  <InputField
                    label="People"
                    type="number"
                    value={formData.people}
                    onChange={(val) =>
                      setFormData({ ...formData, people: val })
                    }
                  />
                </div>
              </div>
              <TextareaField
                label="Remarks"
                value={formData.remarks}
                onChange={(val) => setFormData({ ...formData, remarks: val })}
              />
              <InputField
                label="Followup"
                type="text"
                value={formData.followup}
                onChange={(val) => setFormData({ ...formData, followup: val })}
              />
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Reminder Type"
                  value={formData.reminderType}
                  onChange={(val) =>
                    setFormData({ ...formData, reminderType: val })
                  }
                  options={["Payment", "Payment Time", "Follow-up"]}
                />
                <InputField
                  label="Reminder Date"
                  type="datetime-local"
                  value={formData.reminderDate}
                  onChange={(val) =>
                    setFormData({ ...formData, reminderDate: val })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <SelectField
                  label="Status"
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={[
                    "New",
                    "RFQ",
                    "Hot",
                    "Book",
                    "Veh-n",
                    "Lost",
                    "Kyc",
                  ]}
                />
                <InputField
                  label="Extra Km"
                  type="number"
                  value={formData.extraKm}
                  onChange={(val) => setFormData({ ...formData, extraKm: val })}
                />
                <SelectField
                  label="Stage Level"
                  value={formData.stage}
                  onChange={(val) => setFormData({ ...formData, stage: val })}
                  options={["0", "20", "40", "60", "80", "100"]}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    if (editingIndex === null) return;
                    const readiness = getReadinessChecklist(
                      leads[editingIndex],
                    );
                    if (
                      parseInt(formData.stage) === 100 &&
                      readiness.completed < readiness.total
                    ) {
                      alert(
                        "Cannot mark as completed. Trip readiness checklist is not fully complete.",
                      );
                      return;
                    }
                    const updatedLeads = [...leads];
                    updatedLeads[editingIndex] = {
                      ...updatedLeads[editingIndex],
                      ...formData,
                      stage:
                        parseInt(formData.stage) ||
                        updatedLeads[editingIndex].stage,
                    };
                    setLeads(updatedLeads);
                    setEditingIndex(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex-1 shadow-md"
                >
                  Submit
                </button>
                <button
                  onClick={() => setEditingIndex(null)}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex-1 shadow-md"
                >
                  Close Trip
                </button>
                <button
                  onClick={() => setEditingIndex(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex-1 shadow-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Popup Modal */}
      {showReminderPopup && selectedLeadForReminder && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] ">
          <div className="bg-red-50 p-6 rounded-lg shadow-xl w-full max-w-md border-2 border-red-500">
            <h3 className="font-bold mb-4 text-center text-lg">
              Reminder Details
            </h3>
            <div className="space-y-3">
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">Reason:</span>{" "}
                {selectedLeadForReminder.reminderType || "N/A"}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">
                  Date & Time:
                </span>{" "}
                {selectedLeadForReminder.reminderDate || "N/A"}
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowReminderPopup(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Input Component
const InputField = ({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (val: string) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded mt-1"
    />
  </div>
);

// Reusable Textarea Component
const TextareaField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded mt-1"
      rows={3}
    />
  </div>
);

// Reusable Select Component
const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded mt-1"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);
