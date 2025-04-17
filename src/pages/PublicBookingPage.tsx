// PublicBookingPage.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase, Workspace } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { styles } from "../styles";
import Slideshow from "@/components/Slideshow";
import { navLinks } from "../constants";

type PublicBookingFormValues = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
};

const homePageImages = [
  "./home_page/home_page.jpg",
  "./home_page/home_page_1.jpg",
  "./home_page/home_page_2.jpg",
];

const PublicBookingPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch workspace details
  const {
    data: workspace,
    isLoading: isLoadingWorkspace,
  } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();
      if (error) throw error;
      return data as Workspace;
    },
    enabled: !!workspaceId,
  });

  return (
    <Layout hideSidebar>
      <div className="flex flex-col md:flex-row justify-center gap-20 md:gap-20 px-12 py-24 ">
        <div className='flex flex-col items-center py-8'>
          <div className='w-5 h-5 rounded-full bg-[#d4a373]' />
          <div className='w-1 sm:h-80 h-40 violet-gradient' />
        </div>

        <div>
          <h1 className={`${styles.heroHeadText} text-white`}>
            Lets Find Your <br />
            Perfect <span className='text-[#d4a373]'>Place to Work</span>
          </h1>
          <p className={`${styles.heroSubText} mt-2 text-white-100`}>
            Book a space that fits your flow - from solo desks to team rooms.
          </p>

          <div className="mt-12 gap-4">
            <a
              href='#booking' // This creates a link to "#booking"
              className="px-8 py-3 bg-[#d4a373] rounded-md text-xl font-bold hover:bg-[#c29365] transition-colors"
            >
              Book Your Spot
            </a>
          </div>
        </div>

        <div className="w-full max-w-[575px]">
          <Slideshow images={homePageImages} interval={5000} />
        </div>
      </div>
    </Layout>
  );
};

export default PublicBookingPage;
