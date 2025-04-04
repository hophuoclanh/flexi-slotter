// BookingSuccess.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve booking data from navigation state (sent from PublicBookingPage)
  const bookingData = location.state as {
    guestEmail: string;
    startTime: string;
    endTime: string;
    dateStr: string;
  };

  return (
    <Layout hideSidebar>
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
        <p>
          Your booking has been successfully made for{" "}
          <strong>{bookingData?.dateStr}</strong> from{" "}
          <strong>{bookingData?.startTime}</strong> to{" "}
          <strong>{bookingData?.endTime}</strong>.
        </p>
        <p>
          We have sent a confirmation email to{" "}
          <strong>{bookingData?.guestEmail}</strong>.
        </p>
        <Button onClick={() => navigate("/")}>Return Home</Button>
      </div>
    </Layout>
  );
};

export default BookingSuccess;
