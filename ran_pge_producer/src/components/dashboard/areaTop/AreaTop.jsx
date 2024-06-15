import { MdOutlineMenu } from "react-icons/md";
import "./AreaTop.scss";
import { useContext, useEffect, useRef, useState } from "react";
import { SidebarContext } from "../../../context/SidebarContext";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { addDays } from "date-fns";
import { DateRange } from "react-date-range";
import { useUser } from '../../../context/UserContext'

const AreaTop = () => {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL 
  const { setSuperUser, userID } = useUser();
  const { openSidebar } = useContext(SidebarContext);

  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: "selection",
    },
  ]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateRangeRef = useRef(null);

  const handleInputClick = () => {
    setShowDatePicker(true);
  };

  const handleClickOutside = (event) => {
    if (dateRangeRef.current && !dateRangeRef.current.contains(event.target)) {
      setShowDatePicker(false);
    }
  };

  useEffect(() => {
    const hasFetchedSuperUserStatus = localStorage.getItem('hasFetchedSuperUserStatus');

    const fetchSuperUserStatus = async () => {
      try {
        const response = await fetch(`${baseUrl}/user/${userID}/superUser`);
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('hasFetchedSuperUserStatus', true);
          setSuperUser(data.superUser);
        } else {
          console.error("Failed to fetch superUser status:");
        }
      } catch (error) {
        console.error("Error fetching superUser status:", error);
      }
    };
    if (!hasFetchedSuperUserStatus){
      fetchSuperUserStatus();
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    
  }, []);

  return (
    <section className="content-area-top">
      <div className="area-top-l">
        <button
          className="sidebar-open-btn"
          type="button"
          onClick={openSidebar}
        >
          <MdOutlineMenu size={24} />
        </button>
        <h2 className="area-top-title">Dashboard</h2>
      </div>
      <div className="area-top-r">
        <div
          ref={dateRangeRef}
          className={`date-range-wrapper ${
            !showDatePicker ? "hide-date-range" : ""
          }`}
          onClick={handleInputClick}
        >
          <DateRange
            editableDateInputs={true}
            onChange={(item) => setState([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={state}
            showMonthAndYearPickers={false}
          />
        </div>
      </div>
    </section>
  );
};

export default AreaTop;
