import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Phone, 
  Users, 
  DollarSign, 
  TrendingUp,
  PhoneCall,
  UserPlus,
  FileText,
  Video,
  Clock,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalCalls: number;
  totalPatients: number;
  monthlyRevenue: number;
  todayCalls: any[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalCalls: 0,
    totalPatients: 0,
    monthlyRevenue: 0,
    todayCalls: []
  });
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<any | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    try {
      // Fetch total calls
      const { count: callsCount, error: callsError } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (callsError && callsError.code === 'PGRST116') {
        console.warn('Calls table not found. Please run the database migration.');
      }

      // Fetch total patients
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch monthly revenue from invoices
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: invoices } = await supabase
        .from('invoices')
        .select('amount')
        .eq('user_id', user.id)
        .gte('created_at', `${currentMonth}-01`)
        .lt('created_at', `${currentMonth}-32`);

      const monthlyRevenue = invoices?.reduce((sum, invoice) => sum + Number(invoice.amount), 0) || 0;

      // Fetch today's calls
      const today = new Date().toISOString().split('T')[0];
      const { data: todayCalls, error: todayCallsError } = await supabase
        .from('calls')
        .select(`
          *,
          patients (
            full_name,
            email
          )
        `)
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false });

      if (todayCallsError && todayCallsError.code === 'PGRST116') {
        console.warn('Calls table not found for today\'s calls. Please run the database migration.');
      }

      setStats({
        totalCalls: callsError && callsError.code === 'PGRST116' ? 0 : (callsCount || 0),
        totalPatients: patientsCount || 0,
        monthlyRevenue,
        todayCalls: todayCallsError && todayCallsError.code === 'PGRST116' ? [] : (todayCalls || [])
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'New Call',
      description: 'Start a new patient call',
      icon: PhoneCall,
      color: 'bg-primary',
      onClick: () => navigate('/calls')
    },
    {
      title: 'Add Patient',
      description: 'Register new patient',
      icon: UserPlus,
      color: 'bg-medical-success',
      onClick: () => navigate('/patients')
    },
    {
      title: 'Create Invoice',
      description: 'Generate billing invoice',
      icon: FileText,
      color: 'bg-medical-warning',
      onClick: () => navigate('/billing')
    },
    {
      title: 'Start Teleconsult',
      description: 'Begin video consultation',
      icon: Video,
      color: 'bg-medical-error',
      onClick: () => navigate('/teleconsult')
    }
  ];

  const getCallStatus = (call: any) => {
    switch (call.status) {
      case 'active':
        return { label: 'Active', variant: 'destructive' as const };
      case 'completed':
        return { label: 'Completed', variant: 'default' as const };
      case 'cancelled':
        return { label: 'Cancelled', variant: 'secondary' as const };
      case 'transferred':
        return { label: 'Transferred', variant: 'outline' as const };
      default:
        return { label: 'Unknown', variant: 'secondary' as const };
    }
  };

  const openDetails = (call: any) => {
    setSelectedCall(call);
    setDetailsOpen(true);
  };

  const sendReminder = async (appointment: any) => {
    try {
      const patientEmail = appointment?.patients?.email;
      const patientName = appointment?.patients?.full_name || 'Patient';
      if (!patientEmail) {
        toast({ title: 'No email on file', description: 'Patient email is missing', variant: 'destructive' });
        return;
      }

      const subject = `Appointment Reminder for ${appointment.appointment_date} ${appointment.appointment_time}`;
      const message = `Hello ${patientName},\n\nThis is a reminder for your ${appointment.appointment_type} on ${appointment.appointment_date} at ${appointment.appointment_time}.\n\nThank you.`;

      const { error } = await supabase.functions.invoke('resend-email', {
        body: {
          to: patientEmail,
          subject,
          text: message
        }
      } as any);

      if (error) throw error;
      toast({ title: 'Reminder Sent', description: `Email sent to ${patientName}` });
    } catch (err: any) {
      toast({ title: 'Email failed', description: err?.message || 'Unable to send email', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your practice performance and today's schedule
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalls}</div>
            <p className="text-xs text-muted-foreground">
              All time calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Registered patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month's earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calls</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCalls.length}</div>
            <p className="text-xs text-muted-foreground">
              Calls made today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for efficient practice management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex-col items-start space-y-2"
                  onClick={action.onClick}
                >
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Calls */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Calls</CardTitle>
          <CardDescription>
            Your calls for {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.todayCalls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No calls made today</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/calls')}
              >
                Start New Call
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.todayCalls.map((call) => {
                const status = getCallStatus(call);
                return (
                  <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">{new Date(call.created_at).toLocaleTimeString()}</p>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div>
                        <p className="font-medium">{call.patients?.full_name || 'Anonymous Call'}</p>
                        <p className="text-sm text-muted-foreground capitalize">{call.call_type.replace('_', ' ')}</p>
                        {call.call_notes && (
                          <p className="text-xs text-muted-foreground mt-1">{call.call_notes}</p>
                        )}
                        {call.call_duration && (
                          <p className="text-xs text-muted-foreground">Duration: {call.call_duration} min</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDetails(call)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
            <DialogDescription>Review call information for today.</DialogDescription>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Patient</p>
                  <p className="font-medium">{selectedCall.patients?.full_name || 'Anonymous'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedCall.call_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium">{new Date(selectedCall.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedCall.call_duration ? `${selectedCall.call_duration} min` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedCall.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Outcome</p>
                  <p className="font-medium capitalize">{selectedCall.call_outcome ? selectedCall.call_outcome.replace('_', ' ') : 'N/A'}</p>
                </div>
              </div>
              {selectedCall.call_notes && (
                <div>
                  <p className="text-muted-foreground text-sm">Notes</p>
                  <p className="text-sm">{selectedCall.call_notes}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;