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
import BookingDateTimePicker from "@/components/BookingDateTimePicker";

type PublicBookingFormValues = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
};

const homePageImages = [
  "./single_pod/single_pod_1.jpg",
  "./single_pod/single_pod_2.jpg",
  "./single_pod/single_pod_3.jpg",
];

const SinglePodSlots = () => {
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
      <div className="flex flex-col md:flex-row justify-center gap-10 md:gap-10 px-32 py-10">
        <div className="w-full max-w-[575px]">
          <Slideshow images={homePageImages} interval={5000} />
          <p className={`${styles.sectionSubText} text-center mt-8`}>
            Single Pod: 45.000 VND / hour
          </p>
        </div>
        <div className={`${styles.sectionSubText} max-w-10xl mx-auto flex flex-col`}>
          <BookingDateTimePicker />
          {/* Add more fields here (e.g., guests, room type, etc.) */}
          <button 
            className={`${styles.sectionSubText} mt-6 px-4 py-2 bg-[#d4a373] text-white rounded flex items-center justify-center mx-auto`}
            style={{ width: "200px" }}
          >
            Book Now
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default SinglePodSlots;
