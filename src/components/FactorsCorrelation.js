import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';

const FactorsCorrelation = ({ selectedState }) => {
  const svgRef = useRef();

  useEffect(() => {
    const margin = { top: 30, right: 20, bottom: 50, left: 140 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Load the data
    Promise.all([
      d3.csv(`${process.env.PUBLIC_URL}/data/insurance_rates.csv`),
      d3.csv(`${process.env.PUBLIC_URL}/data/factors.csv`)
    ]).then(([insuranceData, factorsData]) => {
      const state = selectedState || insuranceData[0].state;
      const stateData = factorsData.find(d => d.state === state);
      
      if (!stateData) return;

      // Transform data for visualization
      const factors = [
        { name: 'Accident Rate', value: +stateData.accident_rate },
        { name: 'Population Density', value: +stateData.population_density },
        { name: 'Urban Population %', value: +stateData.urban_population },
        { name: 'Vehicle Theft Rate', value: +stateData.vehicle_theft },
        { name: 'Average Age', value: +stateData.average_age },
        { name: 'Natural Disasters', value: +stateData.natural_disasters }
      ];

      // Create scales
      const yScale = d3.scaleBand()
        .domain(factors.map(d => d.name))
        .range([0, height])
        .padding(0.2);

      const xScale = d3.scaleLinear()
        .domain([0, d3.max(factors, d => d.value)])
        .range([0, width]);

      // Add bars
      svg.selectAll('rect')
        .data(factors)
        .join('rect')
        .attr('y', d => yScale(d.name))
        .attr('height', yScale.bandwidth())
        .attr('x', 0)
        .attr('width', 0)
        .attr('fill', '#1976d2')
        .attr('rx', 4)
        .transition()
        .duration(1000)
        .attr('width', d => xScale(d.value));

      // Add value labels
      svg.selectAll('.value-label')
        .data(factors)
        .join('text')
        .attr('class', 'value-label')
        .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
        .attr('x', d => xScale(d.value) + 5)
        .attr('dy', '0.35em')
        .attr('opacity', 0)
        .text(d => d.value.toFixed(1))
        .transition()
        .duration(1000)
        .attr('opacity', 1);

      // Add y-axis
      svg.append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('font-size', '12px');

      // Add title
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(`Contributing Factors in ${state}`);
    });

    return () => {
      d3.select(svgRef.current).selectAll('*').remove();
    };
  }, [selectedState]);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg ref={svgRef} style={{ maxWidth: '100%', height: '100%' }}></svg>
    </Box>
  );
};

export default FactorsCorrelation;
