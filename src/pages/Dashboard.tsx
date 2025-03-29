
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Info, 
  Loader2, 
  Users
} from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase, Workspace, Booking } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type WorkspaceWithAvailability = Workspace & {
  availableSlots: number;
};

type UserBooking = Booking & {
  workspace: Workspace;
  slot: {
    slot_date: string;
    slot_time: string;
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch workspaces
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      // Get availability for each workspace
      const workspacesWithAvailability: WorkspaceWithAvailability[] = [];
      for (const workspace of data) {
        const today = new Date();
        const formattedDate = format(today, 'yyyy-MM-dd');
        
        const { count, error: countError } = await supabase
          .from('slots')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .eq('status', 'available')
          .gte('slot_date', formattedDate);
          
        if (countError) {
          console.error('Error fetching slot count:', countError);
        }
        
        workspacesWithAvailability.push({
          ...workspace,
          availableSlots: count || 0,
        });
      }
      
      return workspacesWithAvailability;
    },
  });
  
  // Fetch user's upcoming bookings
  const { data: userBookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['userBookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          workspace: workspace_id (id, name),
          slot: slot_id (slot_date, slot_time)
        `)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .order('slot(slot_date)', { ascending: true })
        .limit(5);
        
      if (error) {
        throw error;
      }
      
      return data as UserBooking[];
    },
    enabled: !!user,
  });
  
  const handleBookWorkspace = (workspaceId: number) => {
    navigate(`/booking/${workspaceId}`);
  };
  
  const handleCheckIn = async (bookingId: number) => {
    try {
      const now = new Date();
      
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'checked_in',
          check_in_time: now.toISOString(),
        })
        .eq('id', bookingId);
        
      if (error) throw error;
      
      toast({
        title: "Checked in successfully!",
        description: `You checked in at ${format(now, 'h:mm a')}`,
      });
      
      // Refresh the bookings
      // queryClient.invalidateQueries(['userBookings', user?.id]);
    } catch (error: any) {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleCheckOut = async (bookingId: number) => {
    try {
      const now = new Date();
      
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          check_out_time: now.toISOString(),
        })
        .eq('id', bookingId);
        
      if (error) throw error;
      
      toast({
        title: "Checked out successfully!",
        description: `You checked out at ${format(now, 'h:mm a')}`,
      });
      
      // Refresh the bookings
      // queryClient.invalidateQueries(['userBookings', user?.id]);
    } catch (error: any) {
      toast({
        title: "Check-out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const formatBookingDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    return `${format(date, 'MMM dd, yyyy')} at ${timeStr}`;
  };
  
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to FlexiSpace</h1>
          <p className="text-muted-foreground mt-2">
            Find and book your ideal workspace for productivity.
          </p>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Your Upcoming Bookings</h2>
          
          {isLoadingBookings ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : userBookings && userBookings.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <CardTitle>{booking.workspace.name}</CardTitle>
                      </div>
                      <Badge variant={booking.status === 'confirmed' ? 'outline' : booking.status === 'checked_in' ? 'default' : 'secondary'}>
                        {booking.status === 'confirmed' 
                          ? 'Upcoming' 
                          : booking.status === 'checked_in' 
                          ? 'Checked In' 
                          : 'Completed'}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatBookingDate(booking.slot.slot_date, booking.slot.slot_time)}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    {booking.status === 'confirmed' && (
                      <Button 
                        className="w-full" 
                        onClick={() => handleCheckIn(booking.id)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Check In
                      </Button>
                    )}
                    {booking.status === 'checked_in' && (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleCheckOut(booking.id)}
                      >
                        Check Out
                      </Button>
                    )}
                    {booking.status === 'completed' && (
                      <div className="flex w-full items-center justify-center text-sm text-muted-foreground">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Completed
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You don't have any upcoming bookings. Browse available spaces below to make a reservation.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Available Workspaces</h2>
          
          {isLoadingWorkspaces ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : workspaces && workspaces.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((workspace) => (
                <Card key={workspace.id} className="overflow-hidden">
                  <div className="aspect-video w-full bg-muted">
                    {/* Placeholder for workspace image */}
                    <div className="flex h-full w-full items-center justify-center bg-secondary/60">
                      <Building2 className="h-12 w-12 text-secondary-foreground/60" />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{workspace.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>Capacity: {workspace.capacity}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Badge variant={workspace.availableSlots > 0 ? "default" : "outline"}>
                        {workspace.availableSlots > 0 
                          ? `${workspace.availableSlots} slots available` 
                          : "Currently full"}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => handleBookWorkspace(workspace.id)}
                      disabled={workspace.availableSlots === 0}
                    >
                      <Calendar className="mr-2 h-4 w-4" /> Book Workspace
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No workspaces available. Please check back later.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
