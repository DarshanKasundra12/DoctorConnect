import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, CreditCard, Search, FileText, Edit, Trash2, Download, Filter, Calendar, FileDown, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { downloadInvoicePDF } from '@/components/billing/InvoicePDF';

interface Patient {
  id: string;
  full_name: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  patient_id: string;
  service_description: string;
  amount: number;
  due_date: string;
  status: string;
  created_at: string;
  patients?: { full_name: string };
}

const Billing = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDoctorInfoDialogOpen, setIsDoctorInfoDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [doctorInfo, setDoctorInfo] = useState({
    name: 'Dr. John Doe',
    clinic: 'DoctorConnect Healthcare',
    address: '123 Medical Center, Healthcare City',
    phone: '+1 (555) 123-4567',
    email: 'doctor@healthcare.com'
  });
  const [formData, setFormData] = useState({
    patient_id: '',
    service_description: '',
    amount: '',
    due_date: '',
  });

  const generateInvoiceNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_invoice_number');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to client-side generation
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `INV-${year}${month}-${random}`;
    }
  };

  const fetchInvoices = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        patients (full_name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setInvoices(data || []);
    }
  };

  const fetchPatients = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name')
      .eq('user_id', user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPatients(data || []);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const invoiceNumber = await generateInvoiceNumber();

    const { error } = await supabase
      .from('invoices')
      .insert([{
        ...formData,
        invoice_number: invoiceNumber,
        amount: parseFloat(formData.amount),
        user_id: user.id,
      }]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Invoice created successfully" });
      setIsDialogOpen(false);
      setFormData({
        patient_id: '',
        service_description: '',
        amount: '',
        due_date: '',
      });
      fetchInvoices();
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    const { error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', invoiceId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Invoice marked as ${status}` });
      fetchInvoices();
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Invoice deleted successfully" });
      fetchInvoices();
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      patient_id: invoice.patient_id,
      service_description: invoice.service_description,
      amount: invoice.amount.toString(),
      due_date: invoice.due_date,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingInvoice) return;

    const { error } = await supabase
      .from('invoices')
      .update({
        patient_id: formData.patient_id,
        service_description: formData.service_description,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
      })
      .eq('id', editingInvoice.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Invoice updated successfully" });
      setIsEditDialogOpen(false);
      setEditingInvoice(null);
      setFormData({
        patient_id: '',
        service_description: '',
        amount: '',
        due_date: '',
      });
      fetchInvoices();
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Invoice #', 'Patient', 'Service', 'Amount', 'Due Date', 'Status', 'Created At'],
      ...filteredInvoices.map(invoice => [
        invoice.invoice_number,
        invoice.patients?.full_name || '',
        invoice.service_description,
        invoice.amount.toString(),
        new Date(invoice.due_date).toLocaleDateString(),
        invoice.status,
        new Date(invoice.created_at).toLocaleDateString()
      ])
    ];

    const csv = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    try {
      downloadInvoicePDF(invoice, doctorInfo);
      toast({ title: "Success", description: "Invoice PDF downloaded successfully" });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      paid: 'default',
      overdue: 'destructive',
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'} 
             className={status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : ''}>
        {status}
      </Badge>
    );
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.patients?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.service_description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const invoiceDate = new Date(invoice.created_at);
      const now = new Date();
      const daysDiff = (now.getTime() - invoiceDate.getTime()) / (1000 * 3600 * 24);
      
      switch (dateFilter) {
        case 'today': return daysDiff < 1;
        case 'week': return daysDiff < 7;
        case 'month': return daysDiff < 30;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPending = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage invoices and track payments</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={isDoctorInfoDialogOpen} onOpenChange={setIsDoctorInfoDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                PDF Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>PDF Invoice Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clinic_name">Clinic Name</Label>
                  <Input
                    id="clinic_name"
                    value={doctorInfo.clinic}
                    onChange={(e) => setDoctorInfo({...doctorInfo, clinic: e.target.value})}
                    placeholder="Enter clinic name"
                  />
                </div>
                <div>
                  <Label htmlFor="doctor_name">Doctor Name</Label>
                  <Input
                    id="doctor_name"
                    value={doctorInfo.name}
                    onChange={(e) => setDoctorInfo({...doctorInfo, name: e.target.value})}
                    placeholder="Enter doctor name"
                  />
                </div>
                <div>
                  <Label htmlFor="clinic_address">Address</Label>
                  <Textarea
                    id="clinic_address"
                    value={doctorInfo.address}
                    onChange={(e) => setDoctorInfo({...doctorInfo, address: e.target.value})}
                    placeholder="Enter clinic address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clinic_phone">Phone</Label>
                    <Input
                      id="clinic_phone"
                      value={doctorInfo.phone}
                      onChange={(e) => setDoctorInfo({...doctorInfo, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinic_email">Email</Label>
                    <Input
                      id="clinic_email"
                      type="email"
                      value={doctorInfo.email}
                      onChange={(e) => setDoctorInfo({...doctorInfo, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <Button onClick={() => setIsDoctorInfoDialogOpen(false)} className="w-full">
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="patient_id">Patient</Label>
                  <Select 
                    value={formData.patient_id} 
                    onValueChange={(value) => setFormData({...formData, patient_id: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="service_description">Service Description</Label>
                  <Textarea
                    id="service_description"
                    value={formData.service_description}
                    onChange={(e) => setFormData({...formData, service_description: e.target.value})}
                    placeholder="Describe the services provided..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">Create Invoice</Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Invoice Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Invoice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="edit_patient_id">Patient</Label>
                  <Select 
                    value={formData.patient_id} 
                    onValueChange={(value) => setFormData({...formData, patient_id: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit_service_description">Service Description</Label>
                  <Textarea
                    id="edit_service_description"
                    value={formData.service_description}
                    onChange={(e) => setFormData({...formData, service_description: e.target.value})}
                    placeholder="Describe the services provided..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_amount">Amount (₹)</Label>
                    <Input
                      id="edit_amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_due_date">Due Date</Label>
                    <Input
                      id="edit_due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">Update Invoice</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPending.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            All Invoices
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.patients?.full_name}</TableCell>
                  <TableCell className="max-w-xs truncate">{invoice.service_description}</TableCell>
                  <TableCell>₹{invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPDF(invoice)}
                        title="Download PDF"
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                      {invoice.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                        >
                          Mark Paid
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(invoice)}
                        title="Edit Invoice"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" title="Delete Invoice">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete invoice {invoice.invoice_number}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteInvoice(invoice.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;