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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase, Workspace } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const BookingPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

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

  // Booking form state
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isBooking, setIsBooking] = useState(false);

  const handleSelectWorkspace = (id: number) => {
    navigate(`/booking/${id}`);
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date || null);
  };

  const handleBook = async () => {
    if (!selectedDate || !workspaceId || !user) return;
    setIsBooking(true);
  
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      // Build local time strings directly from user inputs
      const localStartTime = `${dateStr}T${startTime}`;
      const localEndTime = `${dateStr}T${endTime}`;
  
      // Check for overlapping bookings using the local time strings
      const { data: conflicts, error: conflictError } = await supabase
        .from("bookings")
        .select("*")
        .eq("workspace_id", Number(workspaceId))
        .in("status", ["confirmed", "checked_in"])
        // Existing booking's start_time is before new booking's end_time
        .lt("start_time", localEndTime)
        // Existing booking's end_time is after new booking's start_time
        .gt("end_time", localStartTime);
  
      if (conflictError) throw conflictError;
      if (conflicts && conflicts.length > 0) {
        toast({
          title: "Booking Conflict",
          description: "The selected time is already booked.",
          variant: "destructive",
        });
        return;
      }
  
      // Insert the booking using local time strings directly
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
        description: `You booked ${workspace?.name} from ${startTime} to ${endTime} on ${dateStr}.`,
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
            Select a date and specify your desired start and end times.
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
                      <CardDescription>Capacity: {ws.capacity}</CardDescription>
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
                    <CardDescription>Capacity: {workspace.capacity}</CardDescription>
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
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        className="rounded-md border"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>Enter Desired Times</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div>
                      <label className="block mb-1">Start Time:</label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block mb-1">End Time:</label>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleBook} disabled={isBooking}>
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
