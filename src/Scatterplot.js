import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const Scatterplot = () => {
  const chartRef = useRef();

  useEffect(() => {
    // Load both CSV files
    Promise.all([
      d3.csv('/Data2.csv'), // Insurance rates
      d3.csv('/Data.csv')   // Crash rates
    ]).then(([insuranceData, crashData]) => {
      console.log('Insurance Data:', insuranceData);
      console.log('Crash Data:', crashData);

      // Clean and combine the data
      const combinedData = insuranceData.map((insurance, i) => {
        if (!insurance || !crashData[i]) {
          console.error('Missing data for row:', i);
          return null;
        }

        const insuranceRate = insurance['Avg annual cost']?.replace(/[^0-9.-]+/g, '');
        const crashRate = crashData[i]['Total Crashes Liability']?.replace(/[^0-9.-]+/g, '');

        if (!insuranceRate || !crashRate) {
          console.error('Invalid data for row:', i);
          return null;
        }

        return {
          state: insurance.State,
          insuranceRate: +insuranceRate,
          crashRate: +crashRate
        };
      }).filter(d => d !== null);

      console.log('Combined Data:', combinedData);

      // Declare the chart dimensions and margins.
      const width = 800;
      const height = 500;
      const marginTop = 30;
      const marginRight = 30;
      const marginBottom = 50;
      const marginLeft = 50;

      // Create the SVG container.
      const svg = d3.select(chartRef.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .attr('style', 'max-width: 100%; height: auto;');

      // Declare the x (horizontal position) scale.
      const x = d3.scaleLinear()
        .domain([0, d3.max(combinedData, d => d.crashRate)])
        .range([marginLeft, width - marginRight]);

      // Declare the y (vertical position) scale.
      const y = d3.scaleLinear()
        .domain([0, d3.max(combinedData, d => d.insuranceRate)])
        .range([height - marginBottom, marginTop]);

      // Add dots for each state.
      svg.append('g')
        .selectAll('circle')
        .data(combinedData)
        .join('circle')
        .attr('cx', d => x(d.crashRate))
        .attr('cy', d => y(d.insuranceRate))
        .attr('r', 5)
        .attr('fill', 'steelblue');

      // Add the x-axis and label.
      svg.append('g')
        .attr('transform', `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x))
        .call(g => g.append('text')
          .attr('x', width - marginRight)
          .attr('y', 30)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'end')
          .text('Crash Rate'));

      // Add the y-axis and label.
      svg.append('g')
        .attr('transform', `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.append('text')
          .attr('x', -marginLeft)
          .attr('y', 10)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'start')
          .text('Insurance Rate'));

      // Add state labels to the dots.
      svg.append('g')
        .selectAll('text')
        .data(combinedData)
        .join('text')
        .attr('x', d => x(d.crashRate) + 7)
        .attr('y', d => y(d.insuranceRate) + 5)
        .text(d => d.state)
        .attr('font-size', '10px')
        .attr('fill', 'black');
    }).catch((error) => {
      console.error('Error loading or processing CSV files:', error);
    });
  }, []);

  return <div ref={chartRef}></div>;
};

export default Scatterplot;
