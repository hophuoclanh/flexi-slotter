import { useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase, Booking } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type UserBooking = Booking & {
  workspace: {
    id: number;
    name: string;
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's upcoming bookings.
  const { data: userBookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["userBookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select(`*, workspace: workspace_id (id, name)`)
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .order("start_time", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data as UserBooking[];
    },
    enabled: !!user,
  });

  const handleCheckIn = async (bookingId: number) => {
    try {
      const now = new Date();
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "checked_in",
          check_in_time: now.toISOString(),
        })
        .eq("id", bookingId);
      if (error) throw error;
      toast({
        title: "Checked in successfully!",
        description: `You checked in at ${format(now, "h:mm a")}`,
      });
      // Optionally, refresh the bookings query here.
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
        .from("bookings")
        .update({
          status: "completed",
          check_out_time: now.toISOString(),
        })
        .eq("id", bookingId);
      if (error) throw error;
      toast({
        title: "Checked out successfully!",
        description: `You checked out at ${format(now, "h:mm a")}`,
      });
      // Optionally, refresh the bookings query here.
    } catch (error: any) {
      toast({
        title: "Check-out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Format the booking date/time.
  const formatBookingDate = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, "MMM dd, yyyy")} at ${format(
      startDate,
      "HH:mm"
    )} - ${format(endDate, "HH:mm")}`;
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to FlexiSpace
          </h1>
          <p className="text-muted-foreground mt-2">
            Find and book your ideal workspace for productivity.
          </p>
        </div>

        {/* Upcoming Bookings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Your Upcoming Bookings
          </h2>
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
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "outline"
                            : booking.status === "checked_in"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {booking.status === "confirmed"
                          ? "Upcoming"
                          : booking.status === "checked_in"
                          ? "Checked In"
                          : "Completed"}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {formatBookingDate(
                            booking.start_time,
                            booking.end_time
                          )}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    {booking.status === "confirmed" && (
                      <Button
                        className="w-full"
                        onClick={() => handleCheckIn(booking.id)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Check In
                      </Button>
                    )}
                    {booking.status === "checked_in" && (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleCheckOut(booking.id)}
                      >
                        Check Out
                      </Button>
                    )}
                    {booking.status === "completed" && (
                      <div className="flex w-full items-center justify-center text-sm text-muted-foreground">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Completed
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
                You don't have any upcoming bookings. Please book a workspace.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
