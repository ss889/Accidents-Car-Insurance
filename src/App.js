import React from 'react';
import Scatterplot from './Scatterplot';
import GroupedBarChart from './GroupedBarChart';
import GroupedBarChartPopulation from './GroupedBarChartPopulation'; // Import the new component
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Insurance Rates vs. Crash Rates</h1>
      <Scatterplot />
      <GroupedBarChart />

      <h1>Insurance Rates vs. Population Density</h1>
      <GroupedBarChartPopulation /> {/* Add the new component */}
    </div>
  );
}

export default App;
