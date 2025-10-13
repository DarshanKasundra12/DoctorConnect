import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Plus, Edit, Trash2, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import PatientFormDialog from '@/components/patients/PatientFormDialog';

interface Call {
  id: string;
  call_type: string;
  status: string;
  call_notes?: string;
  call_duration?: number;
  call_outcome?: string;
  patient_id?: string;
  appointment_id?: string;
  created_at: string;
  updated_at: string;
  patients?: { full_name: string };
  appointments?: { appointment_date: string; appointment_time: string };
}

interface Patient {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
}

const Calls = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState<Call[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<Call | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    call_type: 'inquiry',
    call_notes: '',
    patient_id: 'none',
    call_duration: '',
    call_outcome: '',
    appointment_date: '',
    appointment_time: '',
    appointment_type: 'consultation',
    appointment_note: ''
  });

  useEffect(() => {
    fetchCalls();
    fetchPatients();
  }, [user?.id]);

  const fetchCalls = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          patients (
            full_name
          ),
          appointments (
            appointment_date,
            appointment_time
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // If calls table doesn't exist, show empty state
        if (error.code === 'PGRST116' || error.message.includes('relation "calls" does not exist')) {
          console.warn('Calls table not found. Please run the database migration.');
          setCalls([]);
          return;
        }
        throw error;
      }
      setCalls(data || []);
    } catch (error) {
      console.error('Error fetching calls:', error);
      toast({
        title: "Error",
        description: "Failed to fetch calls. Please ensure the database migration has been run.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, phone, email')
        .eq('user_id', user.id)
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const callData = {
        call_type: formData.call_type,
        call_notes: formData.call_notes,
        patient_id: formData.patient_id && formData.patient_id !== 'none' ? formData.patient_id : null,
        call_duration: formData.call_duration ? parseInt(formData.call_duration) : null,
        call_outcome: formData.call_outcome || null,
        status: 'completed',
        user_id: user.id
      };

      let appointmentId = null;

      // If appointment is being scheduled, create it first
      if (formData.appointment_date && formData.appointment_time) {
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .insert([{
            patient_id: formData.patient_id || null,
            appointment_date: formData.appointment_date,
            appointment_time: formData.appointment_time,
            appointment_type: formData.appointment_type,
            note: formData.appointment_note,
            status: 'scheduled',
            user_id: user.id
          }])
          .select()
          .single();

        if (appointmentError) throw appointmentError;
        appointmentId = appointmentData.id;
      }

      if (editingCall) {
        const { error } = await supabase
          .from('calls')
          .update({ ...callData, appointment_id: appointmentId })
          .eq('id', editingCall.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast({ title: "Success", description: "Call updated successfully" });
      } else {
        const { error } = await supabase
          .from('calls')
          .insert([{ ...callData, appointment_id: appointmentId }]);

        if (error) throw error;
        toast({ title: "Success", description: "Call completed successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchCalls();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('calls')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: "Success", description: "Call deleted successfully" });
      fetchCalls();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      call_type: 'inquiry',
      call_notes: '',
      patient_id: 'none',
      call_duration: '',
      call_outcome: '',
      appointment_date: '',
      appointment_time: '',
      appointment_type: 'consultation',
      appointment_note: ''
    });
    setEditingCall(null);
    setCurrentStep(1);
  };

  const handlePatientSuccess = () => {
    fetchPatients(); // Refresh the patients list
    setPatientDialogOpen(false);
    setEditingPatient(null);
  };

  const openEditDialog = (call: Call) => {
    setEditingCall(call);
    setFormData({
      call_type: call.call_type,
      call_notes: call.call_notes || '',
      patient_id: call.patient_id || 'none',
      call_duration: call.call_duration?.toString() || '',
      call_outcome: call.call_outcome || '',
      appointment_date: call.appointments?.appointment_date || '',
      appointment_time: call.appointments?.appointment_time || '',
      appointment_type: 'consultation',
      appointment_note: ''
    });
    setCurrentStep(1);
    setDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'transferred': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      case 'transferred': return 'outline';
      default: return 'secondary';
    }
  };

  const activeCalls = calls.filter(call => call.status === 'active');
  const completedCalls = calls.filter(call => call.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calls</h1>
          <p className="text-muted-foreground">
            Manage patient calls and consultations
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              New Call
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle>
                {editingCall ? 'Edit Call' : 'New Call'}
              </DialogTitle>
              <DialogDescription>
                {editingCall 
                  ? 'Update the call details below.'
                  : 'Complete the call workflow below.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    type="button"
                    variant={currentStep === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">1. </span>Call Details
                  </Button>
                  <Button
                    type="button"
                    variant={currentStep === 2 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">2. </span>Patient Info
                  </Button>
                  <Button
                    type="button"
                    variant={currentStep === 3 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">3. </span>Outcome
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground text-center sm:text-right">
                  Step {currentStep} of 3
                </div>
              </div>

              {/* Step 1: Call Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="call_type">Call Type</Label>
                    <Select 
                      value={formData.call_type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, call_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select call type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inquiry">General Inquiry</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="appointment_booking">Appointment Booking</SelectItem>
                        <SelectItem value="prescription_follow_up">Prescription Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="call_notes">Call Notes</Label>
                    <Textarea
                      id="call_notes"
                      placeholder="Describe the call details..."
                      value={formData.call_notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, call_notes: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="call_duration">Duration (minutes)</Label>
                    <Input
                      id="call_duration"
                      type="number"
                      placeholder="Enter call duration"
                      value={formData.call_duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, call_duration: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Patient Info */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient_id">Patient</Label>
                    <Select 
                      value={formData.patient_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select or add patient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No patient (anonymous call)</SelectItem>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.full_name} {patient.phone && `(${patient.phone})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.patient_id && formData.patient_id !== 'none' && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Selected patient: {patients.find(p => p.id === formData.patient_id)?.full_name}
                      </p>
                    </div>
                  )}

                  <div className="text-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setEditingPatient(null);
                        setPatientDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Patient
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Call Outcome */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="call_outcome">Call Outcome</Label>
                    <Select 
                      value={formData.call_outcome} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, call_outcome: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appointment_scheduled">Appointment Scheduled</SelectItem>
                        <SelectItem value="prescription_given">Prescription Given</SelectItem>
                        <SelectItem value="referred">Referred to Specialist</SelectItem>
                        <SelectItem value="resolved">Issue Resolved</SelectItem>
                        <SelectItem value="follow_up_needed">Follow-up Needed</SelectItem>
                        <SelectItem value="cancelled">Call Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.call_outcome === 'appointment_scheduled' && (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <h4 className="font-medium">Schedule Appointment</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="appointment_date">Date</Label>
                          <Input
                            id="appointment_date"
                            type="date"
                            value={formData.appointment_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="appointment_time">Time</Label>
                          <Input
                            id="appointment_time"
                            type="time"
                            value={formData.appointment_time}
                            onChange={(e) => setFormData(prev => ({ ...prev, appointment_time: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="appointment_type">Type</Label>
                        <Select 
                          value={formData.appointment_type} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="follow-up">Follow-up</SelectItem>
                            <SelectItem value="procedure">Procedure</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="appointment_note">Appointment Note</Label>
                        <Textarea
                          id="appointment_note"
                          placeholder="Additional notes for the appointment"
                          value={formData.appointment_note}
                          onChange={(e) => setFormData(prev => ({ ...prev, appointment_note: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="w-full sm:w-auto">
                      Previous
                    </Button>
                  )}
                  {currentStep < 3 && (
                    <Button type="button" onClick={() => setCurrentStep(currentStep + 1)} className="w-full sm:w-auto">
                      Next
                    </Button>
                  )}
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  {editingCall ? 'Update' : 'Complete'} Call
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calls.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCalls.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCalls.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Calls List */}
      <Card>
        <CardHeader>
          <CardTitle>All Calls</CardTitle>
          <CardDescription>
            Complete list of patient calls and consultations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No calls yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first call
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                Start New Call
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {calls.map((call) => (
                <div key={call.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1 min-w-0">
                    <div className="text-center sm:text-left min-w-0">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        {getStatusIcon(call.status)}
                        <p className="text-sm font-medium">
                          {new Date(call.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(call.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-medium truncate">
                          {call.patients?.full_name || 'Anonymous Call'}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {call.call_type.replace('_', ' ')}
                      </p>
                      {call.call_notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {call.call_notes}
                        </p>
                      )}
                      {call.call_duration && (
                        <p className="text-xs text-muted-foreground">
                          Duration: {call.call_duration} minutes
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getStatusColor(call.status)} className="text-xs">
                        {call.status}
                      </Badge>
                      {call.call_outcome && (
                        <Badge variant="outline" className="text-xs">
                          {call.call_outcome.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end sm:justify-start space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditDialog(call)}
                      className="flex-shrink-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Call</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this call? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(call.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Form Dialog */}
      <PatientFormDialog
        isOpen={patientDialogOpen}
        onClose={() => setPatientDialogOpen(false)}
        onSuccess={handlePatientSuccess}
        editingPatient={editingPatient}
      />
    </div>
  );
};

export default Calls;
