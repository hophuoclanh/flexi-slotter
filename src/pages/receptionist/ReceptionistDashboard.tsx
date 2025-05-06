
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
import { BookingTable } from "@/components/BookingTable";

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

const ReceptionistDashboard = () => {
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
          <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f5]">Receptionist Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-[#f5f5f5]">
            Monitor booking activity and workspace utilization.
          </p>
        </div>
        <BookingTable />
      </div>
    </Layout>
  );
};

export default ReceptionistDashboard;
