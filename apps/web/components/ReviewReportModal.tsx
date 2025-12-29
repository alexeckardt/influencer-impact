'use client';

import { useState, useEffect } from 'react';
import { X, Flag, User, Calendar, AlertCircle, ExternalLink } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

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

interface ReviewReportModalProps {
  report: ReviewReport | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam or misleading',
  inappropriate: 'Inappropriate content',
  fake: 'Fake or fraudulent review',
  offensive: 'Offensive or abusive language',
  conflict: 'Conflict of interest',
  inaccurate: 'Factually inaccurate',
  other: 'Other',
};

export function ReviewReportModal({ report, isOpen, onClose, onStatusChange }: ReviewReportModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(report?.status || 'open');
  const [error, setError] = useState<string | null>(null);

  // tRPC mutation for updating report status
  const updateStatusMutation = trpc.reviewReports.updateReportStatus.useMutation({
    onSuccess: () => {
      onStatusChange?.();
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'An error occurred');
    },
  });

  // Update selectedStatus when report changes
  useEffect(() => {
    if (report?.status) {
      setSelectedStatus(report.status);
    }
  }, [report?.status]);

  if (!isOpen || !report) return null;

  const handleStatusChange = async () => {
    if (selectedStatus === report.status) {
      onClose();
      return;
    }

    setError(null);

    await updateStatusMutation.mutateAsync({
      reportId: report.id,
      status: selectedStatus as 'open' | 'investigating' | 'closed',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'investigating':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'closed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Review Report Details</h2>
          </div>
          <button
            onClick={onClose}
            disabled={updateStatusMutation.isPending}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Report Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                {report.status}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              <Calendar className="h-4 w-4 inline mr-1" />
              {new Date(report.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Reporter Info */}
          {report.reporter && (
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Reported by
              </h3>
              <p className="text-gray-900">
                {report.reporter.first_name} {report.reporter.last_name}
              </p>
              <p className="text-sm text-gray-600">{report.reporter.email}</p>
            </div>
          )}

          {/* Review Info */}
          {report.review && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Review Information</h3>
                <a
                  href={`/review/${report.review_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  View Review
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {report.review.influencer && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Influencer:</span> {report.review.influencer.name}
                </p>
              )}
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Rating:</span> {report.review.overall_rating}/5.0
              </p>
              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-xs font-semibold text-gray-500">Pros:</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{report.review.pros}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Cons:</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{report.review.cons}</p>
                </div>
              </div>
            </div>
          )}

          {/* Report Reasons */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Reported Reasons</h3>
            <div className="flex flex-wrap gap-2">
              {report.reasons.map((reason) => (
                <span
                  key={reason}
                  className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm"
                >
                  {REASON_LABELS[reason] || reason}
                </span>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          {report.additional_info && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Additional Information</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.additional_info}</p>
              </div>
            </div>
          )}

          {/* Reviewed By */}
          {report.reviewer && report.reviewed_at && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Reviewed by:</span> {report.reviewer.first_name} {report.reviewer.last_name}
                <span className="mx-2">•</span>
                <span>{new Date(report.reviewed_at).toLocaleString()}</span>
              </p>
            </div>
          )}

          {/* Status Change Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="open"
                    checked={selectedStatus === 'open'}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={updateStatusMutation.isPending}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Open</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="investigating"
                    checked={selectedStatus === 'investigating'}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={updateStatusMutation.isPending}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Investigating</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="closed"
                    checked={selectedStatus === 'closed'}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={updateStatusMutation.isPending}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Closed</span>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={updateStatusMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStatusChange}
            disabled={updateStatusMutation.isPending || selectedStatus === report.status}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updateStatusMutation.isPending ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
