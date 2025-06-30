'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { routeUtils } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // Check if route requires authentication
      if (routeUtils.requiresAuth(pathname) && !isAuthenticated) {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check if route requires admin access
      if ((requireAdmin || routeUtils.requiresAdmin(pathname)) && !isAdmin) {
        router.push('/dashboard'); // Redirect non-admin users to regular dashboard
        return;
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, pathname, router, requireAdmin]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if user doesn't have access
  if (routeUtils.requiresAuth(pathname) && !isAuthenticated) {
    return null;
  }

  if ((requireAdmin || routeUtils.requiresAdmin(pathname)) && !isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
