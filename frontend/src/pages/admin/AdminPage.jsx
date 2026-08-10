import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

// Stub — admin endpoints would need their own service
// For now this shows a basic dashboard shell
export default function AdminPage() {
  // TODO: wire up admin analytics endpoints when needed
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Platform management and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '—', color: 'text-brand-600' },
          { label: 'Students', value: '—', color: 'text-blue-600' },
          { label: 'Employers', value: '—', color: 'text-green-600' },
          { label: 'Active Jobs', value: '—', color: 'text-brand-600' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-2">Admin Actions</h2>
        <p className="text-sm text-gray-500">
          Connect the admin service endpoints to enable user management, job moderation, and analytics.
        </p>
      </div>
    </div>
  );
}