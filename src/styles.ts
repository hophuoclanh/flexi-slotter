const styles = {
  paddingX: "sm:px-16 px-6",
  paddingY: "sm:py-16 py-6",
  padding: "sm:px-16 px-6 sm:py-16 py-10",

  heroHeadText:
    "font-black text-white lg:text-[60px] sm:text-[48px] xs:text-[36px] text-[28px] lg:leading-[98px] mt-2",
  heroSubText:
    "text-[#dfd9ff] font-medium lg:text-[30px] sm:text-[26px] xs:text-[20px] text-[16px] lg:leading-[40px]",

  sectionHeadText:
    "text-white font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px]",
  sectionSubText:
    "sm:text-[18px] text-[14px] text-secondary uppercase tracking-wider",

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

    guest_container: {
      width: "400px",  // Set a fixed width
      maxWidth: "100%",
      margin: "0 auto",
      fontFamily: "Poppins",
      padding: "1rem",
      border: "1px solid #ccc",
      borderRadius: "20px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      gap: "1rem", 
    },

    confirm_container: {
      width: "700px",  // Set a fixed width
      maxWidth: "100%",
      margin: "0 auto",
      fontFamily: "Poppins",
      padding: "1rem",
      border: "1px solid #ccc",
      borderRadius: "20px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      gap: "1rem", 
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
      backgroundColor: "#f6ebd3",
      margin: "12px",
      color: "#d4a373"
    },

    dayBoxSelected: {
      backgroundColor: "#f6ebd399",
      color: "black",
      fontWeight: "bold"
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
  
export { styles };