import React from 'react';
import { PredictionForm } from '../forms/PredictionForm';

// Simplified InputArea that uses the new composable PredictionForm
function InputArea(): JSX.Element {
  return <PredictionForm />;
}

export default InputArea;