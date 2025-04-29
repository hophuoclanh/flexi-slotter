import React, { useState, useEffect } from "react";
import { format, addDays, startOfWeek, addWeeks, startOfDay, addMinutes } from "date-fns";
import { supabase } from "@/lib/supabase"; // Adjust the import based on your project structure
import { styles } from "../styles";

// Generate 15-minute slots from 8:30 AM to 10:00 PM.
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  const startHour = 8;
  const startMin = 30;
  const endHour = 21;

  let current = new Date();
  current.setHours(startHour, startMin, 0, 0);

  while (
    current.getHours() < endHour ||
    (current.getHours() === endHour && current.getMinutes() === 0)
  ) {
    slots.push(format(current, "hh:mm a"));
    current = new Date(current.getTime() + 15 * 60 * 1000);
  }

  return slots;
};

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
  const timeSlots = generateTimeSlots();

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

      const { data, error } = await supabase
        .from("bookings")
        .select("start_time,end_time", { count: "exact" })
        .eq("workspace_id", workspaceId)
        .in("status", ["confirmed", "checked_in"]) // ignore cancelled
        .gte("start_time", startStr)
        .lte("end_time", endStr);

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
    <div style={styles.container}>
      {/* Week navigation */}
      <div style={styles.weekNav}>
        <button onClick={handlePrevWeek}>&laquo;</button>
        <div style={styles.currentWeekLabel}>
          {format(currentWeekStart, "dd MMM yyyy")} -{" "}
          {format(addDays(currentWeekStart, 6), "dd MMM yyyy")}
        </div>
        <button onClick={handleNextWeek}>&raquo;</button>
      </div>

      {/* Day picker row */}
      <div style={styles.daysContainer}>
        {days.map((day) => {
          const isPast = startOfDay(day) < startOfDay(new Date());
          const isSel =
            selectedDate &&
            format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

          return (
            <div
              key={day.toString()}
              onClick={() => !isPast && handleDateClick(day)}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{
                ...styles.dayBox,
                ...(isSel ? styles.dayBoxSelected : {}),
                ...(isPast ? { opacity: 0.5, cursor: "not-allowed" } : {}),
                ...(hoveredDay?.toDateString() === day.toDateString()
                  ? { backgroundColor: "#f6ebd399", color: "white" }
                  : {}),
              }}
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
          <h3 style={styles.selectTimeHeading}>Select a time slot</h3>
          <div style={styles.timeSlotsContainer}>
            {timeSlots.map((time) => {
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
                  style={{
                    ...styles.timeSlotButton,
                    ...(isSelected ? styles.timeSlotSelected : {}),
                    ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
                  }}
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
        <div style={{ marginTop: "1rem" }}>
          <h3 style={styles.selectTimeHeading}>How long will you stay?</h3>
          <div style={styles.timeSlotsContainer}>
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
                    style={{
                      ...styles.timeSlotButton,
                      ...(selectedDuration === hour ? styles.timeSlotSelected : {}),
                    }}
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
        <div style={styles.selectedInfo}>
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
