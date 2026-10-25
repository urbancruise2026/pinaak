'use client';

import { SalesPerson, Lead } from '@/types/types';

interface SalesTeamTableProps {
  salesTeam: SalesPerson[];
  leads: Lead[];
  onViewDetails: (leadId: string) => void;
}

export default function SalesTeamTable({ salesTeam, leads, onViewDetails }: SalesTeamTableProps) {
  const getPerformanceData = (salesPerson: SalesPerson) => {
    const personLeads = leads.filter(lead => lead.assignedTo === salesPerson.id);
    const completedLeads = personLeads.filter(lead => lead.status === 'completed');
    const conversionRate = personLeads.length > 0 ? Math.round((completedLeads.length / personLeads.length) * 100) : 0;
    const totalValue = personLeads.reduce((sum, lead) => sum + lead.value, 0);

    return {
      ...salesPerson,
      actualLeadsCount: personLeads.length,
      actualConversionRate: conversionRate,
      actualTotalValue: totalValue
    };
  };

  return (
    <div className="container border border-black overflow-x-auto ">
      <table className="min-w-full divide-y divide-gray-200 border border-black">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 bg-blue-50 text-left text-sm font-bold text-blue-500 uppercase tracking-wider border border-black">
              Sales Person
            </th>
            <th className="px-6 py-3 bg-green-50 text-left text-md  font-bold text-green-500 uppercase tracking-wider border border-black">
              Leads
            </th>
            <th className="px-6 py-3 bg-yellow-50  text-left text-md font-bold text-yellow-500 uppercase tracking-wider border border-black">
              Conversion Rate
            </th>
            <th className="px-6 py-3 bg-pink-50 text-left text-sm font-bold text-pink-500 uppercase tracking-wider border border-black">
              Total Value
            </th>
            <th className="px-6 py-3 bg-purple-50 text-left text-sm font-bold text-purple-500 uppercase tracking-wider border border-black">
              Performance
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {salesTeam.map((person) => {
            const performance = getPerformanceData(person);
            const isGoodPerformance = performance.actualConversionRate >= 70;

            return (
              <tr key={person.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{person.name}</div>
                  <div className="text-sm text-gray-500">{person.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {performance.actualLeadsCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {performance.actualConversionRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{performance.actualTotalValue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    isGoodPerformance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isGoodPerformance ? 'Good' : 'Needs Improvement'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}