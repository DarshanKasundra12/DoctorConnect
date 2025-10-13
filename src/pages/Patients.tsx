import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Plus, Search, Edit, Eye, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PatientFormDialog from '@/components/patients/PatientFormDialog';

interface Patient {
  id: string;
  full_name: string;
  gender?: string;
  phone?: string;
  email?: string;
  age?: number;
  created_at: string;
}

const Patients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  useEffect(() => {
    fetchPatients();
  }, [user?.id]);

  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setIsFormDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingPatient(null);
    setIsFormDialogOpen(true);
  };

  const handleDelete = async (patientId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Patient deleted successfully" });
      fetchPatients();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleFormSuccess = () => {
    fetchPatients();
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage your patient records and information
          </p>
        </div>
        
        <Button className="flex items-center gap-2 w-full sm:w-auto" onClick={handleAddNew}>
          <Plus className="h-4 w-4" />
          Add New Patient
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <Input
                placeholder="Search patients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 shadow-none"
              />
            </div>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
          <CardDescription>
            Complete list of registered patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No patients found' : 'No patients registered yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Start by adding your first patient record'
                }
              </p>
              {!searchTerm && (
                <Button onClick={handleAddNew}>
                  Add Patient
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-4">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-lg">
                        {patient.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{patient.full_name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-muted-foreground">
                        {patient.email && <span className="truncate">{patient.email}</span>}
                        {patient.phone && <span className="truncate">{patient.phone}</span>}
                        {patient.gender && (
                          <Badge variant="outline" className="w-fit">
                            {patient.gender}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Registered: {new Date(patient.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end sm:justify-start space-x-2">
                    <Button variant="outline" size="sm" className="flex-shrink-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(patient)} className="flex-shrink-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(patient.id)}
                      className="text-destructive hover:text-destructive flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PatientFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
        editingPatient={editingPatient}
      />
    </div>
  );
};

export default Patients;