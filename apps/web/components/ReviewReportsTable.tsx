'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flag, AlertTriangle, Calendar } from 'lucide-react';
import { ReviewReportModal } from '@/components/ReviewReportModal';

interface ReviewReport {
  id: string;
  review_id: string;
  reporter_id: string;
  reasons: string[];
  additional_info: string | null;
  status: 'open' | 'investigating' | 'closed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  review: {
    id: string;
    overall_rating: number;
    pros: string;
    cons: string;
    advice: string;
    influencer: {
      id: string;
      name: string;
    } | null;
  } | null;
  reporter: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  reviewer: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

export function ReviewReportsTable() {
  const [reviewReports, setReviewReports] = useState<ReviewReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReviewReport | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const reportsPerPage = 10;

  const fetchReviewReports = useCallback(async () => {
    try {
      setReportsLoading(true);
      const params = new URLSearchParams();
      if (showAllReports) {
        params.append('all', 'true');
      }

      const url = `/api/admin/review-reports${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const allReports = data.reports || [];
        setTotalReports(allReports.length);

        const startIndex = (currentPage - 1) * reportsPerPage;
        const endIndex = startIndex + reportsPerPage;
        setReviewReports(allReports.slice(startIndex, endIndex));
      } else {
        console.error('Failed to fetch review reports');
      }
    } catch (error) {
      console.error('Error fetching review reports:', error);
    } finally {
      setReportsLoading(false);
    }
  }, [showAllReports, currentPage]);

  useEffect(() => {
    fetchReviewReports();
  }, [fetchReviewReports]);

  const openReportModal = (report: ReviewReport) => {
    setSelectedReport(report);
    setReportModalOpen(true);
  };

  const handleReportStatusChange = () => {
    fetchReviewReports();
  };

  const getRowStyle = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100/80 hover:bg-red-100';
      case 'investigating':
        return 'bg-purple-100/80 hover:bg-blue-100';
      case 'closed':
        return 'bg-green-100/80 hover:bg-green-100';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-200 text-red-800';
      case 'investigating':
        return 'bg-purple-200 text-purple-800';
      case 'closed':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <>
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
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${showAllReports
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

        {reportsLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading reports...</p>
          </div>
        ) : reviewReports.length === 0 ? (
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
                {reviewReports.map((report) => (
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
                        {report.reasons.slice(0, 2).map((reason, idx) => (
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeStyle(report.status)}`}>
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

        {/* Pagination Controls */}
        {!reportsLoading && totalReports > reportsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {Math.min((currentPage - 1) * reportsPerPage + 1, totalReports)} to{' '}
              {Math.min(currentPage * reportsPerPage, totalReports)} of {totalReports} reports
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
                        className={`px-3 py-1 text-sm rounded-md ${currentPage === page
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
      </div>

      {/* Review Report Modal */}
      <ReviewReportModal
        report={selectedReport}
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setSelectedReport(null);
        }}
        onStatusChange={handleReportStatusChange}
      />
    </>
  );
}
