import React, { useState, useEffect } from "react";
import { format, addDays, startOfWeek, addWeeks, startOfDay } from "date-fns";
import { supabase } from "@/supabaseClient";
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
    if (selectedStartTime === time) {
      onTimeChange(null, null);
    } else {
      onTimeChange(time, null);
    }
  };

  const getUnavailableSlots = (
    bookings: { start_time: string; end_time: string }[],
    quantity: number
  ): string[] => {
    const counts: Record<string, number> = {};

    timeSlots.forEach((slot) => {
      const slotStart = getTimeSlotDate(selectedDate!, slot);
      const slotEnd = new Date(slotStart.getTime() + 15 * 60 * 1000);

      bookings.forEach((booking) => {
        const bookingStart = new Date(booking.start_time);
        const bookingEnd = new Date(booking.end_time);

        const overlaps = bookingStart < slotEnd && bookingEnd > slotStart;
        if (overlaps) {
          counts[slot] = (counts[slot] || 0) + 1;
        }
      });
    });

    return Object.entries(counts)
      .filter(([_, count]) => count >= quantity)
      .map(([slot]) => slot);
  };

  const fullFormat = "EEEE, d MMMM yyyy";

  useEffect(() => {
    const fetchUnavailableSlots = async () => {
      if (!selectedDate) return;
  
      const startStr = format(selectedDate, "yyyy-MM-dd") + "T00:00:00";
      const endStr = format(selectedDate, "yyyy-MM-dd") + "T23:59:59";
  
      const { data, error } = await supabase
        .from("bookings")
        .select("start_time, end_time")
        .eq("workspace_id", workspaceId)
        .gte("start_time", startStr)
        .lte("end_time", endStr);
  
      if (error) {
        console.error("Supabase booking fetch error:", error);
        return;
      }
  
      const slotCounts: Record<string, number> = {};
      timeSlots.forEach((slot) => {
        const slotStart = getTimeSlotDate(selectedDate, slot);
        const slotEnd = new Date(slotStart.getTime() + 15 * 60 * 1000);
        data.forEach(({ start_time, end_time }) => {
          const bStart = new Date(start_time);
          const bEnd = new Date(end_time);
          if (bStart < slotEnd && bEnd > slotStart) {
            slotCounts[slot] = (slotCounts[slot] || 0) + 1;
          }
        });
      });
  
      const unavailable = Object.entries(slotCounts)
        .filter(([_, count]) => count >= workspaceQuantity)
        .map(([slot]) => slot);
  
      setUnavailableSlots(unavailable);
    };
  
    fetchUnavailableSlots();
  }, [selectedDate, workspaceId, workspaceQuantity]);  

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
              const disabled = slotDate < now || unavailableSlots.includes(time);
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

              return Array.from({ length: availableHours }, (_, i) => i + 1).map((hour) => (
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
              ));
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
