// InteractiveSlotSelector.tsx
import React, { useEffect, useState } from 'react';

interface Slot {
  time: string;
  available: boolean;
}

interface InteractiveSlotSelectorProps {
  selectedDate: Date;
  onSelectionChange: (startTime: string, endTime: string) => void;
}

const InteractiveSlotSelector: React.FC<InteractiveSlotSelectorProps> = ({
  selectedDate,
  onSelectionChange,
}) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // Generate slots for the entire day (using a 30-minute interval)
  useEffect(() => {
    const interval = 30; // minutes
    const generatedSlots: Slot[] = [];
    const totalMinutes = 24 * 60;
    const now = new Date();
    // Check if the selected date is today
    const isToday = selectedDate.toDateString() === now.toDateString();
  
    for (let minutes = 0; minutes < totalMinutes; minutes += interval) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      
      // Create a Date object for the slot by combining the selected date with the slot time.
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(hours, mins, 0, 0);
      
      // If today, disable slots that are in the past.
      let available = true;
      if (isToday && slotDateTime < now) {
        available = false;
      }
      
      generatedSlots.push({ time: timeStr, available });
    }
    setSlots(generatedSlots);
    setSelectedSlots([]); // Clear selection on date change
  }, [selectedDate]);

  const handleSlotClick = (time: string) => {
    // Toggle the slot selection.
    if (selectedSlots.includes(time)) {
      setSelectedSlots(prev => prev.filter(t => t !== time));
    } else {
      setSelectedSlots(prev => [...prev, time].sort());
    }
  };

  // When selection changes, compute the start and end times.
  useEffect(() => {
    if (selectedSlots.length > 0) {
      const start = selectedSlots[0];
      const end = selectedSlots[selectedSlots.length - 1];
      onSelectionChange(start, end);
    } else {
      onSelectionChange('', '');
    }
  }, [selectedSlots, onSelectionChange]);

  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map(slot => (
        <button
          key={slot.time}
          disabled={!slot.available}
          className={`p-2 border rounded transition 
            ${selectedSlots.includes(slot.time) ? 'bg-blue-500 text-white' : 'bg-white text-black'}
            ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => handleSlotClick(slot.time)}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
};

export default InteractiveSlotSelector;
