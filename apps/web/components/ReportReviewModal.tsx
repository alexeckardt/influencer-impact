'use client';

import { FormEvent, useState } from 'react';
import { X, Flag } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { reportReasonSchema } from '@influencer-platform/shared';
import { z } from 'zod';

type ReportReason = z.infer<typeof reportReasonSchema>;

interface ReportReviewModalProps {
  reviewId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam or misleading', apiValue: 'Spam or Fake' as const },
  { id: 'inappropriate', label: 'Inappropriate content', apiValue: 'Inappropriate Language' as const },
  { id: 'fake', label: 'Fake or fraudulent review', apiValue: 'Spam or Fake' as const },
  { id: 'offensive', label: 'Offensive or abusive language', apiValue: 'Offensive Content' as const },
  { id: 'conflict', label: 'Conflict of interest', apiValue: 'Conflict of Interest' as const },
  { id: 'inaccurate', label: 'Factually inaccurate', apiValue: 'Inaccurate Information' as const },
  { id: 'other', label: 'Other', apiValue: 'Other' as const },
];

export function ReportReviewModal({ reviewId, isOpen, onClose, onSuccess }: ReportReviewModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [error, setError] = useState<string | null>(null);

  // tRPC mutation for creating report
  const createReportMutation = trpc.reviewReports.createReport.useMutation({
    onSuccess: () => {
      setSelectedReasons([]);
      setAdditionalInfo('');
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'An error occurred');
    },
  });

  const handleReasonToggle = (reasonId: string) => {
    setSelectedReasons(prev =>
      prev.includes(reasonId)
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (selectedReasons.length === 0) {
      setError('Please select at least one reason');
      return;
    }

    setError(null);

    // Map UI reason IDs to API enum values  
    const apiReasons = selectedReasons
      .map(id => REPORT_REASONS.find(r => r.id === id)?.apiValue)
      .filter((v) => v !== undefined) as ReportReason[];

    await createReportMutation.mutateAsync({
      reviewId,
      reasons: apiReasons,
      additionalInfo: additionalInfo.trim() || undefined,
    });
  };

  const handleClose = () => {
    if (!createReportMutation.isPending) {
      setSelectedReasons([]);
      setAdditionalInfo('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Report Review</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={createReportMutation.isPending}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Why are you reporting this review? (Select all that apply)
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedReasons.includes(reason.id)}
                      onChange={() => handleReasonToggle(reason.id)}
                      disabled={createReportMutation.isPending}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{reason.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="additional-info" className="block text-sm font-medium text-gray-700 mb-2">
                Additional information (optional)
              </label>
              <textarea
                id="additional-info"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                disabled={createReportMutation.isPending}
                rows={4}
                placeholder="Provide any additional details that might help us review this report..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={createReportMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createReportMutation.isPending || selectedReasons.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createReportMutation.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="h-4 w-4" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
