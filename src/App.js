import React from 'react';
import Scatterplot from './Scatterplot';
import GroupedBarChart from './GroupedBarChart';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Insurance Rates vs. Crash Rates</h1>
      <Scatterplot />
      <GroupedBarChart />
    </div>
  );
}

export default App;
