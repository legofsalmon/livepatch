import React from 'react';

function Toolbar({ onAddRow, onAddColumn }) {
  return (
    <div className="toolbar">
      <button className="toolbar-button" onClick={onAddRow}>
        <span>➕</span> Add Row
      </button>
      <button className="toolbar-button" onClick={onAddColumn}>
        <span>➕</span> Add Column
      </button>
    </div>
  );
}

export default Toolbar;
