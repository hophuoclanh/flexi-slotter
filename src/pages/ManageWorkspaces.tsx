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
  Users 
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase, Workspace } from "@/lib/supabase";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Workspace name must be at least 2 characters" }),
  capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1" }),
});
type FormValues = z.infer<typeof formSchema>;

// Helper function to create default slots for a new workspace
const createDefaultSlots = async (workspaceId: number) => {
  // Create slots for the next day
  const slotDateObj = new Date();
  slotDateObj.setDate(slotDateObj.getDate() + 1);
  const slotDate = slotDateObj.toISOString().split("T")[0]; // YYYY-MM-DD

  // Define default times (9:00 AM to 4:00 PM, hourly)
  const times = [
    "09:00:00",
    "10:00:00",
    "11:00:00",
    "12:00:00",
    "13:00:00",
    "14:00:00",
    "15:00:00",
    "16:00:00",
  ];

  const defaultSlots = times.map((time) => ({
    slot_date: slotDate,
    slot_time: time,
    workspace_id: workspaceId,
    status: "available",
  }));

  const { error } = await supabase.from("slots").insert(defaultSlots);
  if (error) {
    throw error;
  }
};

const ManageWorkspaces = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch workspaces
  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['admin-workspaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('id');
        
      if (error) {
        throw error;
      }
      
      return data as Workspace[];
    },
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      capacity: 1,
    },
  });
  
  const openAddDialog = () => {
    form.reset({
      name: "",
      capacity: 1,
    });
    setSelectedWorkspace(null);
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (workspace: Workspace) => {
    form.reset({
      name: workspace.name,
      capacity: workspace.capacity,
    });
    setSelectedWorkspace(workspace);
    setIsDialogOpen(true);
  };
  
  const openDeleteDialog = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setIsDeleteDialogOpen(true);
  };
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      if (selectedWorkspace) {
        // Update existing workspace
        const { error } = await supabase
          .from('workspaces')
          .update({
            name: data.name,
            capacity: data.capacity,
          })
          .eq('id', selectedWorkspace.id);
          
        if (error) throw error;
        
        toast({
          title: "Workspace updated",
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Create new workspace and get the created record
        const { data: newWorkspace, error } = await supabase
          .from('workspaces')
          .insert([{
            name: data.name,
            capacity: data.capacity,
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        toast({
          title: "Workspace created",
          description: `${data.name} has been created successfully.`,
        });
        
        // Create some default slots for the new workspace
        await createDefaultSlots(newWorkspace.id);
      }
      
      // Refresh workspace list
      queryClient.invalidateQueries({ queryKey: ['admin-workspaces'] });
      
      // Close dialog
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedWorkspace) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if workspace has bookings
      const { count, error: countError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', selectedWorkspace.id);
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        toast({
          title: "Cannot delete workspace",
          description: "This workspace has existing bookings. Remove the bookings first.",
          variant: "destructive",
        });
        setIsDeleteDialogOpen(false);
        setIsSubmitting(false);
        return;
      }
      
      // Delete slots for this workspace
      const { error: slotsError } = await supabase
        .from('slots')
        .delete()
        .eq('workspace_id', selectedWorkspace.id);
        
      if (slotsError) throw slotsError;
      
      // Delete the workspace
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', selectedWorkspace.id);
        
      if (error) throw error;
      
      toast({
        title: "Workspace deleted",
        description: `${selectedWorkspace.name} has been deleted successfully.`,
      });
      
      // Refresh workspace list
      queryClient.invalidateQueries({ queryKey: ['admin-workspaces'] });
      
      // Close dialog
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
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
        
        {isLoading ? (
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
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEditDialog(workspace)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openDeleteDialog(workspace)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>Capacity: {workspace.capacity}</span>
                  </CardDescription>
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
              {selectedWorkspace ? 'Edit Workspace' : 'Add Workspace'}
            </DialogTitle>
            <DialogDescription>
              {selectedWorkspace 
                ? 'Update the workspace details below.' 
                : 'Enter the details for the new workspace.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
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
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {selectedWorkspace ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedWorkspace ? 'Update' : 'Create'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workspace "{selectedWorkspace?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ManageWorkspaces;
