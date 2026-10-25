'use client';

import { useState, useEffect } from 'react';
import { Lead, SalesPerson } from '@/types/types';

export default function SwapLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [salesTeam, setSalesTeam] = useState<SalesPerson[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [targetSalesPerson, setTargetSalesPerson] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsRes, salesRes] = await Promise.all([
        fetch('/api/v1/lead'),
        fetch('/api/v1/user/sales')
      ]);

      const leadsData = await leadsRes.json();
      const salesData = await salesRes.json();

      // Filter to only unattended leads (status: 'new')
      const unattendedLeads = leadsData.filter((lead: Lead) => lead.status === 'new');

      setLeads(unattendedLeads);
      setSalesTeam(salesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSelect = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSwap = async () => {
    if (selectedLeads.length === 0 || !targetSalesPerson) {
      alert('Please select leads and target sales person');
      return;
    }

    try {
      // Update leads with new assigned person
      const updatedLeads = leads.map(lead =>
        selectedLeads.includes(lead.id)
          ? { ...lead, assignedTo: targetSalesPerson, updatedAt: new Date().toISOString().split('T')[0] }
          : lead
      );

      // In a real app, you'd make API calls to update the leads
      // For now, we'll just update the local state
      setLeads(updatedLeads);
      setSelectedLeads([]);
      setTargetSalesPerson('');

      alert(`Successfully swapped ${selectedLeads.length} leads`);
    } catch (error) {
      console.error('Error swapping leads:', error);
      alert('Error swapping leads');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading swap leads...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Swap Leads</h1>
      <p className="text-gray-600 mb-6">
        Swap unattended leads (status: new) to another sales person for better follow-up.
      </p>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Target Sales Person</h2>
        <select
          value={targetSalesPerson}
          onChange={(e) => setTargetSalesPerson(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
        >
          <option value="">Select Sales Person</option>
          {salesTeam.map(person => (
            <option key={person.id} value={person.id}>
              {person.name} - {person.location}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select Unattended Leads to Swap</h2>
          <button
            onClick={handleSwap}
            disabled={selectedLeads.length === 0 || !targetSalesPerson}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Swap {selectedLeads.length} Leads
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeads(leads.map(lead => lead.id));
                      } else {
                        setSelectedLeads([]);
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => {
                const currentSalesPerson = salesTeam.find(person => person.id === lead.assignedTo);
                return (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleLeadSelect(lead.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.company}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {currentSalesPerson ? currentSalesPerson.name : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}