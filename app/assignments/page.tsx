'use client';

import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { AssignmentManagement } from '@/components/teacher/assignment-management';

export default function AssignmentsPage() {
  return (
    <AuthGuard allowedRoles={['teacher']}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <AssignmentManagement />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}