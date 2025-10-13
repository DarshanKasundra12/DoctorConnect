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
import { Video, Calendar, Clock, Users, Plus, ExternalLink, FileText, Settings, Trash2, Bell, Copy, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  full_name: string;
}

interface Meeting {
  id: string;
  patient_id: string;
  scheduled_date: string;
  duration: number;
  status: string;
  meeting_url: string;
  meeting_id: string;
  notes?: string;
  created_at: string;
  patients?: { full_name: string };
}

const Teleconsult = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isInstantMeetingDialogOpen, setIsInstantMeetingDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [joinMeetingId, setJoinMeetingId] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [formData, setFormData] = useState({
    patient_id: '',
    scheduled_date: '',
    scheduled_time: '',
    duration: '30',
  });

  const generateMeetingId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const generateMeetingUrl = (meetingId: string) => {
    return `https://meet.doctorconnect.com/${meetingId}`;
  };

  const fetchMeetings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('teleconsult_meetings')
      .select(`
        *,
        patients (full_name)
      `)
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setMeetings(data || []);
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
    fetchMeetings();
    fetchPatients();
  }, [user]);

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const meetingId = generateMeetingId();
    const meetingUrl = generateMeetingUrl(meetingId);
    const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);

    const { error } = await supabase
      .from('teleconsult_meetings')
      .insert([{
        patient_id: formData.patient_id,
        scheduled_date: scheduledDateTime.toISOString(),
        duration: parseInt(formData.duration),
        meeting_id: meetingId,
        meeting_url: meetingUrl,
        user_id: user.id,
      }]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Meeting scheduled successfully" });
      setIsScheduleDialogOpen(false);
      setFormData({
        patient_id: '',
        scheduled_date: '',
        scheduled_time: '',
        duration: '30',
      });
      fetchMeetings();
    }
  };

  const handleStartInstantMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const meetingId = generateMeetingId();
    const meetingUrl = generateMeetingUrl(meetingId);

    const { error } = await supabase
      .from('teleconsult_meetings')
      .insert([{
        patient_id: formData.patient_id,
        scheduled_date: new Date().toISOString(),
        duration: 30,
        meeting_id: meetingId,
        meeting_url: meetingUrl,
        status: 'active',
        user_id: user.id,
      }]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Instant meeting started" });
      setIsInstantMeetingDialogOpen(false);
      // Open meeting URL in new tab
      window.open(meetingUrl, '_blank');
      fetchMeetings();
    }
  };

  const joinMeeting = (meetingUrl: string) => {
    window.open(meetingUrl, '_blank');
  };

  const joinMeetingById = () => {
    if (joinMeetingId.trim()) {
      const meetingUrl = generateMeetingUrl(joinMeetingId.trim());
      joinMeeting(meetingUrl);
      setJoinMeetingId('');
    }
  };

  const deleteMeeting = async (meetingId: string) => {
    const { error } = await supabase
      .from('teleconsult_meetings')
      .delete()
      .eq('id', meetingId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Meeting deleted successfully" });
      fetchMeetings();
    }
  };

  const updateMeetingStatus = async (meetingId: string, status: string) => {
    const { error } = await supabase
      .from('teleconsult_meetings')
      .update({ status })
      .eq('id', meetingId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Meeting marked as ${status}` });
      fetchMeetings();
    }
  };

  const saveMeetingNotes = async () => {
    if (!selectedMeeting) return;

    const { error } = await supabase
      .from('teleconsult_meetings')
      .update({ notes: meetingNotes })
      .eq('id', selectedMeeting.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Notes saved successfully" });
      setIsNotesDialogOpen(false);
      setSelectedMeeting(null);
      setMeetingNotes('');
      fetchMeetings();
    }
  };

  const openNotesDialog = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setMeetingNotes(meeting.notes || '');
    setIsNotesDialogOpen(true);
  };

  const copyMeetingLink = (meetingUrl: string) => {
    navigator.clipboard.writeText(meetingUrl);
    toast({ title: "Success", description: "Meeting link copied to clipboard" });
  };

  const shareMeetingLink = async (meetingUrl: string, patientName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Teleconsultation Meeting with ${patientName}`,
          text: `Join our teleconsultation meeting`,
          url: meetingUrl,
        });
      } catch (error) {
        copyMeetingLink(meetingUrl);
      }
    } else {
      copyMeetingLink(meetingUrl);
    }
  };

  const sendNotification = async (meeting: Meeting) => {
    // Simulate sending notification - in real app, this would call an API
    toast({ 
      title: "Notification Sent", 
      description: `Reminder sent to ${meeting.patients?.full_name} about the upcoming meeting` 
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: 'outline',
      active: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}
             className={status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : ''}>
        {status}
      </Badge>
    );
  };

  const upcomingMeetings = meetings.filter(meeting => {
    const now = new Date();
    const meetingDate = new Date(meeting.scheduled_date);
    return meetingDate > now && meeting.status === 'scheduled';
  });

  const todaysMeetings = meetings.filter(meeting => {
    const today = new Date().toDateString();
    const meetingDate = new Date(meeting.scheduled_date).toDateString();
    return today === meetingDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teleconsultation</h1>
          <p className="text-muted-foreground">Manage video consultations with patients</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isInstantMeetingDialogOpen} onOpenChange={setIsInstantMeetingDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Video className="mr-2 h-4 w-4" />
                Start Instant Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start Instant Meeting</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleStartInstantMeeting} className="space-y-4">
                <div>
                  <Label htmlFor="instant_patient_id">Patient</Label>
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
                <Button type="submit" className="w-full">
                  <Video className="mr-2 h-4 w-4" />
                  Start Meeting Now
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleScheduleMeeting} className="space-y-4">
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduled_date">Date</Label>
                    <Input
                      id="scheduled_date"
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduled_time">Time</Label>
                    <Input
                      id="scheduled_time"
                      type="time"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select 
                    value={formData.duration} 
                    onValueChange={(value) => setFormData({...formData, duration: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full">Schedule Meeting</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Enter Meeting ID to join..."
              value={joinMeetingId}
              onChange={(e) => setJoinMeetingId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={joinMeetingById} disabled={!joinMeetingId.trim()}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Join Meeting
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysMeetings.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Meetings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Meeting ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell>
                    {new Date(meeting.scheduled_date).toLocaleString()}
                  </TableCell>
                  <TableCell>{meeting.patients?.full_name}</TableCell>
                  <TableCell>{meeting.duration} min</TableCell>
                  <TableCell className="font-mono text-sm">{meeting.meeting_id}</TableCell>
                  <TableCell>{getStatusBadge(meeting.status)}</TableCell>
                  <TableCell className="max-w-xs">
                    {meeting.notes ? (
                      <span className="text-sm text-muted-foreground truncate block">
                        {meeting.notes}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No notes</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => joinMeeting(meeting.meeting_url)}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openNotesDialog(meeting)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyMeetingLink(meeting.meeting_url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => shareMeetingLink(meeting.meeting_url, meeting.patients?.full_name || 'Patient')}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      {meeting.status === 'scheduled' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => sendNotification(meeting)}
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this meeting? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMeeting(meeting.id)}>
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

      {/* Meeting Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Meeting Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMeeting && (
              <div className="text-sm text-muted-foreground">
                <p><strong>Patient:</strong> {selectedMeeting.patients?.full_name}</p>
                <p><strong>Date:</strong> {new Date(selectedMeeting.scheduled_date).toLocaleString()}</p>
                <p><strong>Duration:</strong> {selectedMeeting.duration} minutes</p>
              </div>
            )}
            <div>
              <Label htmlFor="meeting_notes">Notes</Label>
              <Textarea
                id="meeting_notes"
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Add your consultation notes here..."
                className="min-h-[200px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveMeetingNotes}>
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teleconsult;