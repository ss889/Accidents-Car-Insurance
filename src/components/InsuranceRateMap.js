import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Box } from '@mui/material';

const InsuranceRateMap = ({ onStateSelect }) => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 960;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const projection = d3.geoAlbersUsa()
      .scale(1300)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Load US map data and insurance rates
    Promise.all([
      d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'),
      d3.csv('/data/insurance_rates.csv')
    ]).then(([us, rates]) => {
      const states = new Map(rates.map(d => [d.state, +d.rate]));
      
      const colorScale = d3.scaleSequential()
        .domain([d3.min(rates, d => +d.rate), d3.max(rates, d => +d.rate)])
        .interpolator(d3.interpolateReds);

      svg.append('g')
        .selectAll('path')
        .data(topojson.feature(us, us.objects.states).features)
        .join('path')
        .attr('fill', d => {
          const rate = states.get(d.properties.name);
          return rate ? colorScale(rate) : '#ccc';
        })
        .attr('d', path)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .on('mouseover', (event, d) => {
          const rate = states.get(d.properties.name);
          d3.select(event.currentTarget)
            .attr('stroke', '#000')
            .attr('stroke-width', 2);
          
          // Show tooltip
          const [x, y] = d3.pointer(event);
          svg.append('text')
            .attr('class', 'tooltip')
            .attr('x', x)
            .attr('y', y - 10)
            .text(`${d.properties.name}: $${rate?.toLocaleString()}`);
        })
        .on('mouseout', (event) => {
          d3.select(event.currentTarget)
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5);
          svg.selectAll('.tooltip').remove();
        })
        .on('click', (event, d) => {
          onStateSelect(d.properties.name);
        });

      // Add legend
      const legendWidth = 200;
      const legendHeight = 10;
      const legend = svg.append('g')
        .attr('transform', `translate(${width - legendWidth - 10}, ${height - 30})`);

      const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, legendWidth]);

      const legendAxis = d3.axisBottom(legendScale)
        .tickSize(legendHeight)
        .tickFormat(d => `$${d.toLocaleString()}`);

      legend.append('g')
        .selectAll('rect')
        .data(d3.range(legendWidth))
        .join('rect')
        .attr('x', d => d)
        .attr('y', 0)
        .attr('width', 1)
        .attr('height', legendHeight)
        .attr('fill', d => colorScale(legendScale.invert(d)));

      legend.append('g')
        .call(legendAxis)
        .select('.domain')
        .remove();
    });

    return () => {
      svg.selectAll('*').remove();
    };
  }, [onStateSelect]);

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto' }}></svg>
    </Box>
  );
};

export default InsuranceRateMap;
