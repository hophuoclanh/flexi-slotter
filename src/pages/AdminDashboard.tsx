
import { useState } from "react";
import { 
  BarChart3, 
  Building2, 
  Calendar, 
  CalendarDays, 
  Info, 
  Loader2, 
  Users 
} from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type BookingStats = {
  total: number;
  checkedIn: number;
  completed: number;
  noShow: number;
};

type WorkspaceStats = {
  id: number;
  name: string;
  totalBookings: number;
};

type DailyBookings = {
  date: string;
  count: number;
};

const AdminDashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  
  // Fetch booking statistics
  const { data: bookingStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['bookingStats'],
    queryFn: async () => {
      // Get total bookings
      const { count: total, error: totalError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
        
      if (totalError) throw totalError;
      
      // Get checked in bookings
      const { count: checkedIn, error: checkedInError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'checked_in');
        
      if (checkedInError) throw checkedInError;
      
      // Get completed bookings
      const { count: completed, error: completedError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
        
      if (completedError) throw completedError;
      
      // Get no show bookings
      const { count: noShow, error: noShowError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('no_show', true);
        
      if (noShowError) throw noShowError;
      
      return {
        total: total || 0,
        checkedIn: checkedIn || 0,
        completed: completed || 0,
        noShow: noShow || 0,
      } as BookingStats;
    },
  });
  
  // Fetch workspace statistics
  const { data: workspaceStats, isLoading: isLoadingWorkspaceStats } = useQuery({
    queryKey: ['workspaceStats'],
    queryFn: async () => {
      const { data: workspaces, error: workspacesError } = await supabase
        .from('workspaces')
        .select('id, name');
        
      if (workspacesError) throw workspacesError;
      
      const stats: WorkspaceStats[] = [];
      
      for (const workspace of workspaces) {
        const { count, error } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id);
          
        if (error) throw error;
        
        stats.push({
          id: workspace.id,
          name: workspace.name,
          totalBookings: count || 0,
        });
      }
      
      return stats;
    },
  });
  
  // Fetch daily bookings for chart
  const { data: dailyBookings, isLoading: isLoadingDailyBookings } = useQuery({
    queryKey: ['dailyBookings'],
    queryFn: async () => {
      // Get last 7 days
      const result: DailyBookings[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        const { count, error } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('slot(slot_date)', formattedDate);
          
        if (error) {
          console.error('Error fetching daily bookings:', error);
          continue;
        }
        
        result.push({
          date: format(date, 'MMM dd'),
          count: count || 0,
        });
      }
      
      return result;
    },
  });
  
  // Fetch bookings for selected date
  const { data: dateBookings, isLoading: isLoadingDateBookings } = useQuery({
    queryKey: ['dateBookings', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user: user_id (email),
          workspace: workspace_id (name),
          slot: slot_id (slot_date, slot_time)
        `)
        .eq('slot(slot_date)', formattedDate);
        
      if (error) throw error;
      
      return data;
    },
    enabled: !!selectedDate,
  });
  
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor booking activity and workspace utilization.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{bookingStats?.total || 0}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Check-Ins
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{bookingStats?.checkedIn || 0}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{bookingStats?.completed || 0}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                No Shows
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{bookingStats?.noShow || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Daily Bookings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Activity</CardTitle>
                <CardDescription>
                  Last 7 days of booking activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDailyBookings ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : dailyBookings && dailyBookings.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyBookings}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Bookings" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No booking data available.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Workspace Utilization</CardTitle>
                <CardDescription>
                  Booking count by workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingWorkspaceStats ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : workspaceStats && workspaceStats.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={workspaceStats.map(ws => ({
                          name: ws.name,
                          bookings: ws.totalBookings,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="bookings" name="Bookings" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No workspace data available.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="daily" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                  <CardDescription>
                    View bookings for a specific date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    Bookings for {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Selected Date'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-auto">
                  {isLoadingDateBookings ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : dateBookings && dateBookings.length > 0 ? (
                    <div className="space-y-4">
                      {dateBookings.map((booking: any) => (
                        <div 
                          key={booking.id} 
                          className="rounded-lg border p-4"
                        >
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{booking.workspace.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {booking.slot.slot_time}
                              </div>
                            </div>
                            <div className="text-sm">
                              User: {booking.user?.email || 'Unknown'}
                            </div>
                            <div className="text-sm">
                              Status: {booking.status}
                            </div>
                            {booking.check_in_time && (
                              <div className="text-sm">
                                Check-in: {new Date(booking.check_in_time).toLocaleTimeString()}
                              </div>
                            )}
                            {booking.check_out_time && (
                              <div className="text-sm">
                                Check-out: {new Date(booking.check_out_time).toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        No bookings found for this date.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
