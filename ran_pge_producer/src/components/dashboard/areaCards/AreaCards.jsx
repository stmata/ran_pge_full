import { useState, useEffect } from "react";
import AreaCard from "./AreaCard";
import "./AreaCards.scss";

const AreaCards = () => {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL 
  const [jsonData, setJsonData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${baseUrl}/statistics/show_pie`); // Assurez-vous de remplacer l'URL par celle de votre API
      const data = await response.json();
      setJsonData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <section className="content-area-cards">
      {Object.keys(jsonData).length !== 0 && (
        <>
          <AreaCard
            colors={["#e4e8ef", "#475be8"]}
            percentFillValue={jsonData.pdf_count}
            cardInfo={{
              title: "PDF Count",
              value: jsonData.pdf_count,
              text: "Number of PDFs",
            }}
          />
          {/* <AreaCard
            colors={["#e4e8ef", "#4ce13f"]}
            percentFillValue={jsonData.local_video_count}
            cardInfo={{
              title: "Local Video Count",
              value: jsonData.local_video_count,
              text: "Number of local videos",
            }}
          /> */}
          <AreaCard
            colors={["#e4e8ef", "#f29a2e"]}
            percentFillValue={jsonData.youtube_url_count}
            cardInfo={{
              title: "YouTube URL Count",
              value: jsonData.youtube_url_count,
              text: "Number of YouTube URLs",
            }}
          />
        </>
      )}
    </section>
  );
};

export default AreaCards;
