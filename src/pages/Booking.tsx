import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Building2, Calendar, Clock, Loader2 } from "lucide-react";

// UI components (adjust paths as needed)
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InteractiveSlotSelector from "@/components/InteractiveSlotSelector";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type PublicBookingFormValues = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
};

const steps = ["Select Date", "Meeting Duration", "Confirm Meeting"];

const Booking = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Track which step we’re on
  const [currentStep, setCurrentStep] = useState(0);

  // Data needed across steps
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");

  // Simulated loading/booking states
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);
  const [workspace, setWorkspace] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PublicBookingFormValues>();

  // Called only on final step submission
  const onSubmit = (data: PublicBookingFormValues) => {
    setIsBooking(true);
    // Simulate an API booking call
    setTimeout(() => {
      setIsBooking(false);
      console.log("Booking data:", {
        ...data,
        selectedDate,
        selectedStartTime,
        selectedEndTime,
      });
      toast({
        title: "Booking Confirmed",
        description: "Your workspace has been booked successfully.",
      });
      navigate("/booking-confirmation");
    }, 2000);
  };

  // Fetch workspace data (simulate)
  useEffect(() => {
    if (workspaceId) {
      setIsLoadingWorkspace(true);
      // Simulate an API call delay
      setTimeout(() => {
        setWorkspace({ name: "Awesome Workspace", capacity: 20 });
        setIsLoadingWorkspace(false);
      }, 1000);
    }
  }, [workspaceId]);

  // Go to next or previous steps
  const goToNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Step indicator at the top (optional)
  const StepIndicator = () => (
    <div className="flex justify-center items-center gap-4 py-4">
      {steps.map((label, index) => {
        const isActive = index === currentStep;
        return (
          <div
            key={index}
            className={`flex items-center gap-2 ${
              isActive ? "font-bold text-primary" : "opacity-70"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                isActive ? "border-primary" : "border-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );

  // Render content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            {/* ----- STEP 1: Show Workspace & Date Selector ----- */}
            {isLoadingWorkspace ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : workspace ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <span>{workspace.name}</span>
                  </CardTitle>
                  <CardDescription>
                    Capacity: {workspace.capacity}
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : null}

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
                    onSelect={(date) => {
                      setSelectedDate(date || null);
                      // Reset times if user changes date
                      setSelectedStartTime("");
                      setSelectedEndTime("");
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    className="rounded-md border"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        );
      case 1:
        return (
          <>
            {/* ----- STEP 2: Slot Selection ----- */}
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
                  <p className="text-sm text-muted-foreground">
                    Please select a date first.
                  </p>
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
          </>
        );
      case 2:
        return (
          <>
            {/* ----- STEP 3: Guest Form + Final Submission ----- */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Guest Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">
                      Full Name
                    </label>
                    <Input
                      {...register("guestName", { required: true })}
                      placeholder="Your full name"
                    />
                    {errors.guestName && (
                      <p className="text-sm text-destructive">
                        Full name is required.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <Input
                      {...register("guestEmail", { required: true })}
                      placeholder="yourname@example.com"
                      type="email"
                    />
                    {errors.guestEmail && (
                      <p className="text-sm text-destructive">
                        Email is required.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">
                      Phone
                    </label>
                    <Input
                      {...register("guestPhone", { required: true })}
                      placeholder="Your phone number"
                    />
                    {errors.guestPhone && (
                      <p className="text-sm text-destructive">
                        Phone number is required.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={
                  isBooking || !selectedStartTime || !selectedEndTime
                }
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
            </form>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* STEP INDICATOR */}
      <StepIndicator />

      <div className="space-y-8 booking-page-bg px-6">
        {/* Render the step-specific content */}
        {renderStepContent()}

        {/* NAVIGATION BUTTONS AT BOTTOM (except final submission) */}
        <div className="flex justify-between pt-4">
          {/* Hide "Back" if on first step */}
          {currentStep > 0 && (
            <Button variant="outline" onClick={goToPreviousStep}>
              Previous
            </Button>
          )}

          {/* Hide "Next" if on last step (since that step has the final submission button) */}
          {currentStep < steps.length - 1 && (
            <Button
              onClick={() => {
                // For minimal validation, ensure date or slot is selected before next step:
                if (currentStep === 0 && !selectedDate) {
                  toast({
                    title: "Select a date",
                    description: "Please select a date before proceeding.",
                  });
                  return;
                }

                if (currentStep === 1 && (!selectedStartTime || !selectedEndTime)) {
                  toast({
                    title: "Select a slot",
                    description: "Please select a start and end time.",
                  });
                  return;
                }

                // Everything is okay, go to next step
                goToNextStep();
              }}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
