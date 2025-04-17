// components/ConfirmReview.jsx
import React from "react";
import { format } from "date-fns";
import { styles } from "../styles"; // adjust the path

export default function ConfirmReview({ date, startTime, endTime, name, phone }) {
  // Format the date nicely, e.g. “Wednesday, 23 April 2025”
  const formattedDate = date ? format(date, "EEEE, d MMMM yyyy") : "";

  return (
    <div style={styles.confirm_container} className={`${styles.sectionSubText}shadow rounded-lg p-6 w-full max-w-md mx-auto`}>
      <div
  className="w-full rounded-t-lg p-4"
  style={{ backgroundColor: "#f6ebd3" }}
>
  <h3 className="text-2xl font-semibold text-[#541919] m-0">
    Review Your Booking
  </h3>
</div>
      <div className="space-y-3 text-left">
        <div>
          <span className="font-medium">Date:</span>{" "}
          <span>{formattedDate}</span>
        </div>
        <div>
          <span className="font-medium">Time:</span>{" "}
          <span>
            {startTime} &ndash; {endTime}
          </span>
        </div>
        <div>
          <span className="font-medium">Name:</span>{" "}
          <span>{name}</span>
        </div>
        <div>
          <span className="font-medium">Phone:</span>{" "}
          <span>{phone}</span>
        </div>
      </div>
      <p className="mt-4 font-bold">
        If everything looks right, click <strong className="text-[#d4a373]">Book Now</strong> to confirm.
      </p>
    </div>
  );
}
