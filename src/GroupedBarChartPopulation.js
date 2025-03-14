import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const GroupedBarChartPopulation = () => {
  const chartRef = useRef();

  useEffect(() => {
    // Load both CSV files from the public folder
    Promise.all([
      d3.csv('/Data2.csv'), // Insurance rates
      d3.csv('/Population.csv') // Population density
    ]).then(([insuranceData, populationData]) => {
      console.log('Insurance Data:', insuranceData); // Debug: Check insurance data
      console.log('Population Data:', populationData); // Debug: Check population data

      // Clean and combine the data
      const combinedData = insuranceData.map((insurance) => {
        // Find matching population data for the state
        const population = populationData.find(p => p.State === insurance.State);
        if (!insurance || !population) {
          console.error('Missing data for state:', insurance?.State);
          return null;
        }

        // Extract and clean insurance rate and population density
        const insuranceRate = insurance['Avg annual cost']?.replace(/[^0-9.-]+/g, '');
        const populationDensity = population['Population Density (people/sq. mile)']?.replace(/[^0-9.-]+/g, '');

        if (!insuranceRate || !populationDensity) {
          console.error('Invalid data for state:', insurance.State);
          return null;
        }

        return {
          state: insurance.State,
          insuranceRate: +insuranceRate, // Convert to number
          populationDensity: +populationDensity // Convert to number
        };
      }).filter(d => d !== null); // Remove null entries

      console.log('Combined Data:', combinedData); // Debug: Check combined data

      // If no valid data, show an error message
      if (combinedData.length === 0) {
        console.error('No valid data to visualize.');
        return;
      }

      // Declare the chart dimensions and margins.
      const width = 800;
      const height = 500;
      const marginTop = 30;
      const marginRight = 30;
      const marginBottom = 50;
      const marginLeft = 50;

      // Clear any existing SVG content
      d3.select(chartRef.current).selectAll('*').remove();

      // Create the SVG container.
      const svg = d3.select(chartRef.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .attr('style', 'max-width: 100%; height: auto; border: 1px solid red;'); // Add a red border for debugging

      // Declare the x (horizontal position) scale.
      const x = d3.scaleBand()
        .domain(combinedData.map(d => d.state)) // States on the x-axis
        .range([marginLeft, width - marginRight])
        .padding(0.1);

      // Declare the y (vertical position) scale.
      const y = d3.scaleLinear()
        .domain([0, d3.max(combinedData, d => Math.max(d.insuranceRate, d.populationDensity))]) // Max value for y-axis
        .range([height - marginBottom, marginTop]);

      // Add bars for insurance rates.
      svg.append('g')
        .selectAll('rect')
        .data(combinedData)
        .join('rect')
        .attr('x', d => x(d.state)) // Position bars for each state
        .attr('y', d => y(d.insuranceRate)) // Height based on insurance rate
        .attr('width', x.bandwidth() / 2) // Half the bandwidth for grouped bars
        .attr('height', d => y(0) - y(d.insuranceRate)) // Bar height
        .attr('fill', 'steelblue') // Blue color for insurance rates
        .on('mouseover', (event, d) => {
          console.log('Insurance Rate Bar:', d); // Debug: Log bar data on hover
        });

      // Add bars for population density.
      svg.append('g')
        .selectAll('rect')
        .data(combinedData)
        .join('rect')
        .attr('x', d => x(d.state) + x.bandwidth() / 2) // Offset bars for population density
        .attr('y', d => y(d.populationDensity)) // Height based on population density
        .attr('width', x.bandwidth() / 2) // Half the bandwidth for grouped bars
        .attr('height', d => y(0) - y(d.populationDensity)) // Bar height
        .attr('fill', 'orange') // Orange color for population density
        .on('mouseover', (event, d) => {
          console.log('Population Density Bar:', d); // Debug: Log bar data on hover
        });

      // Add the x-axis and label.
      svg.append('g')
        .attr('transform', `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x)) // Add x-axis
        .call(g => g.append('text')
          .attr('x', width - marginRight)
          .attr('y', 30)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'end')
          .text('State'));

      // Add the y-axis and label.
      svg.append('g')
        .attr('transform', `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y)) // Add y-axis
        .call(g => g.append('text')
          .attr('x', -marginLeft)
          .attr('y', 10)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'start')
          .text('Rate'));

      // Add a legend.
      svg.append('g')
        .attr('transform', `translate(${width - marginRight - 100},${marginTop})`)
        .selectAll('rect')
        .data(['Insurance Rate', 'Population Density'])
        .join('rect')
        .attr('x', 0)
        .attr('y', (d, i) => i * 20)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', (d, i) => i === 0 ? 'steelblue' : 'orange');

      svg.append('g')
        .attr('transform', `translate(${width - marginRight - 80},${marginTop})`)
        .selectAll('text')
        .data(['Insurance Rate', 'Population Density'])
        .join('text')
        .attr('x', 0)
        .attr('y', (d, i) => i * 20 + 12)
        .text(d => d)
        .attr('font-size', '12px')
        .attr('fill', 'black');
    }).catch((error) => {
      console.error('Error loading or processing CSV files:', error); // Error handling
    });
  }, []); // <-- Empty dependency array ensures this runs only once

  return <div ref={chartRef}></div>;
};

export default GroupedBarChartPopulation;
