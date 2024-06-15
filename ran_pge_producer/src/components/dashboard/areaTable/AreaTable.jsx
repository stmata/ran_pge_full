import { useEffect, useState } from "react";
import "./AreaTable.scss";

const AreaTable = () => {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL 
  const [levelInfo, setLevelInfo] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${baseUrl}/statistics/levelInfos`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setLevelInfo(data);
      })
      .catch(error => {
        console.error("Error fetching level info:", error);
        setError(error.message);
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <section className="content-area-table">
      <div className="data-table-info">
        <h4 className="data-table-title">Levels Information</h4>
      </div>
      <div className="data-table-diagram">
        <table>
          <thead>
            <tr>
              <th>Level</th>
              <th>Course</th>
              <th>Module</th>
              <th>Status</th>
              <th>Views</th>
            </tr>
          </thead>
          <tbody>
            {levelInfo.map((level, index) => (
              <tr key={index}>
                <td>{level.level}</td>
                <td>{level.course}</td>
                <td>{level.topic}</td>
                <td>{level.status ? "Active" : "Inactive"}</td>
                <td>{level.stars}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AreaTable;
