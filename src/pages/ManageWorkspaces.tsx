// ManageWorkspaces.tsx
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Building2,
  Edit,
  Info,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase, Workspace } from "@/lib/supabase";

// --- Workspace form schema and types ---
const workspaceSchema = z.object({
  name: z.string().min(2, { message: "Workspace name must be at least 2 characters" }),
  capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1" }),
  quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1" }),
});

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

// --- Booking type ---
type Booking = {
  id: number;
  user_id: string;
  workspace_id: number;
  status: string;
  start_time: string | null;
  end_time: string | null;
  no_show: boolean;
  // Joined data
  user: { email: string } | null;
  workspace: { name: string } | null;
};

const ManageWorkspaces = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [activeTab, setActiveTab] = useState<"workspaces" | "bookings">("workspaces");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- Fetch workspaces ---
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useQuery({
    queryKey: ['admin-workspaces'],
    queryFn: async () => {
      const { data, error } = await supabase.from('workspaces').select('*').order('id');
      if (error) throw error;
      return data as Workspace[];
    },
  });

  // --- Workspace form ---
  const workspaceForm = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      capacity: 1,
    },
  });

  const openAddDialog = () => {
    workspaceForm.reset({
      name: "",
      capacity: 1,
      quantity: 1,
    });
    setSelectedWorkspace(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (workspace: Workspace) => {
    workspaceForm.reset({
      name: workspace.name,
      capacity: workspace.capacity,
      quantity: workspace.quantity,
    });
    setSelectedWorkspace(workspace);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setIsDeleteDialogOpen(true);
  };

  const onWorkspaceSubmit = async (data: WorkspaceFormValues) => {
    try {
      if (selectedWorkspace) {
        // Update workspace
        const { error } = await supabase
          .from('workspaces')
          .update({ name: data.name, capacity: data.capacity, quantity: data.quantity })
          .eq('id', selectedWorkspace.id);
        if (error) throw error;
        toast({
          title: "Workspace updated",
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Create new workspace
        const { data: newWorkspace, error } = await supabase
          .from('workspaces')
          .insert([{ name: data.name, capacity: data.capacity, quantity: data.quantity }])
          .select()
          .single();
        if (error) throw error;
        toast({
          title: "Workspace created",
          description: `${data.name} has been created successfully.`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['admin-workspaces'] });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };  

  const handleWorkspaceDelete = async () => {
    if (!selectedWorkspace) return;
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', selectedWorkspace.id);
      if (error) throw error;
      toast({
        title: "Workspace deleted",
        description: `${selectedWorkspace.name} has been deleted successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-workspaces'] });
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };  

  // --- Booking management ---
  const { data: bookings, isLoading: isLoadingBookings, refetch: refetchBookings } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user: user_id ( email ),
          workspace: workspace_id ( name )
        `);
      if (error) throw error;
      return data as Booking[];
    },
  });

  // State for editing a booking
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingEditData, setBookingEditData] = useState({
    status: "",
    start_time: "",
    end_time: "",
  });
  const [isBookingUpdating, setIsBookingUpdating] = useState(false);

  const openBookingEditDialog = (booking: Booking) => {
    setEditingBooking(booking);
    setBookingEditData({
      status: booking.status,
      start_time: booking.start_time || "",
      end_time: booking.end_time || "",
    });
  };

  const handleBookingUpdate = async () => {
    if (!editingBooking) return;
    setIsBookingUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: bookingEditData.status,
          start_time: bookingEditData.start_time,
          end_time: bookingEditData.end_time,
        })
        .eq('id', editingBooking.id);
      if (error) throw error;
      toast({
        title: "Booking updated",
        description: "The booking has been updated successfully.",
      });
      setEditingBooking(null);
      refetchBookings();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBookingUpdating(false);
    }
  };

  const handleBookingDelete = async (bookingId: number) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);
      if (error) throw error;
      toast({
        title: "Booking deleted",
        description: "The booking has been deleted.",
      });
      refetchBookings();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <TabsList>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        {/* Workspaces Management Tab */}
        <TabsContent value="workspaces">
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Workspaces</h1>
                <p className="text-muted-foreground mt-2">
                  Add, edit, or remove workspaces from your co-working space.
                </p>
              </div>
              <Button className="mt-4 sm:mt-0" onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" /> Add Workspace
              </Button>
            </div>

            {isLoadingWorkspaces ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : workspaces && workspaces.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {workspaces.map((workspace) => (
                  <Card key={workspace.id}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          <span>{workspace.name}</span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(workspace)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(workspace)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>Capacity: {workspace.capacity}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No workspaces found. Add a workspace to get started.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Add/Edit Workspace Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedWorkspace ? "Edit Workspace" : "Add Workspace"}
                </DialogTitle>
              </DialogHeader>
              <Form {...workspaceForm}>
                <form onSubmit={workspaceForm.handleSubmit(onWorkspaceSubmit)} className="space-y-6">
                  <FormField
                    control={workspaceForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workspace Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={workspaceForm.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={workspaceForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {selectedWorkspace ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Workspace Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete "{selectedWorkspace?.name}"?</DialogTitle>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleWorkspaceDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Bookings Management Tab */}
        <TabsContent value="bookings">
          <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Manage Bookings</h1>
            {isLoadingBookings ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : bookings && bookings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-1">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <CardTitle>
                        {booking.workspace?.name || "Workspace Unknown"}
                      </CardTitle>
                      <CardDescription>
                        {booking.user?.email || "User Unknown"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Status: {booking.status}</p>
                      <p>
                        Time: {booking.start_time} - {booking.end_time}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openBookingEditDialog(booking)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleBookingDelete(booking.id)}>
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>No bookings found.</AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default ManageWorkspaces;
