
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Building2, 
  Calendar, 
  Clock, 
  Info, 
  Loader2 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase, Workspace, Slot } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type SlotWithWorkspace = Slot & {
  workspace: Workspace;
};

const BookingPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<SlotWithWorkspace | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  
  // Fetch workspaces if no workspaceId is provided
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      return data as Workspace[];
    },
    enabled: !workspaceId,
  });
  
  // Fetch single workspace if workspaceId is provided
  const { data: workspace, isLoading: isLoadingWorkspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();
        
      if (error) {
        throw error;
      }
      
      return data as Workspace;
    },
    enabled: !!workspaceId,
  });
  
  // Fetch available slots for selected date and workspace
  const { data: availableSlots, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['availableSlots', selectedDate, workspaceId],
    queryFn: async () => {
      if (!selectedDate) return [];
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      let query = supabase
        .from('slots')
        .select(`
          *,
          workspace: workspace_id (*)
        `)
        .eq('status', 'available')
        .eq('slot_date', formattedDate);
        
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      
      const { data, error } = await query;
        
      if (error) {
        throw error;
      }
      
      return data as SlotWithWorkspace[];
    },
    enabled: !!selectedDate,
  });
  
  const handleSelectWorkspace = (id: number) => {
    navigate(`/booking/${id}`);
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };
  
  const handleSelectSlot = (slot: SlotWithWorkspace) => {
    setSelectedSlot(slot);
  };
  
  const handleBookSlot = async () => {
    if (!selectedSlot || !user) return;
    
    setIsBooking(true);
    
    try {
      // Create booking
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            workspace_id: selectedSlot.workspace_id,
            slot_id: selectedSlot.id,
            status: 'confirmed',
            no_show: false,
          },
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      // Update slot status
      const { error: slotError } = await supabase
        .from('slots')
        .update({ status: 'booked' })
        .eq('id', selectedSlot.id);
        
      if (slotError) throw slotError;
      
      toast({
        title: "Booking successful!",
        description: `You have booked ${selectedSlot.workspace.name} on ${format(new Date(selectedSlot.slot_date), 'MMM dd, yyyy')} at ${selectedSlot.slot_time}`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };
  
  const groupSlotsByWorkspace = (slots: SlotWithWorkspace[]) => {
    return slots.reduce((acc, slot) => {
      const workspaceId = slot.workspace_id;
      if (!acc[workspaceId]) {
        acc[workspaceId] = {
          workspace: slot.workspace,
          slots: [],
        };
      }
      acc[workspaceId].slots.push(slot);
      return acc;
    }, {} as Record<number, { workspace: Workspace; slots: SlotWithWorkspace[] }>);
  };
  
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book a Workspace</h1>
          <p className="text-muted-foreground mt-2">
            Select a date, workspace, and time slot to make your reservation.
          </p>
        </div>
        
        {!workspaceId && !isLoadingWorkspaces && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Select a Workspace</h2>
            
            {workspaces && workspaces.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {workspaces.map((workspace) => (
                  <Card key={workspace.id} className="overflow-hidden">
                    <div className="aspect-video w-full bg-muted">
                      <div className="flex h-full w-full items-center justify-center bg-secondary/60">
                        <Building2 className="h-12 w-12 text-secondary-foreground/60" />
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle>{workspace.name}</CardTitle>
                      <CardDescription>Capacity: {workspace.capacity}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => handleSelectWorkspace(workspace.id)}
                      >
                        Select
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
        )}
        
        {(workspaceId || isLoadingWorkspace) && (
          <>
            {isLoadingWorkspace ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : workspace ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle>{workspace.name}</CardTitle>
                    </div>
                    <CardDescription>Capacity: {workspace.capacity}</CardDescription>
                  </CardHeader>
                </Card>
                
                <div className="flex flex-col gap-8 lg:flex-row">
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span>Select Date</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          className="rounded-md border"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <span>Available Time Slots</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingSlots ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : availableSlots && availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot.id}
                              variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                              className={cn(
                                "h-auto py-4",
                                selectedSlot?.id === slot.id && "ring-2 ring-primary"
                              )}
                              onClick={() => handleSelectSlot(slot)}
                            >
                              {slot.slot_time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            No available slots for the selected date.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {selectedSlot && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <span>{selectedSlot.workspace.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <span>{format(new Date(selectedSlot.slot_date), 'MMMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <span>{selectedSlot.slot_time}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={handleBookSlot}
                        disabled={isBooking}
                      >
                        {isBooking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          "Confirm Booking"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Workspace not found. <Button variant="link" onClick={() => navigate('/booking')}>Go back</Button>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default BookingPage;
