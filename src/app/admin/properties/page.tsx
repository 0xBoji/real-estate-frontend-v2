'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, Property, PaginatedResponse } from '@/lib/api';
import { errorUtils } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  MoreHorizontal, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Building,
  Filter,
  CheckSquare,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<PaginatedResponse<Property> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; propertyId: number | null }>({
    open: false,
    propertyId: null,
  });
  const [rejectReason, setRejectReason] = useState('');

  const fetchProperties = async (page = 0) => {
    try {
      setIsLoading(true);
      const response = await adminApi.getProperties(page, pageSize);
      setProperties(response);
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      toast.error(`Failed to load properties: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(currentPage);
  }, [currentPage]);

  const handleApprove = async (propertyId: number) => {
    try {
      await adminApi.approveProperty(propertyId);
      toast.success('Property approved successfully');
      fetchProperties(currentPage);
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      toast.error(`Failed to approve property: ${errorMessage}`);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.propertyId || !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await adminApi.rejectProperty(rejectDialog.propertyId, rejectReason);
      toast.success('Property rejected successfully');
      setRejectDialog({ open: false, propertyId: null });
      setRejectReason('');
      fetchProperties(currentPage);
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      toast.error(`Failed to reject property: ${errorMessage}`);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedProperties.length === 0) {
      toast.error('Please select properties to approve');
      return;
    }

    try {
      await adminApi.bulkApproveProperties(selectedProperties);
      toast.success(`${selectedProperties.length} properties approved successfully`);
      setSelectedProperties([]);
      fetchProperties(currentPage);
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      toast.error(`Failed to approve properties: ${errorMessage}`);
    }
  };

  const handleSelectProperty = (propertyId: number, checked: boolean) => {
    if (checked) {
      setSelectedProperties([...selectedProperties, propertyId]);
    } else {
      setSelectedProperties(selectedProperties.filter(id => id !== propertyId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = properties?.content.map(p => p.id) || [];
      setSelectedProperties(allIds);
    } else {
      setSelectedProperties([]);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading && !properties) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
          <p className="text-muted-foreground">Manage property listings and approvals</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
        <p className="text-muted-foreground">
          Manage property listings and approvals
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties?.totalElements || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {properties?.content.filter(p => p.status === 'APPROVED').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {properties?.content.filter(p => p.status === 'PENDING').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {properties?.content.filter(p => p.status === 'REJECTED').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Management */}
      <Card>
        <CardHeader>
          <CardTitle>Property Management</CardTitle>
          <CardDescription>
            Review, approve, or reject property listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search properties by title, address, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedProperties.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedProperties.length} properties selected
              </span>
              <Button size="sm" onClick={handleBulkApprove}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Bulk Approve
              </Button>
            </div>
          )}

          {/* Properties List */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                checked={selectedProperties.length === properties?.content.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">Select All</span>
            </div>

            {properties?.content.map((property) => (
              <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedProperties.includes(property.id)}
                    onCheckedChange={(checked) => handleSelectProperty(property.id, checked as boolean)}
                  />
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Building className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{property.title}</h3>
                      <Badge variant={getStatusBadgeVariant(property.status)}>
                        {property.status}
                      </Badge>
                      <Badge variant="outline">
                        {property.propertyType}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{property.address}, {property.city}</p>
                    <p className="text-sm font-medium">{formatPrice(property.price)}</p>
                    <p className="text-xs text-muted-foreground">
                      Listed {formatDate(property.createdAt)}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {property.status === 'PENDING' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleApprove(property.id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve Property
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setRejectDialog({ open: true, propertyId: property.id })}
                          className="text-red-600"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject Property
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {properties && properties.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {properties.number * properties.size + 1} to{' '}
                {Math.min((properties.number + 1) * properties.size, properties.totalElements)} of{' '}
                {properties.totalElements} properties
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={properties.first}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={properties.last}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, propertyId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Property</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this property. This will be sent to the property owner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, propertyId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
