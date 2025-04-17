import React, { useState } from "react";
import { format, addDays, startOfWeek, addWeeks, startOfDay } from "date-fns";

// Example 15-min slots from 8:30 AM to 22:00 PM.
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 8;
  const startMin = 30;
  const endHour = 22;

  let current = new Date();
  current.setHours(startHour, startMin, 0, 0);

  while (current.getHours() < endHour) {
    slots.push(format(current, "hh:mm a"));
    // Add 15 minutes.
    current = new Date(current.getTime() + 15 * 60 * 1000);
  }

  return slots;
};

// Helper function: Combines a date with a time string into a full Date object.
const getTimeSlotDate = (selectedDate, timeString) => {
  const [time, meridiem] = timeString.split(" ");
  const [hoursStr, minutesStr] = time.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  } else if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  const slotDate = new Date(selectedDate);
  slotDate.setHours(hours, minutes, 0, 0);
  return slotDate;
};

const DateTimePicker = () => {
  // State for current week and selected date.
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDate, setSelectedDate] = useState(null);

  // New state variables to store start and end times.
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);

  // Generate days for the current week.
  const days = Array.from({ length: 7 }).map((_, i) =>
    addDays(currentWeekStart, i)
  );

  const timeSlots = generateTimeSlots();

  // Handlers for week navigation.
  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  };

  // When a user selects a day, reset any previously selected times.
  const handleDateClick = (day) => {
    setSelectedDate(day);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
  };

  // Handler to select a time slot for start/end.
  // - If there’s no start time OR if both start and end times are set, begin a new selection.
  // - If a start time exists, set the end time if the chosen time is later.
  const handleTimeClick = (time) => {
    const slotDateTime = getTimeSlotDate(selectedDate, time);
    if (!selectedStartTime || (selectedStartTime && selectedEndTime)) {
      // Start a new selection.
      setSelectedStartTime(time);
      setSelectedEndTime(null);
    } else if (!selectedEndTime && selectedStartTime) {
      const startSlotDateTime = getTimeSlotDate(selectedDate, selectedStartTime);
      if (slotDateTime > startSlotDateTime) {
        setSelectedEndTime(time);
      } else {
        // If the selected slot is before (or equal to) the current start time, update the start time.
        setSelectedStartTime(time);
      }
    }
  };

  // Define formatting strings.
  const dayFormat = "iii";    // e.g., Mon, Tue, Wed
  const dateFormat = "d MMM"; // e.g., 11 Sep
  const fullFormat = "EEEE, d MMMM yyyy";

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>What time works best for a quick call?</h2>

      {/* Week navigation */}
      <div style={styles.weekNav}>
        <button onClick={handlePrevWeek}>&laquo;</button>
        <div style={styles.currentWeekLabel}>
          {format(currentWeekStart, "dd MMM yyyy")} -{" "}
          {format(addDays(currentWeekStart, 6), "dd MMM yyyy")}
        </div>
        <button onClick={handleNextWeek}>&raquo;</button>
      </div>

      {/* Days row */}
      <div style={styles.daysContainer}>
        {days.map((day) => {
          const isSelected = selectedDate
            ? format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
            : false;
          const isPastDay = startOfDay(day) < startOfDay(new Date());

          return (
            <div
              key={day.toString()}
              onClick={() => !isPastDay && handleDateClick(day)}
              style={{
                ...styles.dayBox,
                ...(isSelected ? styles.dayBoxSelected : {}),
                ...(isPastDay ? { opacity: 0.5, cursor: "not-allowed" } : {})
              }}
            >
              <div>{format(day, dayFormat)}</div>
              <div>{format(day, dateFormat)}</div>
            </div>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <>
          <h3 style={styles.selectTimeHeading}>Select a start and end time</h3>
          <div style={styles.timeSlotsContainer}>
            {timeSlots.map((time) => {
              const slotDate = getTimeSlotDate(selectedDate, time);
              let disabledSlot = false;
              // Disable the slot if it is in the past.
              if (slotDate < new Date()) {
                disabledSlot = true;
              }
              // If a start time is selected but end time is not yet set,
              // disable any times that are not after the chosen start time.
              if (selectedStartTime && !selectedEndTime) {
                const startSlotDate = getTimeSlotDate(selectedDate, selectedStartTime);
                if (slotDate <= startSlotDate) {
                  disabledSlot = true;
                }
              }

              // Determine if this slot should be highlighted:
              // - If only the start time is selected and this time matches it.
              // - If both start and end are selected and this time falls within the range
              //   or equals either the start or end.
              let isSelected = false;
              if (selectedStartTime && !selectedEndTime && time === selectedStartTime) {
                isSelected = true;
              } else if (selectedStartTime && selectedEndTime) {
                const startTimeObj = getTimeSlotDate(selectedDate, selectedStartTime);
                const endTimeObj = getTimeSlotDate(selectedDate, selectedEndTime);
                if (
                  time === selectedStartTime ||
                  time === selectedEndTime ||
                  (slotDate > startTimeObj && slotDate < endTimeObj)
                ) {
                  isSelected = true;
                }
              }

              return (
                <button
                  key={time}
                  onClick={() => !disabledSlot && handleTimeClick(time)}
                  style={{
                    ...styles.timeSlotButton,
                    ...(isSelected ? styles.timeSlotSelected : {}),
                    ...(disabledSlot ? { opacity: 0.5, cursor: "not-allowed" } : {})
                  }}
                  disabled={disabledSlot}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Display the chosen date and time range */}
      {selectedDate && selectedStartTime && (
        <div style={styles.selectedInfo}>
          <strong>Selected:</strong>{" "}
          {format(selectedDate, fullFormat)}, Start: {selectedStartTime}
          {selectedEndTime ? `, End: ${selectedEndTime}` : " (choose an end time)"}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;

// Basic inline styles.
const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "sans-serif",
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: "8px"
  },
  heading: {
    marginBottom: "1rem"
  },
  weekNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem"
  },
  currentWeekLabel: {
    fontWeight: "bold"
  },
  daysContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem"
  },
  dayBox: {
    flex: "1",
    textAlign: "center",
    cursor: "pointer",
    padding: "0.5rem",
    borderRadius: "4px",
    backgroundColor: "#f9f9f9",
    margin: "0 4px",

  },
  dayBoxSelected: {
    backgroundColor: "#00AFFF",
    color: "#fff"
  },
  selectTimeHeading: {
    marginBottom: "0.5rem"
  },
  timeSlotsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: "1rem"
  },
  timeSlotButton: {
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "0.5rem 1rem",
    cursor: "pointer"
  },
  timeSlotSelected: {
    backgroundColor: "#00AFFF",
    color: "#fff",
    borderColor: "#00AFFF"
  },
  selectedInfo: {
    marginBottom: "1rem"
  }
};
