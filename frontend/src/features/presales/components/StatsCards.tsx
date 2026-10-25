'use client';

import { Lead, SalesPerson } from '@/types/types';

interface StatsCardsProps {
  leads: Lead[];
  salesTeam: SalesPerson[];
}

export default function StatsCards({ leads, salesTeam }: StatsCardsProps) {
  const totalLeads = leads.length;
  const newLeads = leads.filter(lead => lead.status === 'new').length;
  const contactedLeads = leads.filter(lead => lead.status === 'contacted').length;
  const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

  const stats = [
    {
      title: 'Total Leads',
      value: totalLeads,
      color: 'bg-blue-500'
    },
    {
      title: 'New Leads',
      value: newLeads,
      color: 'bg-green-500'
    },
    {
      title: 'Contacted',
      value: contactedLeads,
      color: 'bg-yellow-500'
    },
    {
      title: 'Qualified',
      value: qualifiedLeads,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Value',
      value: `₹${totalValue.toLocaleString()}`,
      color: 'bg-indigo-500'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      color: 'bg-red-500',
    
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${stat.color} mr-3`}></div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}