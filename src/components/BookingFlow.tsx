import React, { useState } from "react";
import Stepper from "./Stepper";
import DateTimePicker from "@/components/BookingDateTimePicker";
import GuestForm from "@/components/GuestForm";
import ConfirmReview from "@/components/ConfirmReview";
import { Button } from "@/components/ui/button";
import { styles } from "../styles";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

const steps = ["Choose Date & Time", "Your Info", "Review & Book"];

export default function BookingFlow({ workspace }: { workspace: any }) {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  const workspaceOptions = [
    { label: "Single Pod", path: "/single-pod-slots" },
    { label: "Double Pod", path: "/double-pod-slots" },
    { label: "Meeting Room 6", path: "/meeting-6-slots" },
    { label: "Meeting Room 10", path: "/meeting-10-slots" },
  ];

  // Booking state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const pricePerHour = workspace?.price ?? 0;
  const totalPrice = selectedDuration ? pricePerHour * selectedDuration : null;

  const getTimeSlotDate = (date: Date, timeString: string): Date => {
    const [time, meridiem] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    const slot = new Date(date);
    slot.setHours(hours, minutes, 0, 0);
    return slot;
  };

  const computedEndTime = (() => {
    if (!selectedDate || !selectedStartTime || !selectedDuration) return null;
    const startDateTime = getTimeSlotDate(selectedDate, selectedStartTime);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(startDateTime.getHours() + selectedDuration);
    return format(endDateTime, "hh:mm a");
  })();

  const canNext = () => {
    switch (currentStep) {
      case 1:
        return !!(selectedDate && selectedStartTime && selectedDuration);
      case 2:
        return guestName.trim() !== "" && guestPhone.trim() !== "";
      default:
        return true;
    }
  };

  const goNext = () => {
    if (canNext() && currentStep < steps.length) {
      setCurrentStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const user = supabase.auth.getUser(); // or getSession().user.id
      const userId = user?.id || null;
  
      // Convert selectedDate and selectedStartTime into full datetime
      const startDateTime = getTimeSlotDate(selectedDate, selectedStartTime);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + selectedDuration);
  
      let guestId = null;
  
      // If user is not logged in, create/find guest
      if (!userId) {
        const { data: existingGuest } = await supabase
          .from("guests")
          .select("id")
          .eq("phone_number", guestPhone)
          .maybeSingle();
  
        if (existingGuest) {
          guestId = existingGuest.id;
        } else {
          const { data: newGuest, error: guestError } = await supabase
            .from("guests")
            .insert({
              full_name: guestName,
              phone_number: guestPhone,
            })
            .select()
            .single();
  
          if (guestError) throw guestError;
          guestId = newGuest.id;
        }
      }
  
      // Insert booking
      const { error: bookingError } = await supabase.from("bookings").insert([
        {
          user_id: userId,
          guest_id: guestId,
          workspace_id: workspace.id,
          status: "confirmed",
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          price: totalPrice,
        },
      ]);
  
      if (bookingError) throw bookingError;
  
      alert("🎉 Booking successful!");
      // Optionally: navigate to success page
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-[1000px] space-y-10 items-center text-center">
      <Stepper steps={steps} currentStep={currentStep} />

      <div className="grid grid-cols-4 gap-6 w-[830px] text-[#d4a373]">
        {workspaceOptions.map((option) => {
          const isActive = location.pathname === option.path;
          return (
            <Button
              key={option.path}
              variant="outline"
              className={`w-full text-sm px-4 py-2 transition-all duration-200 ${
                isActive
                  ? "bg-[#f6ebd3]/60 text-black font-semibold border border-[#541919]"
                  : "hover:bg-[#f6ebd3]/60 hover:text-black"
              }`}
              onClick={() => navigate(option.path)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      <div className="space-y-6">
        {currentStep === 1 && (
          <>
            <DateTimePicker
              mode="full"
              selectedDate={selectedDate}
              selectedStartTime={selectedStartTime}
              selectedDuration={selectedDuration}
              onDateChange={setSelectedDate}
              onTimeChange={(start, duration) => {
                setSelectedStartTime(start);
                setSelectedDuration(duration);
              }}
              workspaceId={workspace.id}
              workspaceQuantity={workspace.quantity}
              pricePerHour={workspace.price}
            />
          </>
        )}

        {currentStep === 2 && (
          <GuestForm
            name={guestName}
            phone={guestPhone}
            onNameChange={setGuestName}
            onPhoneChange={setGuestPhone}
          />
        )}

        {currentStep === 3 && (
          <ConfirmReview
            date={selectedDate}
            startTime={selectedStartTime}
            endTime={computedEndTime}
            name={guestName}
            phone={guestPhone}
            workspace={workspace?.name}
            pricePerHour={pricePerHour}
            totalPrice={totalPrice}
          />
        )}
      </div>

      <div className="flex justify-between w-full max-w-lg mt-4">
        <Button
          className={`${styles.sectionSubText}`}
          type="button"
          onClick={goBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>

        {currentStep < steps.length ? (
          <Button
            className={`${styles.sectionSubText} text-black`}
            type="button"
            onClick={goNext}
            disabled={!canNext()}
            variant="outline"
          >
            Next
          </Button>
        ) : (
          <Button
            className={`${styles.sectionSubText} text-[#541919] font-bold`}
            type="button"
            onClick={handleSubmit}
            variant="outline"
          >
            Book Now
          </Button>
        )}
      </div>
    </div>
  );
}
