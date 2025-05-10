import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';

const TrendAnalysis = ({ selectedState }) => {
  const svgRef = useRef();

  useEffect(() => {
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Generate sample trend data (since we don't have historical data)
    const years = [2018, 2019, 2020, 2021, 2022, 2023];
    const baseRate = selectedState ? 
      Math.round(Math.random() * 1000 + 1000) : 1500;
    
    const generateTrendData = () => {
      return years.map(year => ({
        year,
        rate: baseRate * (1 + (year - 2018) * 0.08 + Math.random() * 0.02)
      }));
    };

    const data = generateTrendData();

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([d3.min(years), d3.max(years)])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.rate) * 1.1])
      .range([height, 0]);

    // Add line
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.rate))
      .curve(d3.curveMonotoneX);

    // Add area
    const area = d3.area()
      .x(d => xScale(d.year))
      .y0(height)
      .y1(d => yScale(d.rate))
      .curve(d3.curveMonotoneX);

    // Add gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#1976d2')
      .attr('stop-opacity', 0.4);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#1976d2')
      .attr('stop-opacity', 0.1);

    // Add area
    svg.append('path')
      .datum(data)
      .attr('class', 'area')
      .attr('d', area)
      .attr('fill', 'url(#area-gradient)');

    // Add line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#1976d2')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add points
    svg.selectAll('.dot')
      .data(data)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.rate))
      .attr('r', 4)
      .attr('fill', '#1976d2')
      .on('mouseover', (event, d) => {
        // Show tooltip
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', xScale(d.year))
          .attr('y', yScale(d.rate) - 10)
          .attr('text-anchor', 'middle')
          .text(`$${Math.round(d.rate).toLocaleString()}`);
      })
      .on('mouseout', () => {
        svg.selectAll('.tooltip').remove();
      });

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format('d'));
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `$${d.toLocaleString()}`);
    
    svg.append('g')
      .call(yAxis);

    // Add labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 35)
      .attr('text-anchor', 'middle')
      .text('Year');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .text('Average Insurance Rate');

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(`Insurance Rate Trends ${selectedState ? `in ${selectedState}` : '(National Average)'}`);
  }, [selectedState]);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg ref={svgRef} style={{ maxWidth: '100%', height: '100%' }}></svg>
    </Box>
  );
};

export default TrendAnalysis;
