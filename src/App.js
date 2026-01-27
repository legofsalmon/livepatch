import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { firebaseConfig } from './firebaseConfig';
import Spreadsheet from './components/Spreadsheet';
import Toolbar from './components/Toolbar';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function App() {
  const [spreadsheetData, setSpreadsheetData] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const spreadsheetRef = ref(database, 'spreadsheet');
    
    // Listen for real-time updates
    const unsubscribe = onValue(spreadsheetRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSpreadsheetData(data);
      } else {
        // Initialize with default data if empty
        const defaultData = {
          rows: 10,
          cols: 10,
          cells: {}
        };
        set(spreadsheetRef, defaultData);
        setSpreadsheetData(defaultData);
      }
      setIsConnected(true);
    }, (error) => {
      console.error('Firebase connection error:', error);
      setIsConnected(false);
      // Use local data if Firebase is not available
      const defaultData = {
        rows: 10,
        cols: 10,
        cells: {}
      };
      setSpreadsheetData(defaultData);
    });

    return () => unsubscribe();
  }, []);

  const updateSpreadsheet = (newData) => {
    const spreadsheetRef = ref(database, 'spreadsheet');
    set(spreadsheetRef, newData).catch((error) => {
      console.error('Error updating spreadsheet:', error);
      // Update local state even if Firebase fails
      setSpreadsheetData(newData);
    });
  };

  const addRow = () => {
    const newData = {
      ...spreadsheetData,
      rows: (spreadsheetData.rows || 10) + 1
    };
    updateSpreadsheet(newData);
  };

  const addColumn = () => {
    const newData = {
      ...spreadsheetData,
      cols: (spreadsheetData.cols || 10) + 1
    };
    updateSpreadsheet(newData);
  };

  const updateCell = (row, col, value, formatting) => {
    const cellKey = `${row}-${col}`;
    const newData = {
      ...spreadsheetData,
      cells: {
        ...spreadsheetData.cells,
        [cellKey]: { value, formatting }
      }
    };
    updateSpreadsheet(newData);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Live Patch</h1>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Connected' : 'Offline'}</span>
        </div>
      </header>
      <Toolbar onAddRow={addRow} onAddColumn={addColumn} />
      <div className="spreadsheet-container">
        <Spreadsheet
          rows={spreadsheetData.rows || 10}
          cols={spreadsheetData.cols || 10}
          cells={spreadsheetData.cells || {}}
          onUpdateCell={updateCell}
        />
      </div>
    </div>
  );
}

export default App;
