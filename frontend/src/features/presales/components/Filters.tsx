'use client';

import { SalesPerson } from '@/types/types';

interface FiltersProps {
  onFilterChange: (location: string, sales: string) => void;
  salesTeam: SalesPerson[];
}

export default function Filters({ onFilterChange, salesTeam }: FiltersProps) {
  const locations = ['all', 'mumbai', 'delhi', 'bangalore', 'chennai', 'hyderabad'];

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            onChange={(e) => onFilterChange(e.target.value, 'all')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {locations.map(location => (
              <option key={location} value={location}>
                {location === 'all' ? 'All Locations' : location.charAt(0).toUpperCase() + location.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sales Person
          </label>
          <select
            onChange={(e) => onFilterChange('all', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Sales People</option>
            {salesTeam.map(person => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}