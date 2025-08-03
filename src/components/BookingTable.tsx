// components/BookingTable.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  Archive,
  Search,
} from "lucide-react";

type BookingRow = {
  id: number;
  status: string;
  start_time: string;
  end_time: string;
  created_at: string;
  price: number;
  user: {
    full_name: string;
    email: string;
  } | null;
  guest: {
    full_name: string;
    phone_number: string;
  } | null;
  workspace: {
    name: string;
    price: number;
  } | null;
};

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  checked_in: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

export const BookingTable = () => {
  const [tab, setTab] = useState("Today");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [bookings, setBookings] = useState<BookingRow[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          start_time,
          end_time,
          created_at,
          price,
          user:users (
            full_name,
            email
          ),
          guest:guests (
            full_name,
            phone_number
          ),
          workspace:workspaces (
            name,
            price
          )
        `);

      if (error) {
        console.error("Error fetching bookings:", error);
      } else {
        setBookings(data);
      }
    };

    fetchBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    if (tab === "Today") return true;
    return b.status === tab;
  });  

  return (
    <Tabs value={tab} onValueChange={setTab}>
        {/* Top control row */}
        <div className="flex flex-wrap gap-10">
          {/* Tabs List */}
          <TabsList className="flex flex-wrap items-center justify-center bg-[#e0d2d2] gap-2 rounded-full shadow-sm text-black">
            {[
              { label: "Today", icon: <CalendarDays className="w-4 h-4" /> },
              { label: "Upcoming", icon: <Clock className="w-4 h-4" /> },
              { label: "Checked-in", icon: <CheckCircle className="w-4 h-4" /> },
              { label: "Completed", icon: <Archive className="w-4 h-4" /> },
            ].map(({ label, icon }) => (
              <TabsTrigger
                key={label}
                value={label}
                className="font-bold flex items-center justify-center gap-1 px-5 py-2 rounded-full text-sm leading-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow"
              >
                {icon}
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Search Bar */}
          <div className="relative w-64 text-gray-600">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search user or guest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 rounded-full bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Calendar Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-600 shadow-sm text-sm hover:bg-gray-50 focus:ring-2 focus:ring-primary"
              >
                <CalendarIcon className="h-4 w-4" />
                {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Pick a date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate || undefined}
                onSelect={setSelectedDate}
              />
            </PopoverContent>
          </Popover>
        </div>
      <TabsContent value={tab} className="mt-6">
        <div className="soverflow-y-auto rounded-md border">
          <table className="min-w-full text-sm">
            <thead className="bg-[#e0d2d2] text-black text-center">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Start time</th>
                <th className="px-4 py-2">End time</th>
                <th className="px-4 py-2">Booked</th>
                <th className="px-4 py-2">Workspace</th>
                <th className="px-4 py-2">Total Payout</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            {filtered.map((booking, index) => {
              const name = booking.user?.full_name || booking.guest?.full_name || "Unknown";

              return (
                <tr key={booking.id} className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-[#f9f4f4]"} text-black text-center`}>
                  <td className="px-4 py-2 align-middle">{index + 1}</td>
                  <td className="px-4 py-2 text-center gap-3">
                    <div>
                      <div className="font-medium">{name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2">{format(new Date(booking.start_time), "MMM d, h a")}</td>
                  <td className="px-4 py-2">{format(new Date(booking.end_time), "MMM d, h a")}</td>
                  <td className="px-4 py-2">{format(new Date(booking.created_at), "MMM d, yyyy h:mm a")}</td>
                  <td className="px-4 py-2">{booking.workspace?.name}</td>
                  <td className="px-4 py-2">{booking.price.toFixed(2)} VND</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </table>
        </div>
      </TabsContent>
    </Tabs>
  );
};
