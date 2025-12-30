'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, User, Building, Calendar, ExternalLink } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { ProspectResponse } from '@influencer-platform/shared';

type ModalState = 
  | { type: 'none' }
  | { type: 'approve'; prospect: ProspectResponse }
  | { type: 'reject'; prospect: ProspectResponse; reason: string }
  | { type: 'error'; title: string; message: string; details?: string };

export function ProspectsTable() {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });

  const { data: prospects = [], isLoading: loading, refetch } = trpc.admin.getProspects.useQuery();

  const approveMutation = trpc.admin.approveProspect.useMutation({
    onSuccess: async () => {
      await refetch();
      setModal({ type: 'none' });
      setActionLoading(null);
    },
    onError: (error) => {
      setModal({
        type: 'error',
        title: 'Approval Failed',
        message: error.message || 'Failed to approve prospect',
        details: error.message
      });
      setActionLoading(null);
    },
  });

  const rejectMutation = trpc.admin.rejectProspect.useMutation({
    onSuccess: async () => {
      await refetch();
      setModal({ type: 'none' });
      setActionLoading(null);
    },
    onError: (error) => {
      setModal({
        type: 'error',
        title: 'Rejection Failed',
        message: error.message || 'Failed to reject prospect',
        details: error.message
      });
      setActionLoading(null);
    },
  });

  const handleApprove = async (prospect: ProspectResponse) => {
    setActionLoading(prospect.id);
    await approveMutation.mutateAsync({ prospectId: prospect.id });
  };

  const handleReject = async (prospect: ProspectResponse, reason: string) => {
    setActionLoading(prospect.id);
    await rejectMutation.mutateAsync({ prospectId: prospect.id, reason });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">User Applications</h2>
          <p className="text-sm text-gray-600 mt-1">
            Review and approve new user registrations
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading applications...</p>
          </div>
        ) : prospects.length === 0 ? (
          <div className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No applications to review</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prospects.map((prospect) => (
                  <tr key={prospect.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {prospect.first_name} {prospect.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{prospect.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{prospect.company || 'Not specified'}</div>
                          <div className="text-sm text-gray-500">{prospect.job_title || 'No title'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prospect.years_experience || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prospect.status)}`}>
                        {prospect.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(prospect.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {prospect.linkedin_url && (
                          <a
                            href={prospect.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                            title="View LinkedIn Profile"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {prospect.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setModal({ type: 'approve', prospect })}
                              disabled={actionLoading === prospect.id}
                              className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {actionLoading === prospect.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => setModal({ type: 'reject', prospect, reason: '' })}
                              disabled={actionLoading === prospect.id}
                              className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                        {prospect.status === 'rejected' && prospect.rejection_reason && (
                          <div className="text-xs text-gray-500 max-w-xs truncate" title={prospect.rejection_reason}>
                            Reason: {prospect.rejection_reason}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unified Modal */}
      {modal.type !== 'none' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {modal.type === 'approve' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Approval</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to approve <strong>{modal.prospect.first_name} {modal.prospect.last_name}</strong>?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setModal({ type: 'none' })}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={!!actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApprove(modal.prospect)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={!!actionLoading}
                  >
                    {actionLoading ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              </>
            )}

            {modal.type === 'reject' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Application</h3>
                <p className="text-gray-600 mb-4">
                  You are about to reject <strong>{modal.prospect.first_name} {modal.prospect.last_name}</strong>&apos;s application.
                </p>
                <div className="mb-6">
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for rejection (optional):
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={modal.reason}
                    onChange={(e) => setModal({ ...modal, reason: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                    placeholder="Enter reason for rejection..."
                    disabled={!!actionLoading}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setModal({ type: 'none' })}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={!!actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(modal.prospect, modal.reason)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    disabled={!!actionLoading}
                  >
                    {actionLoading ? 'Rejecting...' : 'Reject Application'}
                  </button>
                </div>
              </>
            )}

            {modal.type === 'error' && (
              <>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-red-600 flex items-center">
                    <XCircle className="h-5 w-5 mr-2" />
                    {modal.title}
                  </h3>
                  <button
                    onClick={() => setModal({ type: 'none' })}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Error Message:</h4>
                    <p className="text-gray-700 bg-red-50 p-3 rounded-lg border border-red-200">
                      {modal.message}
                    </p>
                  </div>

                  {modal.details && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Technical Details:</h4>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono whitespace-pre-wrap overflow-x-auto">
                        {modal.details}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setModal({ type: 'none' })}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
