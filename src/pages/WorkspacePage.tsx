// pages/WorkspacePage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import BookingFlow from "@/components/BookingFlow";

export default function WorkspacePage() {
  const { id } = useParams(); // assume the route is /workspace/:id
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      const { data, error } = await supabase
        .from("workspaces") // your table name
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Failed to fetch workspace", error);
      } else {
        setWorkspace(data);
      }
      setLoading(false);
    };

    if (id) fetchWorkspace();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!workspace) return <div>Workspace not found</div>;

  return <BookingFlow workspace={workspace} />;
}
