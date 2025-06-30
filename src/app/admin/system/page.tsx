'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { errorUtils } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Server, 
  Database, 
  Trash2, 
  RefreshCw, 
  Activity, 
  HardDrive, 
  Cpu, 
  MemoryStick,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemHealth {
  status: string;
  components: {
    [key: string]: {
      status: string;
      details?: any;
    };
  };
}

interface SystemInfo {
  application: {
    name: string;
    version: string;
    environment: string;
  };
  java: {
    version: string;
    vendor: string;
  };
  system: {
    os: string;
    architecture: string;
  };
}

export default function AdminSystemPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clearCacheDialog, setClearCacheDialog] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const fetchSystemData = async () => {
    try {
      setIsLoading(true);
      const [healthData, infoData] = await Promise.all([
        adminApi.getSystemHealth(),
        adminApi.getSystemInfo(),
      ]);
      setSystemHealth(healthData);
      setSystemInfo(infoData);
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      toast.error(`Failed to load system data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  const handleClearCache = async () => {
    try {
      setIsClearingCache(true);
      await adminApi.clearCache();
      toast.success('Cache cleared successfully');
      setClearCacheDialog(false);
      // Refresh system data after clearing cache
      fetchSystemData();
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      toast.error(`Failed to clear cache: ${errorMessage}`);
    } finally {
      setIsClearingCache(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'up':
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'down':
      case 'unhealthy':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'up':
      case 'healthy':
        return 'default';
      case 'down':
      case 'unhealthy':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Management</h2>
          <p className="text-muted-foreground">Monitor system health and manage system resources</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Management</h2>
        <p className="text-muted-foreground">
          Monitor system health and manage system resources
        </p>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(systemHealth?.status || 'unknown')}
              <Badge variant={getStatusBadgeVariant(systemHealth?.status || 'unknown')}>
                {systemHealth?.status || 'Unknown'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Application</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo?.application.name || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              v{systemInfo?.application.version || 'Unknown'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Environment</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo?.application.environment || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {systemInfo?.system.os || 'Unknown OS'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Java Runtime</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo?.java.version || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {systemInfo?.java.vendor || 'Unknown Vendor'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Health Details
          </CardTitle>
          <CardDescription>
            Detailed health status of system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemHealth?.components && Object.entries(systemHealth.components).map(([component, details]) => (
              <div key={component} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(details.status)}
                  <div>
                    <h3 className="font-medium capitalize">{component.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <p className="text-sm text-muted-foreground">
                      Status: {details.status}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(details.status)}>
                  {details.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            System Actions
          </CardTitle>
          <CardDescription>
            Perform system maintenance and management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Trash2 className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="font-medium">Clear Cache</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear application cache to free up memory
                  </p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setClearCacheDialog(true)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <RefreshCw className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-medium">Refresh Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Refresh system health and information
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={fetchSystemData}
                className="w-full"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            System Information
          </CardTitle>
          <CardDescription>
            Detailed system and application information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Application Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{systemInfo?.application.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span>{systemInfo?.application.version || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment:</span>
                  <span>{systemInfo?.application.environment || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Runtime Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Java Version:</span>
                  <span>{systemInfo?.java.version || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Java Vendor:</span>
                  <span>{systemInfo?.java.vendor || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">OS:</span>
                  <span>{systemInfo?.system.os || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Architecture:</span>
                  <span>{systemInfo?.system.architecture || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clear Cache Confirmation Dialog */}
      <Dialog open={clearCacheDialog} onOpenChange={setClearCacheDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Cache</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear the application cache? This action will temporarily affect performance as the cache rebuilds.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearCacheDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleClearCache}
              disabled={isClearingCache}
            >
              {isClearingCache ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Cache
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
