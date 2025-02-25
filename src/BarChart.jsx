import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const BarChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState(null);

  // Load CSV data using d3.csv.
  useEffect(() => {
    d3.csv('/data.csv', (d) => {
      return {
        date: new Date(d.date),
        value: +d.value,
        event: d.event ? d.event.trim() : ''
      };
    })
      .then((loadedData) => {
        // Optionally, filter out any rows with invalid data.
        const filteredData = loadedData.filter(
          (d) => d.date instanceof Date && !isNaN(d.value)
        );
        setData(filteredData);
      })
      .catch((error) => {
        console.error('Error loading CSV:', error);
      });
  }, []);

  // Render the chart using D3 when data is loaded.
  useEffect(() => {
    if (!data) return;
