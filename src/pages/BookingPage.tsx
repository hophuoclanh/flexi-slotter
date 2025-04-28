import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Building2, Calendar, Clock, Info, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase, Workspace } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import InteractiveSlotSelector from '@/components/InteractiveSlotSelector';

const BookingPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // State for slot selection from InteractiveSlotSelector
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  // Selected date from calendar
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isBooking, setIsBooking] = useState(false);

  // For workspace selection (when no workspaceId is provided)
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*');
      if (error) throw error;
      return data as Workspace[];
    },
    enabled: !workspaceId,
  });

  // For a single workspace when workspaceId is provided
  const { data: workspace, isLoading: isLoadingWorkspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();
      if (error) throw error;
      return data as Workspace;
    },
    enabled: !!workspaceId,
  });

  const handleSelectWorkspace = (id: number) => {
    navigate(`/booking/${id}`);
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date || null);
    // Reset the slot selection when the date changes
    setSelectedStartTime('');
    setSelectedEndTime('');
  };

  const handleBook = async () => {
    if (!selectedDate || !workspaceId || !user || !selectedStartTime || !selectedEndTime) return;
    setIsBooking(true);
  
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      // Build local time strings directly from the interactive slot selection
      const localStartTime = `${dateStr}T${selectedStartTime}`;
      const localEndTime = `${dateStr}T${selectedEndTime}`;
  
      // Check for overlapping bookings using the local time strings
      const { count: conflictCount, error: conflictError } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", Number(workspaceId))
        .in("status", ["confirmed", "checked_in"])
        .lt("start_time", localEndTime)
        .gt("end_time", localStartTime);
  
      if (conflictError) throw conflictError;
      if (conflictCount !== null && workspace && conflictCount >= workspace.quantity) {
        toast({
          title: "Booking Conflict",
          description: "The facility is fully booked during the selected time.",
          variant: "destructive",
        });
        return;
      }
      
      // Insert the booking using the local time strings from the interactive slot selector
      const { error: insertError } = await supabase.from("bookings").insert([
        {
          user_id: user.id,
          workspace_id: Number(workspaceId),
          start_time: localStartTime,
          end_time: localEndTime,
          status: "confirmed",
          no_show: false,
        },
      ]);
  
      if (insertError) throw insertError;
  
      toast({
        title: "Booking Successful",
        description: `You booked ${workspace?.name} from ${selectedStartTime} to ${selectedEndTime} on ${dateStr}.`,
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book a Workspace</h1>
          <p className="text-muted-foreground mt-2">
            Select a date and choose your desired time slot.
          </p>
        </div>

        {/* If no workspace is selected, show the workspace list */}
        {!workspaceId && !isLoadingWorkspaces && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Select a Workspace</h2>
            {workspaces && workspaces.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {workspaces.map((ws) => (
                  <Card key={ws.id} className="overflow-hidden">
                    <div className="aspect-video w-full bg-muted">
                      <div className="flex h-full w-full items-center justify-center bg-secondary/60">
                        <Building2 className="h-12 w-12 text-secondary-foreground/60" />
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle>{ws.name}</CardTitle>
                    </CardHeader>
                    <CardFooter>
                      <Button className="w-full" onClick={() => handleSelectWorkspace(ws.id)}>
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

        {/* When a workspace is selected (or loading), display its details and the booking form */}
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
                  </CardHeader>
                </Card>

                <Card>
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
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        className="rounded-md border"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>Select Slot</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDate ? (
                      <InteractiveSlotSelector
                        selectedDate={selectedDate}
                        onSelectionChange={(start, end) => {
                          setSelectedStartTime(start);
                          setSelectedEndTime(end);
                        }}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">Please select a date first.</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    {selectedStartTime && selectedEndTime ? (
                      <div className="text-sm text-muted-foreground">
                        Booking from {selectedStartTime} to {selectedEndTime}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No slot selected.
                      </div>
                    )}
                  </CardFooter>
                </Card>

                <Card>
                  <CardFooter>
                    <Button onClick={handleBook} disabled={isBooking || !selectedStartTime || !selectedEndTime}>
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
              </div>
            ) : (
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Workspace not found.{" "}
                  <Button variant="link" onClick={() => navigate("/booking")}>
                    Go back
                  </Button>
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
