import React from 'react';
import Scatterplot from './Scatterplot';
import GroupedBarChart from './GroupedBarChart';

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
