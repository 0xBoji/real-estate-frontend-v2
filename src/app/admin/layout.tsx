'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
}
