// components/BookingFlow.jsx
import React, { useState } from "react";
import Stepper from "./Stepper";
import DateTimePicker from "@/components/BookingDateTimePicker";
import GuestForm from "@/components/GuestForm";
import ConfirmReview from "@/components/ConfirmReview";
import { Button } from "@/components/ui/button";
import { styles } from "../styles";

const steps = [
  "Choose Date & Time",
  "Your Info",
  "Review & Book",
];

export default function BookingFlow() {
  const [currentStep, setCurrentStep] = useState(1);

  // booking state
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // validation per step
  const canNext = () => {
    switch (currentStep) {
      case 1:
        // step1: require both date + time
        return !!(selectedDate && selectedStartTime && selectedEndTime);
      case 2:
        // step2: require name + phone
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

  const handleSubmit = () => {
    // your final booking logic
  };

  return (
    <div className=" max-w-3xl space-y-10 flex flex-col items-center text-center">
      <Stepper steps={steps} currentStep={currentStep} />

      <div className="space-y-6">
        {currentStep === 1 && (
          <DateTimePicker
            mode="full" 
            selectedDate={selectedDate}
            selectedStartTime={selectedStartTime}
            selectedEndTime={selectedEndTime}
            onDateChange={setSelectedDate}
            onTimeChange={(start, end) => {
              setSelectedStartTime(start);
              setSelectedEndTime(end);
            }}
          />
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
            endTime={selectedEndTime}
            name={guestName}
            phone={guestPhone}
          />
        )}
      </div>

      <div className="flex justify-between">
        <Button
          className={`${styles.sectionSubText}`}
          type="button"
          // variant="outline"
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
