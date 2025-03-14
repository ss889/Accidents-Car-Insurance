import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

// Sample data to use if files can't be loaded
const SAMPLE_INSURANCE_DATA = [
  { State: 'California', 'Avg annual cost': '$2,115' },
  { State: 'Texas', 'Avg annual cost': '$1,872' },
  { State: 'New York', 'Avg annual cost': '$2,321' },
  { State: 'Florida', 'Avg annual cost': '$2,560' },
  { State: 'Illinois', 'Avg annual cost': '$1,463' },
  { State: 'Pennsylvania', 'Avg annual cost': '$1,522' },
  { State: 'Ohio', 'Avg annual cost': '$1,023' },
  { State: 'Georgia', 'Avg annual cost': '$1,638' },
  { State: 'North Carolina', 'Avg annual cost': '$1,378' },
  { State: 'Michigan', 'Avg annual cost': '$2,105' }
];

const SAMPLE_POPULATION_DATA = [
  { State: 'California', 'Population Density (people/sq. mile)': '253.7' },
  { State: 'Texas', 'Population Density (people/sq. mile)': '109.9' },
  { State: 'New York', 'Population Density (people/sq. mile)': '429.4' },
  { State: 'Florida', 'Population Density (people/sq. mile)': '400.7' },
  { State: 'Illinois', 'Population Density (people/sq. mile)': '231.1' },
  { State: 'Pennsylvania', 'Population Density (people/sq. mile)': '286.5' },
  { State: 'Ohio', 'Population Density (people/sq. mile)': '287.3' },
  { State: 'Georgia', 'Population Density (people/sq. mile)': '184.6' },
  { State: 'North Carolina', 'Population Density (people/sq. mile)': '214.7' },
  { State: 'Michigan', 'Population Density (people/sq. mile)': '177.1' }
];

const GroupedBarChartPopulation = () => {
  const chartRef = useRef();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Clear any previous chart
    if (chartRef.current) {
      d3.select(chartRef.current).selectAll('*').remove();
    }

    const loadData = async () => {
      let insuranceData, populationData;
      
      try {
        // Try to load the CSV files
        const insuranceResponse = await fetchCSV('./Data2.csv').catch(() => 
          fetchCSV('Data2.csv').catch(() => 
            fetchCSV('/Data2.csv').catch(() => null)
          )
        );
        
        const populationResponse = await fetchCSV('./Population.csv').catch(() => 
          fetchCSV('Population.csv').catch(() => 
            fetchCSV('/Population.csv').catch(() => null)
          )
        );

        // Use the loaded data or fall back to sample data
        insuranceData = insuranceResponse || SAMPLE_INSURANCE_DATA;
        populationData = populationResponse || SAMPLE_POPULATION_DATA;
        
        // Log what we're using
        console.log('Using insurance data:', insuranceData);
        console.log('Using population data:', populationData);
        
        // If we're using sample data, inform the user
        if (!insuranceResponse || !populationResponse) {
          setError('Could not load CSV files. Using sample data instead.');
          console.warn('Using sample data because one or both CSV files could not be loaded.');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        insuranceData = SAMPLE_INSURANCE_DATA;
        populationData = SAMPLE_POPULATION_DATA;
        setError('Error loading data. Using sample data instead.');
      }

      // Process and visualize the data
      createVisualization(insuranceData, populationData);
    };

    // Function to fetch and parse CSV
    const fetchCSV = async (path) => {
      try {
        const response = await d3.csv(path);
        return response.length > 0 ? response : null;
      } catch (error) {
        console.warn(`Could not load CSV from path: ${path}`, error);
        return null;
      }
    };

    // Function to create the visualization
    const createVisualization = (insuranceData, populationData) => {
      try {
        // Clean and combine the data
        const combinedData = insuranceData.map((insurance) => {
          const population = populationData.find(p => p.State === insurance.State);
          if (!insurance || !population) {
            console.warn('Missing data for state:', insurance?.State);
            return null;
          }

          // Parse numeric values from strings, handling different formats
          const parseNumeric = (value) => {
            if (!value) return 0;
            const numericValue = value.toString().replace(/[^0-9.-]+/g, '');
            return numericValue ? +numericValue : 0;
          };

          const insuranceRate = parseNumeric(insurance['Avg annual cost']);
          const populationDensity = parseNumeric(population['Population Density (people/sq. mile)']);

          return {
            state: insurance.State,
            insuranceRate: insuranceRate,
            populationDensity: populationDensity
          };
        }).filter(d => d !== null);

        console.log('Processed data:', combinedData);

        // Check if we have data to visualize
        if (combinedData.length === 0) {
          setError('No valid data to visualize.');
          return;
        }

        // Declare the chart dimensions and margins
        const width = 800;
        const height = 500;
        const marginTop = 30;
        const marginRight = 100; // Increased margin for legend
        const marginBottom = 70; // Increased for rotated labels
        const marginLeft = 80;  // Increased for y-axis labels

        // Create the SVG container
        const svg = d3.select(chartRef.current)
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', [0, 0, width, height])
          .attr('style', 'max-width: 100%; height: auto;');

        // Add title
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', marginTop / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .style('font-weight', 'bold')
          .text('Insurance Rates vs. Population Density by State');

        // Scale the data to fit our visual space
        // For better visualization, normalize population density to be in a similar range as insurance rates
        const maxInsuranceRate = d3.max(combinedData, d => d.insuranceRate);
        const maxPopulationDensity = d3.max(combinedData, d => d.populationDensity);
        
        // Normalize population density to a similar scale as insurance rates
        const normalizedData = combinedData.map(d => ({
          ...d,
          // Scale population density relative to insurance rates for better visualization
          normalizedDensity: (d.populationDensity / maxPopulationDensity) * maxInsuranceRate
        }));

        // Declare the x (horizontal position) scale
        const x = d3.scaleBand()
          .domain(normalizedData.map(d => d.state))
          .range([marginLeft, width - marginRight])
          .padding(0.1);

        // Declare the y (vertical position) scale
        const y = d3.scaleLinear()
          .domain([0, d3.max(normalizedData, d => Math.max(d.insuranceRate, d.normalizedDensity)) * 1.1])
          .range([height - marginBottom, marginTop]);

        // Add bars for insurance rates
        svg.append('g')
          .selectAll('rect.insurance')
          .data(normalizedData)
          .join('rect')
          .attr('class', 'insurance')
          .attr('x', d => x(d.state))
          .attr('y', d => y(d.insuranceRate))
          .attr('width', x.bandwidth() / 2)
          .attr('height', d => Math.max(0, y(0) - y(d.insuranceRate)))
          .attr('fill', 'steelblue');

        // Add bars for population density
        svg.append('g')
          .selectAll('rect.population')
          .data(normalizedData)
          .join('rect')
          .attr('class', 'population')
          .attr('x', d => x(d.state) + x.bandwidth() / 2)
          .attr('y', d => y(d.normalizedDensity))
          .attr('width', x.bandwidth() / 2)
          .attr('height', d => Math.max(0, y(0) - y(d.normalizedDensity)))
          .attr('fill', 'orange');

        // Add the x-axis
        svg.append('g')
          .attr('transform', `translate(0,${height - marginBottom})`)
          .call(d3.axisBottom(x))
          .selectAll('text')
          .attr('transform', 'rotate(-45)')
          .style('text-anchor', 'end')
          .attr('dx', '-.8em')
          .attr('dy', '.15em');

        // Add the x-axis label
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height - 10)
          .attr('text-anchor', 'middle')
          .text('State');

        // Create two separate y-axes for clarity
        // Insurance rate y-axis (left)
        svg.append('g')
          .attr('transform', `translate(${marginLeft},0)`)
          .call(d3.axisLeft(y).tickFormat(d => `$${d}`))
          .call(g => g.append('text')
            .attr('x', -marginLeft + 10)
            .attr('y', 10)
            .attr('fill', 'steelblue')
            .attr('text-anchor', 'start')
            .text('Insurance Rate ($)'));

        // Population density right axis
        const yRight = d3.scaleLinear()
          .domain([0, (maxPopulationDensity * 1.1)])
          .range([height - marginBottom, marginTop]);

        svg.append('g')
          .attr('transform', `translate(${width - marginRight + 40},0)`)
          .call(d3.axisRight(yRight))
          .call(g => g.append('text')
            .attr('x', 35)
            .attr('y', 10)
            .attr('fill', 'orange')
            .attr('text-anchor', 'start')
            .text('Population Density (people/sq mi)'));

        // Add a legend
        const legend = svg.append('g')
          .attr('transform', `translate(${width - marginRight + 10},${marginTop + 30})`);

        // Insurance rate legend item
        legend.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', 'steelblue');

        legend.append('text')
          .attr('x', 20)
          .attr('y', 12)
          .text('Insurance Rate')
          .attr('font-size', '12px');

        // Population density legend item
        legend.append('rect')
          .attr('x', 0)
          .attr('y', 25)
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', 'orange');

        legend.append('text')
          .attr('x', 20)
          .attr('y', 37)
          .text('Population Density')
          .attr('font-size', '12px');

      } catch (error) {
        console.error('Error creating visualization:', error);
        setError('Error creating visualization: ' + error.message);
      }
    };

    loadData();

    // Cleanup on component unmount
    return () => {
      if (chartRef.current) {
        d3.select(chartRef.current).selectAll('*').remove();
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <div ref={chartRef}></div>
    </div>
  );
};

export default GroupedBarChartPopulation;
