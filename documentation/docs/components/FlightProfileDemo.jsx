import React, { useState, useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { createJsonViewer } from '../helpers/jsonViewer';

function FlightProfileDemoInner() {
  const [getFlightProfileModal, setGetFlightProfileModal] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    // Dynamically import courthive-components only on client-side
    import('courthive-components').then((module) => {
      setGetFlightProfileModal(() => module.getFlightProfileModal);
    });
  }, []);

  const handleOpenEditor = () => {
    if (!getFlightProfileModal) return;

    getFlightProfileModal({
      editorConfig: {
        labels: {
          title: 'Flight Profile Configuration',
        },
      },
      callback: (result) => {
        if (result && resultsRef.current) {
          // Display the flight profile configuration
          resultsRef.current.innerHTML = '';
          const header = document.createElement('h4');
          header.textContent = 'Generated Flight Profile Configuration';
          header.style.marginTop = '20px';
          resultsRef.current.appendChild(header);

          createJsonViewer(resultsRef.current, result, { expanded: 2 });
        }
      },
    }).open();
  };

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={handleOpenEditor}
        disabled={!getFlightProfileModal}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: getFlightProfileModal ? '#007bff' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: getFlightProfileModal ? 'pointer' : 'not-allowed',
        }}
      >
        {getFlightProfileModal ? 'Open Flight Profile Editor' : 'Loading...'}
      </button>
      <div ref={resultsRef} style={{ marginTop: '20px' }} />
    </div>
  );
}

export default function FlightProfileDemo() {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => <FlightProfileDemoInner />}
    </BrowserOnly>
  );
}
