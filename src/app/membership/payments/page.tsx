'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CreditCard, 
  Download, 
  Search, 
  Filter, 
  Calendar,
  ArrowLeft,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { membershipApi } from '@/lib/api';

interface PaymentRecord {
  id: number;
  transactionId: string;
  planName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentGateway: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentDate: string;
  invoiceUrl?: string;
}

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock data for demo
  const mockPayments: PaymentRecord[] = [
    {
      id: 1,
      transactionId: 'TXN-2024-001',
      planName: 'Professional Plan',
      amount: 328900,
      currency: 'VND',
      paymentMethod: 'VNPay',
      paymentGateway: 'VNPAY',
      status: 'COMPLETED',
      paymentDate: '2024-01-15T10:30:00Z',
      invoiceUrl: '/invoices/TXN-2024-001.pdf'
    },
    {
      id: 2,
      transactionId: 'TXN-2023-045',
      planName: 'Basic Plan',
      amount: 108900,
      currency: 'VND',
      paymentMethod: 'Credit Card',
      paymentGateway: 'STRIPE',
      status: 'COMPLETED',
      paymentDate: '2023-12-15T14:20:00Z',
      invoiceUrl: '/invoices/TXN-2023-045.pdf'
    },
    {
      id: 3,
      transactionId: 'TXN-2023-032',
      planName: 'Professional Plan',
      amount: 328900,
      currency: 'VND',
      paymentMethod: 'VNPay',
      paymentGateway: 'VNPAY',
      status: 'FAILED',
      paymentDate: '2023-11-20T09:15:00Z'
    },
    {
      id: 4,
      transactionId: 'TXN-2023-018',
      planName: 'Basic Plan',
      amount: 108900,
      currency: 'VND',
      paymentMethod: 'Credit Card',
      paymentGateway: 'STRIPE',
      status: 'REFUNDED',
      paymentDate: '2023-10-10T16:45:00Z',
      invoiceUrl: '/invoices/TXN-2023-018.pdf'
    }
  ];

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setIsLoading(true);
      // Try to fetch from API
      const history = await membershipApi.getPaymentHistory();
      setPayments(history);
    } catch (error) {
      console.log('API not available, using mock data');
      // Use mock data for demo
      setPayments(mockPayments);
    } finally {
      setIsLoading(false);
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'REFUNDED':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadInvoice = (payment: PaymentRecord) => {
    if (payment.invoiceUrl) {
      // In a real app, this would download the actual invoice
      toast.success(`Downloading invoice for ${payment.transactionId}`);
      console.log('Downloading invoice:', payment.invoiceUrl);
    } else {
      toast.error('Invoice not available for this payment');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.planName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status.toLowerCase() === statusFilter.toLowerCase();
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const paymentDate = new Date(payment.paymentDate);
      const now = new Date();
      
      switch (dateFilter) {
        case 'last_month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          matchesDate = paymentDate >= lastMonth;
          break;
        case 'last_3_months':
          const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          matchesDate = paymentDate >= last3Months;
          break;
        case 'last_year':
          const lastYear = new Date(now.getFullYear() - 1, 0, 1);
          matchesDate = paymentDate >= lastYear;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalAmount = filteredPayments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, payment) => sum + payment.amount, 0);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                <p className="text-gray-600">View and manage your payment records</p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Receipt className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Payments</p>
                    <p className="text-2xl font-bold">{filteredPayments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">
                      {filteredPayments.filter(p => p.status === 'COMPLETED').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold">{formatPrice(totalAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Last Payment</p>
                    <p className="text-sm font-bold">
                      {filteredPayments.length > 0 
                        ? formatDate(filteredPayments[0].paymentDate)
                        : 'No payments'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('all');
                }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Records</CardTitle>
              <CardDescription>
                {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPayments.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
                  <p className="text-gray-600 mb-6">
                    {payments.length === 0 
                      ? "You haven't made any payments yet."
                      : "No payments match your current filters."
                    }
                  </p>
                  {payments.length === 0 && (
                    <Button asChild>
                      <Link href="/membership">Choose a Plan</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.transactionId}
                          </TableCell>
                          <TableCell>{payment.planName}</TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                              {payment.paymentMethod}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getStatusIcon(payment.status)}
                              <Badge className={`ml-2 ${getStatusColor(payment.status)}`}>
                                {payment.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                          <TableCell>
                            {payment.invoiceUrl && payment.status === 'COMPLETED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadInvoice(payment)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Invoice
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              Need Help with Your Payments?
            </h3>
            <p className="text-blue-700 mb-4">
              If you have questions about any payment or need assistance with invoices, 
              our support team is here to help.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/help">Help Center</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
