import { useEffect, useState, useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ThemeContext } from "../../../context/ThemeContext";
import { LIGHT_THEME } from "../../../constants/themeConstants";
import "./AreaCharts.scss";

const AreaBarChart = () => {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL 
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState([]);

  const fetchDataFromBackend = async () => {
    try {
      const response = await fetch(`${baseUrl}/statistics/nbreVS`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const responseData = await response.json();
      if (responseData) {
        setData(transformData(responseData));
      }
    } catch (error) {
      console.error("Error fetching data from backend:", error);
    }
  };

  useEffect(() => {
    fetchDataFromBackend();
  }, []); 

  const transformData = (responseData) => {
    const transformedData = Object.entries(responseData).map(([course, count]) => ({
      course,
      count,
    }));
    return transformedData;
  };

  const formatTooltipValue = (value) => {
    return `${value}`;
  };

  const formatYAxisLabel = (value) => {
    return `${value}`;
  };

  const formatLegendValue = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <div className="bar-chart">
      <div className="bar-chart-info">
        <h5 className="bar-chart-title">Total Vectores Stores</h5>
        <div className="chart-info-data">
          <div className="info-data-value">{data.reduce((acc, curr) => acc + curr.count, 0)}</div>
        </div>
      </div>
      <div className="bar-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={200}
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 0,
              bottom: 5,
            }}
          >
            <XAxis
              padding={{ left: 10 }}
              dataKey="course"
              tickSize={0}
              axisLine={false}
              tick={{
                fill: `${theme === LIGHT_THEME ? "#676767" : "#f3f3f3"}`,
                fontSize: 14,
              }}
            />
            <YAxis
              padding={{ bottom: 10, top: 10 }}
              tickFormatter={formatYAxisLabel}
              tickCount={6}
              axisLine={false}
              tickSize={0}
              tick={{
                fill: `${theme === LIGHT_THEME ? "#676767" : "#f3f3f3"}`,
              }}
            />
            <Tooltip
              formatter={formatTooltipValue}
              cursor={{ fill: "transparent" }}
            />
            <Legend
              iconType="circle"
              iconSize={10}
              verticalAlign="top"
              align="right"
              formatter={formatLegendValue}
            />
            <Bar
              dataKey="count"
              name="Number of vector stores for the Marketing course"
              fill="#475be8"
              barSize={60}
              radius={[4, 4, 4, 4]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AreaBarChart;
