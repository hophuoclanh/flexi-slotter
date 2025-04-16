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
  // Starting with Monday of the current week.
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDate, setSelectedDate] = useState(null);
  // Use two states for start and end time selections.
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);

  // Name and phone state
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

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

  // When selecting a new day, reset any previously selected times.
  const handleDateClick = (day) => {
    setSelectedDate(day);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
  };

  // Handle time click to allow selecting a start and an end time.
  const handleTimeClick = (time) => {
    const clickedTime = getTimeSlotDate(selectedDate, time);

    // If no start time exists OR if a full range was already selected, set start time.
    if (!selectedStartTime || (selectedStartTime && selectedEndTime)) {
      setSelectedStartTime(time);
      setSelectedEndTime(null);
    } else if (selectedStartTime && !selectedEndTime) {
      // Get the Date object for the selected start time.
      const startTimeObj = getTimeSlotDate(selectedDate, selectedStartTime);
      // If the clicked time is after the start, set it as the end time.
      if (clickedTime > startTimeObj) {
        setSelectedEndTime(time);
      } else {
        // Otherwise, update the start time to the clicked time.
        setSelectedStartTime(time);
      }
    }
  };

  const dayFormat = "iii";    // e.g., Mon, Tue, Wed
  const dateFormat = "d MMM"; // e.g., 11 Sep
  const fullFormat = "EEEE, d MMMM yyyy";

  return (
    <div style={styles.container}>
      {/* Example: Name & Phone Inputs */}
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel} htmlFor="guestName">Name</label>
          <input
            id="guestName"
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Enter your name"
            style={styles.formInput}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel} htmlFor="guestPhone">Phone Number</label>
          <input
            id="guestPhone"
            type="text"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="Enter your phone"
            style={styles.formInput}
          />
        </div>
      </div>

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
          <h3 style={styles.selectTimeHeading}>
            Select a time slot
          </h3>
          <div style={styles.timeSlotsContainer}>
            {timeSlots.map((time) => {
              const slotDate = getTimeSlotDate(selectedDate, time);
              let disabledSlot = false;

              // Disable if the time slot is in the past.
              if (slotDate < new Date()) {
                disabledSlot = true;
              }

              // If a start time is selected but no end time yet,
              // disable slots that are not after the start time.
              if (selectedStartTime && !selectedEndTime) {
                const startSlotDate = getTimeSlotDate(
                  selectedDate,
                  selectedStartTime
                );
                if (slotDate <= startSlotDate) {
                  disabledSlot = true;
                }
              }

              // Determine if a slot is selected or within the selected range.
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

      {/* Display selected date and time range */}
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

const styles = {
//   container: {
//     width: "fit-content",
//     display: "inline-block",
//     maxWidth: "100%",
//     margin: "0 auto",
//     fontFamily: "Poppins",
//     padding: "1rem",
//     border: "1px solid #ccc",
//     borderRadius: "20px",
//     textAlign: "center",
//   },

container: {
    width: "1000px",  // Set a fixed width
    maxWidth: "100%",
    margin: "0 auto",
    fontFamily: "Poppins",
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: "20px",
    textAlign: "center",
  },
  
  
  // Form row styling for the Name & Phone inputs
  formRow: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginBottom: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    minWidth: "200px",
  },
  formLabel: {
    marginBottom: "0.25rem",
    fontWeight: "bold",
    textAlign: "left",
    paddingLeft: "0.25rem",
  },
  formInput: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #bdbdbd",
    fontSize: "1rem",
    color: "#434343",
    backgroundColor: "#f5f5f5"
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
    justifyContent: "center",
    gap: "20px",
    marginBottom: "1rem"
  },
  dayBox: {
    textAlign: "center",
    cursor: "pointer",
    padding: "0.5rem",
    borderRadius: "6px",
    backgroundColor: "#d4a373",
    margin: "12px"
  },
  dayBoxSelected: {
    backgroundColor: "#f9f9f9",
    color: "black"
  },
  selectTimeHeading: {
    marginBottom: "0.5rem"
  },
  timeSlotsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(6, auto)",  // 6 columns
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
    backgroundColor: "#d4a373",
    color: "#fff",
    borderColor: "#d4a373"
  },
  selectedInfo: {
    marginBottom: "1rem"
  }
};
