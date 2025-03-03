import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const GroupedBarChart = () => {
  const chartRef = useRef();

  useEffect(() => {
    // Load both CSV files
    Promise.all([
      d3.csv('/Data2.csv'), // Insurance rates
      d3.csv('/Data.csv')   // Crash rates
    ]).then(([insuranceData, crashData]) => {
      // Clean and combine the data
      const combinedData = insuranceData.map((insurance, i) => ({
        state: insurance.State,
        insuranceRate: +insurance['Avg annual cost'].replace(/[^0-9.-]+/g, ''), // Remove $ and commas
        crashRate: +crashData[i]['Total Crashes Liability'].replace(/[^0-9.-]+/g, '') // Remove commas
      }));

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
        .domain([0, d3.max(combinedData, d => Math.max(d.insuranceRate, d.crashRate))])
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

      // Add bars for crash rates.
      svg.append('g')
        .selectAll('rect')
        .data(combinedData)
        .join('rect')
        .attr('x', d => x(d.state) + x.bandwidth() / 2)
        .attr('y', d => y(d.crashRate))
        .attr('width', x.bandwidth() / 2)
        .attr('height', d => y(0) - y(d.crashRate))
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
        .data(['Insurance Rate', 'Crash Rate'])
        .join('rect')
        .attr('x', 0)
        .attr('y', (d, i) => i * 20)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', (d, i) => i === 0 ? 'steelblue' : 'orange');

      svg.append('g')
        .attr('transform', `translate(${width - marginRight - 80},${marginTop})`)
        .selectAll('text')
        .data(['Insurance Rate', 'Crash Rate'])
        .join('text')
        .attr('x', 0)
        .attr('y', (d, i) => i * 20 + 12)
        .text(d => d)
        .attr('font-size', '12px')
        .attr('fill', 'black');
    });
  }, []);

  return <div ref={chartRef}></div>;
};

export default GroupedBarChart;
