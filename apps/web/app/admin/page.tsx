'use client';

import { ArrowLeft } from 'lucide-react';
import { ReviewReportsTable } from '@/components/ReviewReportsTable';
import { ProspectsTable } from '@/components/ProspectsTable';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage user applications and system settings</p>
        </div>

        <div className='flex flex-col gap-8'>

          {/* User Applications Section */}
          <ProspectsTable />

          {/* Review Reports Section */}
          <ReviewReportsTable />

        </div>
      </div>
    </div>
  );
}
