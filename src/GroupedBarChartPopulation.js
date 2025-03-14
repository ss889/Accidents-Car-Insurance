import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const GroupedBarChartPopulation = () => {
  const chartRef = useRef();

  useEffect(() => {
    // Load both CSV files
    Promise.all([
      d3.csv('/Data2.csv'), // Insurance rates
      d3.csv('/Population.csv') // Population density
    ]).then(([insuranceData, populationData]) => {
      // Clean and combine the data
      const combinedData = insuranceData.map((insurance, i) => {
        const population = populationData.find(p => p.State === insurance.State);
        if (!insurance || !population) {
          console.error('Missing data for state:', insurance?.State);
          return null;
        }

        const insuranceRate = insurance['Avg annual cost']?.replace(/[^0-9.-]+/g, '');
        const populationDensity = population['Population Density (people/sq. mile)']?.replace(/[^0-9.-]+/g, '');

        if (!insuranceRate || !populationDensity) {
          console.error('Invalid data for state:', insurance.State);
          return null;
        }

        return {
          state: insurance.State,
          insuranceRate: +insuranceRate,
          populationDensity: +populationDensity
        };
      }).filter(d => d !== null);

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
      const x = d3.scaleBand()
        .domain(combinedData.map(d => d.state))
        .range([marginLeft, width - marginRight])
        .padding(0.1);

      // Declare the y (vertical position) scale.
      const y = d3.scaleLinear()
        .domain([0, d3.max(combinedData, d => Math.max(d.insuranceRate, d.populationDensity))])
        .range([height - marginBottom, marginTop]);

      // Add bars for insurance rates.
      svg.append('g')
        .selectAll('rect')
        .data(combinedData)
        .join('rect')
        .attr('x', d => x(d.state))
        .attr('y', d => y(d.insuranceRate))
        .attr('width', x.bandwidth() / 2)
        .attr('height', d => y(0) - y(d.insuranceRate))
        .attr('fill', 'steelblue');

      // Add bars for population density.
      svg.append('g')
        .selectAll('rect')
        .data(combinedData)
        .join('rect')
        .attr('x', d => x(d.state) + x.bandwidth() / 2)
        .attr('y', d => y(d.populationDensity))
        .attr('width', x.bandwidth() / 2)
        .attr('height', d => y(0) - y(d.populationDensity))
        .attr('fill', 'orange');

      // Add the x-axis and label.
      svg.append('g')
        .attr('transform', `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x))
        .call(g => g.append('text')
          .attr('x', width - marginRight)
          .attr('y', 30)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'end')
          .text('State'));

      // Add the y-axis and label.
      svg.append('g')
        .attr('transform', `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y))
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
