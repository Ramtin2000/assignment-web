import React from 'react';
import { ErrorState, ErrorCard, ErrorTitle, ErrorText } from './Dashboard';
import { Button } from './Button';
import { fadeIn } from '../../lib/styled';

export const Error = ({ 
  title = 'Error', 
  message, 
  onRetry, 
  retryText = 'Try Again',
  onBack,
  backText = 'Go Back'
}) => {
  return (
    <ErrorState
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
    >
      <ErrorCard>
        <ErrorTitle>{title}</ErrorTitle>
        {message && <ErrorText>{message}</ErrorText>}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {onRetry && (
            <Button variant="primary" onClick={onRetry}>
              {retryText}
            </Button>
          )}
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              {backText}
            </Button>
          )}
        </div>
      </ErrorCard>
    </ErrorState>
  );
};

export default Error;

