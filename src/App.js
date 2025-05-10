import React, { useState } from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import InsuranceRateMap from './components/InsuranceRateMap';
import RateComparisonChart from './components/RateComparisonChart';
import FactorsCorrelation from './components/FactorsCorrelation';
import TrendAnalysis from './components/TrendAnalysis';
import './App.css';

function App() {
  const [selectedState, setSelectedState] = useState(null);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Car Insurance Rates Analysis
      </Typography>
      <Typography variant="subtitle1" gutterBottom align="center">
        Exploring the factors behind high car insurance rates across the United States
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 600 }}>
            <Typography variant="h6" gutterBottom>
              Insurance Rates by State
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <InsuranceRateMap onStateSelect={setSelectedState} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 450 }}>
            <Typography variant="h6" gutterBottom>
              Insurance Rates vs. Accident Rates
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <RateComparisonChart selectedState={selectedState} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 450 }}>
            <Typography variant="h6" gutterBottom>
              Contributing Factors
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <FactorsCorrelation selectedState={selectedState} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 450 }}>
            <Typography variant="h6" gutterBottom>
              Insurance Rate Trends
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <TrendAnalysis selectedState={selectedState} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
