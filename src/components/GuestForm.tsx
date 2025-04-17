import React from "react";
import { Input } from "@/components/ui/input";
import { styles } from "../styles"; // adjust the path

export default function GuestForm({ name, phone, onNameChange, onPhoneChange }) {
  return (
    <div style={styles.guest_container} className="mt-8">
      <div className="flex flex-col gap-4">
        <label htmlFor="guestName" className="font-bold">
          Name
        </label>
        <Input
          id="guestName"
          type="text"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Enter your name"
          className="text-gray-900 text-lg font-medium"
        />
      </div>

      {/* Phone Field */}
      <div className="flex flex-col gap-4">
        <label htmlFor="guestPhone" className="font-bold">
          Phone Number
        </label>
        <Input
          id="guestPhone"
          type="tel"
          value={phone}
          onChange={e => onPhoneChange(e.target.value)}
          placeholder="Enter your phone number"
          className="text-gray-900 text-lg font-medium"
        />
      </div>
    </div>
  );
}
