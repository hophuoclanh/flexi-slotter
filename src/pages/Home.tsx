// Home.tsx
import {
  PublicBookingPage,
  Booking,
} from ".";

const Home = () => {
  return (
    <div className="relative z-0 bg-primary">
      <PublicBookingPage/>
      <Booking/>
    </div>
  );
};

export default Home;
