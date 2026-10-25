"use client";

import { useState, useEffect } from "react";
import StatsCards from "./StatsCards";
import SalesTeamTable from "./SalesTeamTable";
import LeadTable from "./LeadTable";
import Filters from "./Filters";
import LeadSourceChart from "./LeadSourceChart";
import LocationChart from "./LocationChart";
import { Lead, SalesPerson } from "@/types/types";

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [salesTeam, setSalesTeam] = useState<SalesPerson[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedSales, setSelectedSales] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, selectedLocation, selectedSales]);

  const fetchData = async () => {
    try {
      const [leadsRes, salesRes] = await Promise.all([
        fetch("/api/v1/lead"),
        fetch("/api/v1/user/sales"),
      ]);

      const leadsData = await leadsRes.json();
      const salesData = await salesRes.json();

      // Ensure leadsData is an array
      const leadsArray = Array.isArray(leadsData) ? leadsData : [];
      const salesArray = Array.isArray(salesData) ? salesData : [];

      setLeads(leadsArray);
      setSalesTeam(salesArray);
      setFilteredLeads(leadsArray);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    if (selectedLocation !== "all") {
      filtered = filtered.filter((lead) => lead.location === selectedLocation);
    }

    if (selectedSales !== "all") {
      filtered = filtered.filter((lead) => lead.assignedTo === selectedSales);
    }

    setFilteredLeads(filtered);
  };

  const handleFilterChange = (location: string, sales: string) => {
    setSelectedLocation(location);
    setSelectedSales(sales);
  };

  const handleViewDetails = (leadId: string) => {
    // Navigate to lead details page or show modal
    console.log("View details for lead:", leadId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Pre Sales dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-green-50">
      <Filters onFilterChange={handleFilterChange} salesTeam={salesTeam} />

      <StatsCards leads={filteredLeads} salesTeam={salesTeam} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card border border-gray-300 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">
            Lead Distribution by Source
          </h3>
          <LeadSourceChart leads={filteredLeads} />
        </div>

        <div className="card border border-gray-300 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Leads by Location</h3>
          <LocationChart leads={filteredLeads} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="card border border-gray-300 rounded-lg p-4">
          <h3 className="text-xl mx-auto ml-26 text-center text-orange-600 bg-orange-100 w-[30vh] font-bold mb-4">
            Sales Team Performance
          </h3>
          <SalesTeamTable
            salesTeam={salesTeam}
            leads={filteredLeads}
            onViewDetails={handleViewDetails}
          />
        </div>
      </div>

      <div className="card border border-gray-300 rounded-lg p-4 justify-center items-center text-center ">
        <h3 className="text-2xl mx-auto ml-66 text-center text-orange-600 bg-orange-100 w-44 font-bold mb-4">
          Recent Leads
        </h3>
        <LeadTable
          leads={(Array.isArray(filteredLeads) ? filteredLeads : []).slice(
            0,
            10,
          )}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
}
