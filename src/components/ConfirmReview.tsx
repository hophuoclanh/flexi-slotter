// components/ConfirmReview.jsx
import React from "react";
import { format } from "date-fns";
import { styles } from "../styles"; // adjust the path

export default function ConfirmReview({ date, startTime, endTime, name, phone, workspace, pricePerHour, totalPrice}) {
  // Format the date nicely, e.g. “Wednesday, 23 April 2025”
  const formattedDate = date ? format(date, "EEEE, d MMMM yyyy") : "";

  return (
    <div className={`${styles.sectionSubText} shadow rounded-lg p-6 w-full max-w-md mx-auto`}>
      <h3 className="text-4xl font-semibold text-[#f6ebd3] m-4">
        Review Your Booking
      </h3>
      <div
        className="w-full rounded-lg p-4 space-y-3 text-left text-[#541919]"
        style={{ backgroundColor: "#f6ebd3" }}
      >
        <div>
          <span className="font-medium">Workspace:</span>{" "}
          <span>{workspace}</span>
        </div>
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
          <span className="font-medium">Price:</span>{" "}
          <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
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
      <p className="mt-4 font-bold ">
        If everything looks right, click <strong className="text-[#d4a373]">Book Now</strong> to confirm.
      </p>
    </div>
  );
}
