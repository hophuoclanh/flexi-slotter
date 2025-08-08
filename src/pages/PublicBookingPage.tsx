// PublicBookingPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { supabase, Workspace } from "@/lib/supabase";
import { styles } from "../styles";
import Slideshow from "@/components/Slideshow";

const homePageImages = [
  "./home_page/home_page.jpg",
  "./home_page/home_page_1.jpg",
  "./home_page/home_page_2.jpg",
];

const PublicBookingPage = () => {
  const { workspaceId } = useParams();

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
      <div className="flex flex-col xl:flex-row justify-center gap-5 xl:gap-20 px-5 xl:px-12 py-2 xl:py-24">
        <div className="flex flex-row gap-5 xl:gap-8">
          <div className='w-20 flex flex-col items-center py-4 xl:py-8'>
            <div className='w-5 h-5 rounded-full bg-[#d4a373]' />
            <div className='w-1 sm:h-80 h-40 violet-gradient' />
          </div>

          <div>
            <h1 className={`${styles.heroHeadText} text-white`}>
              Lets Find Your <br />
              Perfect <span className='text-[#d4a373]'>Place to Work</span>
            </h1>
            <p className={`${styles.heroSubText} mt-5 xl:mt-12 text-white-100`}>
              Book a space that fits your flow - from solo desks to team rooms.
            </p>

            <div className="mt-7 xl:mt-20 gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById("booking");
                  if (el) {
                    let yOffset = 0;
                    const width = window.innerWidth;

                    if (width < 768) yOffset = 90;
                    else if (width < 1280) yOffset = -80;
                    else yOffset = 50;

                    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }
                }}
                className="px-8 py-3 bg-[#d4a373] rounded-md text-sm xl:text-xl font-bold hover:bg-[#c29365] transition-colors"
              >
                Book Your Spot
              </button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[575px] mt-5">
          <Slideshow images={homePageImages} interval={5000} />
        </div>
      </div>
    </Layout>
  );
};

export default PublicBookingPage;
