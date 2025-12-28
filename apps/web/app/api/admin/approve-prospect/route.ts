import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseAdmin, approveProspectUser } from '@/lib/admin';
import { getCurrentUser } from '@/lib/supabase/server';
import { sendApprovalEmail } from '@/lib/emails';

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin status
    const supabase = await createServerSupabaseAdmin();
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { prospectId } = await req.json();

    if (!prospectId) {
      return NextResponse.json({ error: 'Prospect ID is required' }, { status: 400 });
    }

    // Approve the prospect user
    const approvedUser = await approveProspectUser(prospectId, user.id);

    // Send approval email
    if (approvedUser.user.email && approvedUser.tempPassword) {
      await sendApprovalEmail(
        approvedUser.user.email,
        approvedUser.user.user_metadata?.first_name || 'User',
        approvedUser.tempPassword
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Prospect approved successfully',
      userId: approvedUser.user.id,
    });
  } catch (error) {
    console.error('Error approving prospect:', error);
    return NextResponse.json(
      { error: 'Failed to approve prospect' },
      { status: 500 }
    );
  }
}