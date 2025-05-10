import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';

const RateComparisonChart = ({ selectedState }) => {
  const svgRef = useRef();

  useEffect(() => {
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Load and process the data
    Promise.all([
      d3.csv(`${process.env.PUBLIC_URL}/data/insurance_rates.csv`),
      d3.csv(`${process.env.PUBLIC_URL}/data/accident_rates.csv`),
      d3.csv(`${process.env.PUBLIC_URL}/data/population_density.csv`)
    ]).then(([insuranceData, accidentData, populationData]) => {
      // Combine data
      const combinedData = insuranceData.map(d => {
        const state = d.state;
        const accidents = accidentData.find(a => a.state === state);
        const population = populationData.find(p => p.state === state);
        
        return {
          state,
          insuranceRate: +d.rate,
          accidentRate: accidents ? +accidents.rate : 0,
          density: population ? +population.density : 0
        };
      });

      // Create scales
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(combinedData, d => d.accidentRate)])
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(combinedData, d => d.insuranceRate)])
        .range([height, 0]);

      const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(combinedData, d => d.density)])
        .range([4, 20]);

      // Add axes
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .append('text')
        .attr('x', width / 2)
        .attr('y', 35)
        .attr('fill', 'black')
        .text('Accident Rate (per 100,000 residents)');

      svg.append('g')
        .call(d3.axisLeft(yScale))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -45)
        .attr('x', -height / 2)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .text('Insurance Rate ($)');

      // Add scatter plot points
      svg.selectAll('circle')
        .data(combinedData)
        .join('circle')
        .attr('cx', d => xScale(d.accidentRate))
        .attr('cy', d => yScale(d.insuranceRate))
        .attr('r', d => radiusScale(d.density))
        .attr('fill', d => d.state === selectedState ? '#dc004e' : '#1976d2')
        .attr('opacity', 0.6)
        .on('mouseover', (event, d) => {
          // Show tooltip
          const [x, y] = d3.pointer(event);
          svg.append('text')
            .attr('class', 'tooltip')
            .attr('x', x + 10)
            .attr('y', y)
            .text(`${d.state}: $${d.insuranceRate.toLocaleString()}`);
        })
        .on('mouseout', () => {
          svg.selectAll('.tooltip').remove();
        });

      // Add legend
      const legend = svg.append('g')
        .attr('transform', `translate(${width - 120}, 10)`);

      legend.append('text')
        .attr('x', 0)
        .attr('y', -5)
        .text('Population Density');

      const legendData = [
        { value: d3.min(combinedData, d => d.density), label: 'Low' },
        { value: d3.median(combinedData, d => d.density), label: 'Medium' },
        { value: d3.max(combinedData, d => d.density), label: 'High' }
      ];

      legend.selectAll('circle')
        .data(legendData)
        .join('circle')
        .attr('cx', 10)
        .attr('cy', (d, i) => i * 25 + 10)
        .attr('r', d => radiusScale(d.value))
        .attr('fill', '#1976d2')
        .attr('opacity', 0.6);

      legend.selectAll('text')
        .data(legendData)
        .join('text')
        .attr('x', 30)
        .attr('y', (d, i) => i * 25 + 15)
        .text(d => d.label);
    });

    return () => {
      d3.select(svgRef.current).selectAll('*').remove();
    };
  }, [selectedState]);

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto' }}></svg>
    </Box>
  );
};

export default RateComparisonChart;
