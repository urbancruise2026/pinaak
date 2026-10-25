'use client';

import { Eye, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Lead } from '@/types/types';

interface LeadTableProps {
  leads: Lead[];
  onViewDetails: (leadId: string) => void;
}

const LeadTable = ({ leads, onViewDetails }: LeadTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-orange-100 text-orange-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              <th className="px-6 py-4 text-left border-r border-b-2 border-gray-800 text-sm font-bold text-gray-900 uppercase tracking-wider bg-pink-200">
                Lead Details
              </th>
              <th className="px-6 py-4 text-left border-r border-b-2 border-gray-800 text-sm font-bold text-gray-900 uppercase tracking-wider bg-green-200">
                Contact
              </th>
              <th className="px-6 py-4 text-left border-r border-b-2 border-gray-800 text-sm font-bold text-gray-900 uppercase tracking-wider bg-blue-200">
                Status
              </th>
              <th className="px-6 py-4 text-left border-r border-b-2 border-gray-800 text-sm font-bold text-gray-900 uppercase tracking-wider bg-yellow-200">
                Priority
              </th>
              <th className="px-6 py-4 text-left border-b-2 border-gray-800 text-sm font-bold text-gray-900 uppercase tracking-wider bg-purple-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {leads.map((lead, index) => (
              <tr key={lead.id} className={`hover:bg-gray-50 ${index !== leads.length - 1 ? 'border-b border-gray-600' : ''}`}>
                <td className="px-6 py-4 border-r border-gray-600">
                  <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                  <div className="text-sm text-gray-500">{lead.company}</div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin size={12} className="mr-1" />
                    {lead.location}
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-gray-600">
                  <div className="text-sm text-gray-900 flex items-center">
                    <Mail size={12} className="mr-1" />
                    {lead.email}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <Phone size={12} className="mr-1" />
                    {lead.phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-600">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status || 'unknown')}`}>
                    {(lead.status || 'unknown').charAt(0).toUpperCase() + (lead.status || 'unknown').slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-600">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(lead.priority || 'normal')}`}>
                    {(lead.priority || 'normal').charAt(0).toUpperCase() + (lead.priority || 'normal').slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewDetails(lead.id)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;