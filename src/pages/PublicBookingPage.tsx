// PublicBookingPage.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase, Workspace } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { styles } from "../styles";
import Slideshow from "@/components/Slideshow";
import { navLinks } from "../constants";

type PublicBookingFormValues = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
};

const PublicBookingPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Slot/Date selections
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isBooking, setIsBooking] = useState(false);

  // Fetch workspace details
  const {
    data: workspace,
    isLoading: isLoadingWorkspace,
  } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();
      if (error) throw error;
      return data as Workspace;
    },
    enabled: !!workspaceId,
  });

  // Guest info form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PublicBookingFormValues>();

  // Booking submission
  const onSubmit = async (guestData: PublicBookingFormValues) => {
    if (!selectedDate || !workspaceId || !selectedStartTime || !selectedEndTime) {
      return;
    }
    setIsBooking(true);

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const localStartTime = `${dateStr}T${selectedStartTime}`;
      const localEndTime = `${dateStr}T${selectedEndTime}`;

      // Insert the booking with guest details. Note that user_id is null because
      // the guest isn't registered/authenticated.
      const { error: insertError } = await supabase.from("bookings").insert([
        {
          guest_name: guestData.guestName,
          guest_email: guestData.guestEmail,
          guest_phone: guestData.guestPhone,
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
        description: `You booked from ${selectedStartTime} to ${selectedEndTime} on ${dateStr}.`,
      });

      // Navigate to the "BookingSuccess" page, passing data via state
      navigate("/booking-success", {
        state: {
          guestEmail: guestData.guestEmail,
          startTime: selectedStartTime,
          endTime: selectedEndTime,
          dateStr,
        },
      });
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
    <Layout hideSidebar>
      <div className="flex flex-col md:flex-row justify-center gap-20 md:gap-20 px-12 py-24 ">
        <div className='flex flex-col items-center py-8'>
          <div className='w-5 h-5 rounded-full bg-[#d4a373]' />
          <div className='w-1 sm:h-80 h-40 violet-gradient' />
        </div>

        <div>
          <h1 className={`${styles.heroHeadText} text-white`}>
            Lets Find Your <br />
            Perfect <span className='text-[#d4a373]'>Place to Work</span>
          </h1>
          <p className={`${styles.heroSubText} mt-2 text-white-100`}>
            Book a space that fits your flow - from solo desks to team rooms.
          </p>

          <div className="mt-12 gap-4">
            <a
              href={`#${navLinks[0].id}`}  // This creates a link to "#booking"
              className="px-8 py-3 bg-[#d4a373] rounded-md text-xl font-bold hover:bg-[#c29365] transition-colors"
            >
              Book Your Spot
            </a>
          </div>
        </div>

        <div className="w-full max-w-[575px]">
          <Slideshow />
        </div>
      </div>
    </Layout>
    // <Layout hideSidebar>
    //   <div className="space-y-8 booking-page-bg">
    //     <div>
    //       <h1 className="text-3xl font-bold tracking-tight">Book a Workspace (Guest)</h1>
    //       <p className="text-muted-foreground mt-2">
    //         Enter your details and select a date and slot to book a workspace.
    //       </p>
    //     </div>

    //     {/* Workspace info or loading spinner */}
    //     {isLoadingWorkspace ? (
    //       <div className="flex items-center justify-center p-8">
    //         <Loader2 className="h-8 w-8 animate-spin text-primary" />
    //       </div>
    //     ) : workspace ? (
    //       <Card>
    //         <CardHeader>
    //           <CardTitle className="flex items-center gap-2">
    //             <Building2 className="h-5 w-5" />
    //             <span>{workspace.name}</span>
    //           </CardTitle>
    //           <CardDescription>Capacity: {workspace.capacity}</CardDescription>
    //         </CardHeader>
    //       </Card>
    //     ) : null}

    //     {/* Date selector */}
    //     <Card>
    //       <CardHeader>
    //         <CardTitle className="flex items-center gap-2">
    //           <Calendar className="h-5 w-5" />
    //           <span>Select Date</span>
    //         </CardTitle>
    //       </CardHeader>
    //       <CardContent>
    //         <div className="flex justify-center">
    //           <CalendarComponent
    //             mode="single"
    //             selected={selectedDate}
    //             onSelect={(date) => {
    //               setSelectedDate(date || null);
    //               // Reset times if the user changes the date
    //               setSelectedStartTime("");
    //               setSelectedEndTime("");
    //             }}
    //             disabled={(date) =>
    //               date < new Date(new Date().setHours(0, 0, 0, 0))
    //             }
    //             className="rounded-md border"
    //           />
    //         </div>
    //       </CardContent>
    //     </Card>

    //     {/* Slot Selector */}
    //     <Card>
    //       <CardHeader>
    //         <CardTitle className="flex items-center gap-2">
    //           <Clock className="h-5 w-5" />
    //           <span>Select Slot</span>
    //         </CardTitle>
    //       </CardHeader>
    //       <CardContent>
    //         {selectedDate ? (
    //           <InteractiveSlotSelector
    //             selectedDate={selectedDate}
    //             onSelectionChange={(start, end) => {
    //               setSelectedStartTime(start);
    //               setSelectedEndTime(end);
    //             }}
    //           />
    //         ) : (
    //           <p className="text-sm text-muted-foreground">
    //             Please select a date first.
    //           </p>
    //         )}
    //       </CardContent>
    //       <CardFooter>
    //         {selectedStartTime && selectedEndTime ? (
    //           <div className="text-sm text-muted-foreground">
    //             Booking from {selectedStartTime} to {selectedEndTime}
    //           </div>
    //         ) : (
    //           <div className="text-sm text-muted-foreground">No slot selected.</div>
    //         )}
    //       </CardFooter>
    //     </Card>

    //     {/* Guest Form */}
    //     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
    //       <Card>
    //         <CardHeader>
    //           <CardTitle>Guest Information</CardTitle>
    //         </CardHeader>
    //         <CardContent className="grid gap-4">
    //           <div>
    //             <label className="block text-sm font-medium text-muted-foreground">
    //               Full Name
    //             </label>
    //             <Input
    //               {...register("guestName", { required: true })}
    //               placeholder="Your full name"
    //             />
    //             {errors.guestName && (
    //               <p className="text-sm text-destructive">Full name is required.</p>
    //             )}
    //           </div>

    //           <div>
    //             <label className="block text-sm font-medium text-muted-foreground">
    //               Email
    //             </label>
    //             <Input
    //               {...register("guestEmail", { required: true })}
    //               placeholder="yourname@example.com"
    //               type="email"
    //             />
    //             {errors.guestEmail && (
    //               <p className="text-sm text-destructive">Email is required.</p>
    //             )}
    //           </div>

    //           <div>
    //             <label className="block text-sm font-medium text-muted-foreground">
    //               Phone
    //             </label>
    //             <Input
    //               {...register("guestPhone", { required: true })}
    //               placeholder="Your phone number"
    //             />
    //             {errors.guestPhone && (
    //               <p className="text-sm text-destructive">
    //                 Phone number is required.
    //               </p>
    //             )}
    //           </div>
    //         </CardContent>
    //       </Card>

    //       {/* Confirm Button */}
    //       <Button
    //         type="submit"
    //         disabled={isBooking || !selectedStartTime || !selectedEndTime}
    //       >
    //         {isBooking ? (
    //           <>
    //             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    //             Booking...
    //           </>
    //         ) : (
    //           "Confirm Booking"
    //         )}
    //       </Button>
    //     </form>
    //   </div>
    // </Layout>
  );
};

export default PublicBookingPage;
