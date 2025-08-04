import React, { useState, useEffect } from "react";
import { format, addDays, startOfWeek, addWeeks, startOfDay, addMinutes } from "date-fns";
import { supabase } from "@/lib/supabase"; // Adjust the import based on your project structure
import { styles } from "../styles";
import { TIME_SLOTS } from "@/lib/timeSlots";

// Combine a date with a time string into a Date object.
const getTimeSlotDate = (date: Date, timeString: string): Date => {
  const [time, meridiem] = timeString.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  const slot = new Date(date);
  slot.setHours(hours, minutes, 0, 0);
  return slot;
};

const toVietnamTime = (utcDateString: string): Date => {
  const date = new Date(utcDateString);
  date.setHours(date.getHours() + 7);
  return date;
};

interface DateTimePickerProps {
  mode: "full";
  selectedDate: Date | null;
  selectedStartTime: string | null;
  selectedDuration: number | null;
  onDateChange: (date: Date) => void;
  onTimeChange: (start: string | null, duration: number | null) => void;
  workspaceId: number;
  workspaceQuantity: number;
  pricePerHour: number;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  selectedStartTime,
  selectedDuration,
  onDateChange,
  onTimeChange,
  workspaceId,
  workspaceQuantity,
  pricePerHour
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);

  const days = Array.from({ length: 7 }).map((_, i) =>
    addDays(currentWeekStart, i)
  );

  const timeSlots = TIME_SLOTS;

  const handlePrevWeek = () => setCurrentWeekStart((w) => addWeeks(w, -1));
  const handleNextWeek = () => setCurrentWeekStart((w) => addWeeks(w, 1));

  const handleDateClick = (day: Date) => {
    onDateChange(day);
    onTimeChange(null, null);
  };

  const handleTimeClick = (time: string) => {
    const startDateTime = getTimeSlotDate(selectedDate!, time);
    const minutesNeeded = 60; // 1 hour = 60 minutes
    let valid = true;
  
    for (let m = 0; m < minutesNeeded; m += 15) {
      const slotLabel = format(addMinutes(startDateTime, m), "hh:mm a");
      if (unavailableSlots.includes(slotLabel)) {
        valid = false;
        break;
      }
    }
  
    if (valid) {
      onTimeChange(time, 1); // default duration = 1 hr
    } else {
      alert("Please select a time with at least 1-hour availability.");
      onTimeChange(null, null);
    }
  };  

  const fullFormat = "EEEE, d MMMM yyyy";

  const durationFits = (startDate: Date, durationHours: number) => {
    const minutesNeeded = durationHours * 60;
    for (let m = 0; m < minutesNeeded; m += 15) {
      const sliceLabel = format(addMinutes(startDate, m), "hh:mm a");
      if (unavailableSlots.includes(sliceLabel)) return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchBooked = async () => {
      if (!selectedDate) return setUnavailableSlots([]);

      const startStr = format(selectedDate, "yyyy-MM-dd") + "T00:00:00";
      const endStr = format(selectedDate, "yyyy-MM-dd") + "T23:59:59";

      // console.time('Fetch bookings');
      const { data, error } = await supabase
        .from("bookings")
        .select("start_time,end_time", { count: "exact" })
        .eq("workspace_id", workspaceId)
        .in("status", ["confirmed", "checked_in"]) // ignore cancelled
        .gte("start_time", startStr)
        .lte("end_time", endStr);
      
      // console.timeEnd('Fetch bookings');

      if (error) {
        console.error("Could not fetch bookings", error);
        return;
      }

      // count how many rooms are used per slice
      const sliceCounts: Record<string, number> = {};
      timeSlots.forEach((slice) => (sliceCounts[slice] = 0));

      data!.forEach(({ start_time, end_time }) => {
        const bStart = toVietnamTime(start_time);
        const bEnd = toVietnamTime(end_time);
      
        timeSlots.forEach((slice) => {
          const sliceStart = getTimeSlotDate(selectedDate, slice);
          const sliceEnd = addMinutes(sliceStart, 15);
          const overlaps = bStart < sliceEnd && bEnd > sliceStart;
          if (overlaps) sliceCounts[slice] += 1;
        });
      });      

      const fullSlices = Object.keys(sliceCounts).filter(
        (k) => sliceCounts[k] >= workspaceQuantity
      );
      setUnavailableSlots(fullSlices);
    };

    fetchBooked();
  }, [selectedDate, workspaceId, workspaceQuantity, timeSlots]);

  return (
    <div className="max-w-[1000px] w-full mx-auto p-4 border border-[#ccc] rounded-[20px] text-center font-[Poppins]">
      {/* Week navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevWeek}>&laquo;</button>
        <div className="font-bold">
          {format(currentWeekStart, "dd MMM yyyy")} -{" "}
          {format(addDays(currentWeekStart, 6), "dd MMM yyyy")}
        </div>
        <button onClick={handleNextWeek}>&raquo;</button>
      </div>

      {/* Day picker row */}
      <div className="flex justify-center mb-8 text-[9px] xl:text-[15px] xl:gap-10">
        {days.map((day) => {
          const isPast = startOfDay(day) < startOfDay(new Date());
          const isSel =
            selectedDate &&
            format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          const isHover =
            hoveredDay?.toDateString() === day.toDateString();
          return (
            <div
              key={day.toString()}
              onClick={() => !isPast && handleDateClick(day)}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`text-center cursor-pointer p-2 rounded-md m-[2px] transition-all
                ${isPast ? "opacity-50 cursor-not-allowed" : "bg-[#f6ebd3] text-[#d4a373]"}
                ${isSel ? "bg-[#f6ebd399] text-black font-bold" : ""}
                ${isHover && !isPast ? "bg-[#f6ebd399] text-white" : ""}
              `}
            >
              <div>{format(day, "iii")}</div>
              <div>{format(day, "d MMM")}</div>
            </div>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <>
          <h3 className="mb-2">Select a time slot</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
            {timeSlots.map((time) => {
              console.log('Render slot', time);

              const slotDate = getTimeSlotDate(selectedDate, time);
              const now = new Date();
              const disabled = (() => {
                const slotDateTime = getTimeSlotDate(selectedDate, time);
                const now = new Date();
                if (slotDateTime < now) return true;
              
                // Check if 4 consecutive slots are available
                for (let m = 0; m < 60; m += 15) {
                  const slotLabel = format(addMinutes(slotDateTime, m), "hh:mm a");
                  if (unavailableSlots.includes(slotLabel)) {
                    return true;
                  }
                }
                return false;
              })();              
              const isSelected = time === selectedStartTime;

              return (
                <button
                  key={time}
                  onClick={() => !disabled && handleTimeClick(time)}
                  disabled={disabled}
                  className={`border rounded px-4 py-2 text-sm transition-all
                    ${isSelected ? "bg-[#d4a373] text-white border-[#d4a373]" : ""}
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {time}
                </button> 
              );
            })}
          </div>
        </>
      )}

      {/* Duration selection */}
      {selectedDate && selectedStartTime && (
        <div className="mt-4">
          <h3 className="mb-2">How long will you stay?</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
            {(() => {
              const startDateTime = getTimeSlotDate(selectedDate, selectedStartTime);
              const maxEndTime = new Date(selectedDate);
              maxEndTime.setHours(22, 0, 0, 0); // 10 PM closing

              const availableHours = Math.floor(
                (maxEndTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60)
              );

              return Array.from({ length: availableHours }, (_, i) => i + 1).map((hour) => {
                const minutesNeeded = hour * 60;
                let valid = true;
                for (let m = 0; m < minutesNeeded; m += 15) {
                  const slotLabel = format(addMinutes(startDateTime, m), "hh:mm a");
                  if (unavailableSlots.includes(slotLabel)) {
                    valid = false;
                    break;
                  }
                }

                if (!valid) return null;

                return (
                  <button
                    key={hour}
                    onClick={() => onTimeChange(selectedStartTime, hour)}
                    className={`border rounded px-4 py-2 text-sm transition-all
                      ${selectedDuration === hour ? "bg-[#d4a373] text-white border-[#d4a373]" : ""}
                    `}
                  >
                    {hour} hr{hour > 1 ? "s" : ""}
                  </button>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Display selected range */}
      {selectedDate && selectedStartTime && (
        <div className="mb-4">
          <strong>Selected:</strong>{" "}
          {format(selectedDate, fullFormat)}, Start: {selectedStartTime}
          {selectedDuration ? (
            <>
              {" "}– Duration: {selectedDuration} hr{selectedDuration > 1 ? "s" : ""}
              <br />
              <span>
              <strong>Total Price: </strong>{" "}
                <span className="text-white">
                  {(pricePerHour * selectedDuration).toLocaleString()} VND
                </span>
              </span>
            </>
          ) : (
            " (choose duration)"
          )}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
