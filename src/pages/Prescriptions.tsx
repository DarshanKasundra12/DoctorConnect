import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText, Search, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { downloadPrescriptionPDF } from '@/components/prescriptions/PrescriptionPDF';

interface Patient {
  id: string;
  full_name: string;
}

interface Prescription {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  special_instructions: string;
  prescribed_date: string;
  patients?: { full_name: string };
}

const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    special_instructions: '',
  });

  const fetchPrescriptions = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patients (full_name)
      `)
      .eq('user_id', user.id)
      .order('prescribed_date', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPrescriptions(data || []);
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
    fetchPrescriptions();
    fetchPatients();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingPrescription) {
        const { error } = await supabase
          .from('prescriptions')
          .update(formData)
          .eq('id', editingPrescription.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast({ title: "Success", description: "Prescription updated successfully" });
      } else {
        const { error } = await supabase
          .from('prescriptions')
          .insert([{
            ...formData,
            user_id: user.id,
          }]);

        if (error) throw error;
        toast({ title: "Success", description: "Prescription created successfully" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPrescriptions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      special_instructions: '',
    });
    setEditingPrescription(null);
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setFormData({
      patient_id: prescription.patient_id,
      medication_name: prescription.medication_name,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      special_instructions: prescription.special_instructions || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (prescriptionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', prescriptionId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: "Success", description: "Prescription deleted successfully" });
      fetchPrescriptions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDownloadPDF = async (prescription: Prescription) => {
    try {
      // Get user profile for doctor name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user?.id)
        .single();

      const pdfData = {
        id: prescription.id,
        patient_name: prescription.patients?.full_name || 'Unknown Patient',
        medication_name: prescription.medication_name,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        special_instructions: prescription.special_instructions || '',
        prescribed_date: prescription.prescribed_date,
        doctor_name: profile?.full_name || user?.email || 'Unknown Doctor',
      };

      downloadPrescriptionPDF(pdfData);
      toast({ title: "Success", description: "PDF downloaded successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.patients?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground">Manage patient prescriptions</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPrescription ? 'Edit Prescription' : 'Create New Prescription'}
              </DialogTitle>
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medication_name">Medication Name</Label>
                  <Input
                    id="medication_name"
                    value={formData.medication_name}
                    onChange={(e) => setFormData({...formData, medication_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select 
                    value={formData.frequency} 
                    onValueChange={(value) => setFormData({...formData, frequency: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Once daily">Once daily</SelectItem>
                      <SelectItem value="Twice daily">Twice daily</SelectItem>
                      <SelectItem value="Three times daily">Three times daily</SelectItem>
                      <SelectItem value="Four times daily">Four times daily</SelectItem>
                      <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                      <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 7 days, 2 weeks"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="special_instructions">Special Instructions</Label>
                <Textarea
                  id="special_instructions"
                  value={formData.special_instructions}
                  onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}
                  placeholder="Any special instructions..."
                />
              </div>
              
              <Button type="submit" className="w-full">
                {editingPrescription ? 'Update Prescription' : 'Create Prescription'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Prescriptions
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Date</TableHead>
                  <TableHead className="min-w-[120px]">Patient</TableHead>
                  <TableHead className="min-w-[150px]">Medication</TableHead>
                  <TableHead className="min-w-[100px]">Dosage</TableHead>
                  <TableHead className="min-w-[120px]">Frequency</TableHead>
                  <TableHead className="min-w-[100px]">Duration</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(prescription.prescribed_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="truncate max-w-[120px]">{prescription.patients?.full_name}</TableCell>
                    <TableCell className="font-medium truncate max-w-[150px]">{prescription.medication_name}</TableCell>
                    <TableCell className="truncate max-w-[100px]">{prescription.dosage}</TableCell>
                    <TableCell className="truncate max-w-[120px]">{prescription.frequency}</TableCell>
                    <TableCell className="truncate max-w-[100px]">{prescription.duration}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPDF(prescription)}
                          className="flex-shrink-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(prescription)}
                          className="flex-shrink-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(prescription.id)}
                          className="text-destructive hover:text-destructive flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Prescriptions;