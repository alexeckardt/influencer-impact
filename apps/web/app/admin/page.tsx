'use client';

import { useState, useEffect } from 'react';
import { ProtectedPage } from '@/components/ProtectedPage';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@influencer-platform/db';
import { CheckCircle2, XCircle, User, Building, Calendar, ExternalLink } from 'lucide-react';

type ProspectUser = Database['public']['Tables']['prospect_users']['Row'];

export default function AdminDashboard() {
  const [prospects, setProspects] = useState<ProspectUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modal states
  const [approveModal, setApproveModal] = useState<{ isOpen: boolean; prospect: ProspectUser | null }>({
    isOpen: false,
    prospect: null
  });
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; prospect: ProspectUser | null }>({
    isOpen: false,
    prospect: null
  });
  const [rejectionReason, setRejectionReason] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      const { data, error } = await supabase
        .from('prospect_users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProspects(data || []);
    } catch (error) {
      console.error('Error fetching prospects:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveProspect = async (prospectId: string) => {
    setActionLoading(prospectId);
    try {
      const response = await fetch('/api/admin/approve-prospect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prospectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve prospect');
      }

      await fetchProspects();
      setApproveModal({ isOpen: false, prospect: null });
    } catch (error) {
      console.error('Error approving prospect:', error);
      alert('Failed to approve prospect. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectProspect = async (prospectId: string, reason: string) => {
    setActionLoading(prospectId);
    try {
      const response = await fetch('/api/admin/reject-prospect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prospectId, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject prospect');
      }

      await fetchProspects();
      setRejectModal({ isOpen: false, prospect: null });
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting prospect:', error);
      alert('Failed to reject prospect. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const openApproveModal = (prospect: ProspectUser) => {
    setApproveModal({ isOpen: true, prospect });
  };

  const openRejectModal = (prospect: ProspectUser) => {
    setRejectModal({ isOpen: true, prospect });
    setRejectionReason('');
  };

  const handleApprove = () => {
    if (approveModal.prospect) {
      approveProspect(approveModal.prospect.id);
    }
  };

  const handleReject = () => {
    if (rejectModal.prospect) {
      rejectProspect(rejectModal.prospect.id, rejectionReason);
    }
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
    <ProtectedPage requireRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage user applications and system settings</p>
          </div>

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
                                  onClick={() => openApproveModal(prospect)}
                                  disabled={actionLoading === prospect.id}
                                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  {actionLoading === prospect.id ? 'Processing...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => openRejectModal(prospect)}
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
        </div>
      </div>

      {/* Approve Modal */}
      {approveModal.isOpen && approveModal.prospect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Approval</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to approve <strong>{approveModal.prospect.first_name} {approveModal.prospect.last_name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setApproveModal({ isOpen: false, prospect: null })}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={actionLoading === approveModal.prospect.id}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={actionLoading === approveModal.prospect.id}
              >
                {actionLoading === approveModal.prospect.id ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.isOpen && rejectModal.prospect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Application</h3>
            <p className="text-gray-600 mb-4">
              You are about to reject <strong>{rejectModal.prospect.first_name} {rejectModal.prospect.last_name}</strong>&apos;s application.
            </p>
            <div className="mb-6">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection (optional):
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                placeholder="Enter reason for rejection..."
                disabled={actionLoading === rejectModal.prospect.id}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectModal({ isOpen: false, prospect: null });
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={actionLoading === rejectModal.prospect.id}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={actionLoading === rejectModal.prospect.id}
              >
                {actionLoading === rejectModal.prospect.id ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedPage>
  );
}