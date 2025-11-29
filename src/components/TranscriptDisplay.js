import React, { useEffect, useRef } from 'react';

const TranscriptDisplay = ({ transcript, isRecording }) => {
  const transcriptRef = useRef(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
        Your Answer:
        {isRecording && (
          <span style={{ marginLeft: '10px', color: '#dc3545', fontSize: '12px' }}>
            ● Recording...
          </span>
        )}
      </div>
      <div
        ref={transcriptRef}
        style={{
          minHeight: '100px',
          maxHeight: '200px',
          overflowY: 'auto',
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          fontSize: '16px',
          lineHeight: '1.6',
        }}
      >
        {transcript || (
          <span style={{ color: '#999' }}>Your answer will appear here...</span>
        )}
      </div>
    </div>
  );
};

export default TranscriptDisplay;

