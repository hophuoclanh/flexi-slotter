import React, { useState } from "react";
import { format, addDays, startOfWeek, addWeeks, startOfDay } from "date-fns";
import { styles } from "../styles";

// Generate 15-minute slots from 8:30 AM to 10:00 PM.
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  const startHour = 8;
  const startMin = 30;
  const endHour = 22;

  let current = new Date();
  current.setHours(startHour, startMin, 0, 0);

  while (current.getHours() < endHour) {
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
  selectedEndTime: string | null;
  onDateChange: (date: Date) => void;
  onTimeChange: (start: string | null, end: string | null) => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onDateChange,
  onTimeChange,
}) => {
  // Start of the current week (Monday).
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  // Dates for the week and time slots.
  const days = Array.from({ length: 7 }).map((_, i) =>
    addDays(currentWeekStart, i)
  );
  const timeSlots = generateTimeSlots();

  // Week navigation handlers.
  const handlePrevWeek = () => setCurrentWeekStart((w) => addWeeks(w, -1));
  const handleNextWeek = () => setCurrentWeekStart((w) => addWeeks(w, 1));

  // Date selection resets any existing times.
  const handleDateClick = (day: Date) => {
    onDateChange(day);
    onTimeChange(null, null);
  };

  // Time selection logic for start/end range.
  const handleTimeClick = (time: string) => {
    // Clear if clicking the same start slot (before choosing end).
    if (selectedStartTime === time && !selectedEndTime) {
      onTimeChange(null, null);
      return;
    }

    if (!selectedStartTime || (selectedStartTime && selectedEndTime)) {
      onTimeChange(time, null);
    } else {
      const startObj = getTimeSlotDate(selectedDate!, selectedStartTime!);
      const clicked = getTimeSlotDate(selectedDate!, time);
      if (clicked > startObj) {
        onTimeChange(selectedStartTime!, time);
      } else {
        onTimeChange(time, null);
      }
    }
  };

  // Format for the selected-info display.
  const fullFormat = "EEEE, d MMMM yyyy";

  return (
    <div style={styles.container}>
      {/* Week navigation */}
      <div style={styles.weekNav}>
        <button onClick={handlePrevWeek}>&laquo;</button>
        <div style={styles.currentWeekLabel}>
          {format(currentWeekStart, "dd MMM yyyy")} -{' '}
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
            format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

          return (
            <div
              key={day.toString()}
              onClick={() => !isPast && handleDateClick(day)}
              style={{
                ...styles.dayBox,
                ...(isSel ? styles.dayBoxSelected : {}),
                ...(isPast ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
              }}
            >
              <div>{format(day, 'iii')}</div>
              <div>{format(day, 'd MMM')}</div>
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
              let disabled = slotDate < new Date();

              if (selectedStartTime && !selectedEndTime) {
                const startObj = getTimeSlotDate(
                  selectedDate,
                  selectedStartTime
                );
                if (slotDate < startObj) disabled = true;
              }

              let isSelected = false;
              if (!selectedEndTime && time === selectedStartTime) {
                isSelected = true;
              }
              if (selectedStartTime && selectedEndTime) {
                const startObj = getTimeSlotDate(
                  selectedDate,
                  selectedStartTime
                );
                const endObj = getTimeSlotDate(
                  selectedDate,
                  selectedEndTime
                );
                if (
                  time === selectedStartTime ||
                  time === selectedEndTime ||
                  (slotDate > startObj && slotDate < endObj)
                ) {
                  isSelected = true;
                }
              }

              return (
                <button
                  key={time}
                  onClick={() => !disabled && handleTimeClick(time)}
                  disabled={disabled}
                  style={{
                    ...styles.timeSlotButton,
                    ...(isSelected ? styles.timeSlotSelected : {}),
                    ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                  }}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Display selected range */}
      {selectedDate && selectedStartTime && (
        <div style={styles.selectedInfo}>
          <strong>Selected:</strong>{' '}
          {format(selectedDate, fullFormat)}, Start: {selectedStartTime}
          {selectedEndTime ? (
            <>, End: {selectedEndTime}</>
          ) : (
            ' (choose an end time)'
          )}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
