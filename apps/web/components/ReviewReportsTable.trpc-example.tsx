/**
 * EXAMPLE: ReviewReportsTable with tRPC
 * 
 * This file demonstrates how to use tRPC hooks instead of fetch calls.
 * Key benefits:
 * - Full type safety from server to client
 * - Automatic request deduplication and caching
 * - No manual JSON parsing or error handling
 * - Automatic refetching and invalidation
 * - TypeScript autocomplete for all inputs/outputs
 */
'use client';

import { useState } from 'react';
import { Flag, AlertTriangle, Calendar } from 'lucide-react';
import { ReviewReportModal } from '@/components/ReviewReportModal';
import { trpc } from '@/lib/trpc/client';
import type { ReviewReport } from '@influencer-platform/shared';

export function ReviewReportsTableTRPC() {
  const [selectedReport, setSelectedReport] = useState<ReviewReport | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;

  // 🎯 TYPE-SAFE QUERY: Automatically typed, cached, and refetched
  const { data, isLoading, refetch } = trpc.reviewReports.getReports.useQuery({
    showAll: showAllReports,
  });

  const reports = data?.reports || [];
  const totalReports = reports.length;

  // Calculate pagination
  const startIndex = (currentPage - 1) * reportsPerPage;
  const endIndex = startIndex + reportsPerPage;
  const paginatedReports = reports.slice(startIndex, endIndex);

  const openReportModal = (report: ReviewReport) => {
    setSelectedReport(report);
    setReportModalOpen(true);
  };

  const handleReportStatusChange = () => {
    // 🎯 AUTOMATIC REFETCH: No manual fetch logic needed
    refetch();
  };

  const getBadgeStatusColor = (status: string) => {
    switch (status) {
      case 'closed': return 'bg-green-200 text-green-800';
      case 'investigating': return 'bg-purple-200 text-purple-800';
      case 'open': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getRowStyle = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100/80 hover:bg-red-100';
      case 'investigating': return 'bg-purple-100/80 hover:bg-purple-100';
      case 'closed': return 'bg-green-100/80 hover:bg-green-100';
      default: return 'bg-white hover:bg-gray-50';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-600" />
              Review Reports
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and manage flagged reviews
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowAllReports(!showAllReports);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                showAllReports
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {showAllReports ? 'Show Active Only' : 'Show All Reports'}
            </button>
            {totalReports > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                {totalReports} {totalReports === 1 ? 'Report' : 'Reports'}
              </span>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      ) : paginatedReports.length === 0 ? (
        <div className="p-8 text-center">
          <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No active reports to review</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reasons
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedReports.map((report) => (
                <tr key={report.id} className={getRowStyle(report.status)}>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {report.review?.influencer && (
                        <div className="font-medium text-gray-900">
                          {report.review.influencer.name}
                        </div>
                      )}
                      <div className="text-gray-500">
                        Rating: {report.review?.overall_rating || 'N/A'}/5.0
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {report.reporter ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.reporter.first_name} {report.reporter.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{report.reporter.email}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unknown</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {report.reasons.slice(0, 2).map((reason: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex px-2 py-1 text-xs font-medium rounded bg-red-50 text-red-700"
                        >
                          {reason}
                        </span>
                      ))}
                      {report.reasons.length > 2 && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                          +{report.reasons.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openReportModal(report)}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Review Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalReports > reportsPerPage && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {Math.min(startIndex + 1, totalReports)} to{' '}
            {Math.min(endIndex, totalReports)} of {totalReports} reports
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(totalReports / reportsPerPage) }, (_, i) => i + 1)
                .filter(page => {
                  const totalPages = Math.ceil(totalReports / reportsPerPage);
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalReports / reportsPerPage), prev + 1))}
              disabled={currentPage === Math.ceil(totalReports / reportsPerPage)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ReviewReportModal
        report={selectedReport}
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setSelectedReport(null);
        }}
        onStatusChange={handleReportStatusChange}
      />
    </div>
  );
}
