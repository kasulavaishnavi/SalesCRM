import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Sales = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/leads");

      const closedLeads = res.data.filter((lead) => lead.status === "Closed");

      const today = new Date();
      const data = [];

      for (let i = 13; i >= 0; i--) {
        const day = new Date();
        day.setDate(today.getDate() - i);
        const dayStart = new Date(day.setHours(0, 0, 0, 0));
        const dayEnd = new Date(day.setHours(23, 59, 59, 999));

        let count = 0;

        if (i === 0) {
          // today – up to now
          count = closedLeads.filter((lead) => {
            const updatedAt = new Date(lead.updatedAt);
            return updatedAt >= dayStart && updatedAt <= new Date();
          }).length;
        } else {
          // previous days – entire day
          count = closedLeads.filter((lead) => {
            const updatedAt = new Date(lead.updatedAt);
            return updatedAt >= dayStart && updatedAt <= dayEnd;
          }).length;
        }

        data.push({
          date: dayStart.toLocaleDateString("en-US", { weekday: "short" }), // e.g. Mon, Tue
          count,
        });
      }

      setSalesData(data);
    } catch (err) {
      console.error("Error fetching sales data", err);
    }
  };

  const chartData = {
  labels: salesData.map((d) => d.date),
  datasets: [
    {
      label: "Closed Leads",
      data: salesData.map((d) => d.count),
      backgroundColor: "rgba(179, 180, 180, 0.6)",
      borderRadius: 10, // rounded bars
      barPercentage: 0.6, // adjust bar width
      categoryPercentage: 0.6, // spacing between bars
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false, // add this
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      min: 0, // ensure baseline is 0
      ticks: {
        stepSize: 1,
        precision: 0, // ensures integers
      },
    },
  },
};


return (
  <div style={{ height: "100%", width: "100%" }}>
    <h4>Sales Analytics</h4>
    <Bar data={chartData} options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 },
        },
      },
    }} />
  </div>
);



};

export default Sales;
