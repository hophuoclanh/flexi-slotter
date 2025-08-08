import { Link } from "react-router-dom";
import Tilt from "react-parallax-tilt";

import { motion } from "framer-motion";

import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

const images = [
  {
    src: "./single_pod/single_pod_2.jpg",
    title: "Single Pod",
    description: "A cozy workspace for one, perfect for focused work.",
    link: "/single-pod-slots",
  },
  {
    src: "./double_pod/double_pod_3.jpg",
    title: "Double Pod",
    description: "Room for two to collaborate or work side-by-side.",
    link: "/double-pod-slots",
  },
  {
    src: "./meeting_6/meeting_6_2.jpg",
    title: "Meeting Room (6 pax)",
    description:
      "Fully equipped space ideal for team meetings or small workshops.",
    link: "/meeting-6-slots",
  },
  {
    src: "./meeting_10/meeting_10_2.jpg",
    title: "Meeting Room (10 pax)",
    description:
      "Perfect for larger discussions, presentations, or group projects.",
    link: "/meeting-10-slots",
  },
];

const ImageCard = ({ index, image }) => {
  const { src, title, description, link } = image;

  return (
    <Tilt 
      tiltMaxAngleX={0}
      tiltMaxAngleY={45}
      scale={1}
      transitionSpeed={450}
    >
      <div className="relative w-[300px] xl:w-[300px] rounded-[20px] shadow-md bg-white overflow-hidden transform-gpu">
        {/* The image */}
        <motion.img
          src={src}
          alt={`img-${index}`}
          variants={fadeIn("right", "spring", 0.5 * index, 0.75)}
          className="w-full h-[300px] object-cover"
        />

        {/* Text and button section */}
        <div className="p-4 bg-[#f6ebd3] flex flex-col justify-between flex-1">
          <div>
            <h3 className="text-lg font-bold mb-2 text-[#434343]">{title}</h3>
            <p className="text-sm text-[#434343] mb-4">{description}</p>
          </div>
          <Link to={link}>
            <button className="px-4 py-2 rounded-md bg-[#d4a373] text-white hover:opacity-90 transition-opacity">
              Book Now
            </button>
          </Link>
        </div>
      </div>
    </Tilt>
  );
};

const Booking = () => {
  return (
    <div className=" mx-auto justify-center px-8 xl:px-12">
      <div className="flex flex-col">
        <motion.div variants={textVariant()}>
          <h2 className={`${styles.sectionHeadText}`}>
            Book Your <span className="text-[#d4a373]">Workspace</span>
          </h2>
        </motion.div>

        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className="mt-4 text-secondary text-white-100 text-[12px] xl:text-[20px] w-[300px] xl:w-[800px] leading-[30px]"
        >
          At South Ground, we understand that no work style is the same. That’s
          why we offer a range of thoughtfully designed workspaces — from single
          pods to meeting rooms with fully equipped spaces. Whether you're a
          freelancer, a startup team, or hosting a workshop, we’ve got a spot
          that fits your needs. Explore our solutions and find the perfect space
          to focus, collaborate, and grow.
        </motion.p>
      </div>

      {/* 3. Map over our updated images array */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 py-10">
        {images.map((item, idx) => (
          <motion.div
            key={idx}
            variants={fadeIn("right", "spring", 0.5 * idx, 0.5)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <ImageCard image={item} index={idx} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SectionWrapper(Booking, "booking");
