// src/pages/ManageSlots.tsx
import React, { useState, useEffect } from 'react';
import { supabase, Workspace } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const ManageSlots = () => {
  const { toast } = useToast();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(''); // Format: YYYY-MM-DD
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [interval, setInterval] = useState(60); // in minutes

  // Fetch list of workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      const { data, error } = await supabase.from('workspaces').select('*');
      if (error) {
        console.error(error);
      } else {
        setWorkspaces(data);
      }
    };
    fetchWorkspaces();
  }, []);

  // Fetch slots whenever a workspace and date are selected
  useEffect(() => {
    if (selectedWorkspaceId && selectedDate) {
      fetchSlots();
    }
  }, [selectedWorkspaceId, selectedDate]);

  const fetchSlots = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('slots')
      .select('*')
      .eq('workspace_id', selectedWorkspaceId)
      .eq('slot_date', selectedDate);
    if (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // Bulk generate slots for the selected date and workspace
  const generateSlots = async () => {
    if (!selectedWorkspaceId || !selectedDate) {
      toast({
        title: 'Select Workspace and Date',
        description: 'Please select a workspace and a date.',
      });
      return;
    }
    const newSlots = [];
    let currentTime = startTime;
    while (currentTime < endTime) {
      newSlots.push({
        slot_date: selectedDate,
        slot_time: currentTime,
        workspace_id: selectedWorkspaceId,
        status: 'available',
      });
      // Calculate the next time slot by adding the interval (in minutes)
      const [hours, minutes] = currentTime.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes + interval;
      const newHours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
      const newMinutes = (totalMinutes % 60).toString().padStart(2, '0');
      currentTime = `${newHours}:${newMinutes}`;
      if (currentTime >= endTime) break;
    }
    const { error } = await supabase.from('slots').insert(newSlots);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Slots Generated', description: 'Slots have been generated successfully.' });
      fetchSlots();
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Manage Slots</h1>
      
      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Workspace:</label>
        <select
          value={selectedWorkspaceId || ''}
          onChange={(e) => setSelectedWorkspaceId(Number(e.target.value))}
          className="p-2 border rounded"
        >
          <option value="">Select a workspace</option>
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Date:</label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
      
      <div className="mb-4 flex space-x-4">
        <Input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-1/3"
        />
        <Input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-1/3"
        />
        <Input
          type="number"
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          placeholder="Interval (mins)"
          className="w-1/3"
        />
      </div>
      
      <Button onClick={generateSlots}>Generate Slots</Button>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Existing Slots</h2>
      </div>
    </div>
  );
};

export default ManageSlots;
