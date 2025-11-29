import React from 'react';
import { LoadingState, LoadingSpinner, LoadingText, spinnerVariants } from './Dashboard';

export const Loading = ({ message = 'Loading...' }) => {
  return (
    <LoadingState
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner
          variants={spinnerVariants}
          animate="animate"
        />
        <LoadingText>{message}</LoadingText>
      </div>
    </LoadingState>
  );
};

export default Loading;

