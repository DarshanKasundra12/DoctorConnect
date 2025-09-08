import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  CalendarPlus,
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
  totalAppointments: number;
  totalPatients: number;
  monthlyRevenue: number;
  todayAppointments: any[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    totalPatients: 0,
    monthlyRevenue: 0,
    todayAppointments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    try {
      // Fetch total appointments
      const { count: appointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

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

      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAppointments } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (
            full_name
          )
        `)
        .eq('user_id', user.id)
        .eq('appointment_date', today)
        .order('appointment_time');

      setStats({
        totalAppointments: appointmentsCount || 0,
        totalPatients: patientsCount || 0,
        monthlyRevenue,
        todayAppointments: todayAppointments || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'New Appointment',
      description: 'Schedule a new appointment',
      icon: CalendarPlus,
      color: 'bg-primary',
      onClick: () => navigate('/appointments')
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

  const getAppointmentStatus = (appointment: any) => {
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    
    if (appointmentDateTime < now) {
      return { label: 'Completed', variant: 'default' as const };
    } else if (appointmentDateTime.getTime() - now.getTime() < 30 * 60 * 1000) {
      return { label: 'Starting Soon', variant: 'destructive' as const };
    } else {
      return { label: 'Scheduled', variant: 'secondary' as const };
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
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              All time appointments
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
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
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

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>
            Your appointments for {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No appointments scheduled for today</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/appointments')}
              >
                Schedule Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.todayAppointments.map((appointment) => {
                const status = getAppointmentStatus(appointment);
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">{appointment.appointment_time}</p>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patients?.full_name || 'Unknown Patient'}</p>
                        <p className="text-sm text-muted-foreground">{appointment.appointment_type}</p>
                        {appointment.note && (
                          <p className="text-xs text-muted-foreground mt-1">{appointment.note}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;