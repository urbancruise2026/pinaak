'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lead } from '@/types/types';

interface LocationChartProps {
  leads: Lead[];
}

const LocationChart = ({ leads }: LocationChartProps) => {
  const locationData = leads.reduce((acc: any, lead) => {
    const location = lead.location || 'Unknown';
    if (!acc[location]) {
      acc[location] = { 
        location, 
        total: 0, 
        completed: 0, 
        hot: 0 
      };
    }
    acc[location].total++;
    if (lead.status === 'completed') acc[location].completed++;
    if (lead.priority === 'hot') acc[location].hot++;
    return acc;
  }, {});

  const data = Object.values(locationData);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="location" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" name="Total Leads" fill="#8884d8" />
        <Bar dataKey="completed" name="Completed" fill="#82ca9d" />
        <Bar dataKey="hot" name="Hot Leads" fill="#ff8042" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LocationChart;