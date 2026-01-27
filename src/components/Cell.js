import React, { useState, useRef, useEffect } from 'react';
import FormattingToolbar from './FormattingToolbar';

function Cell({ row, col, value, formatting, isSelected, onClick, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [localFormatting, setLocalFormatting] = useState(formatting || {});
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    setLocalFormatting(formatting || {});
  }, [formatting]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    onClick(row, col);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onUpdate(row, col, localValue, localFormatting);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onUpdate(row, col, localValue, localFormatting);
    } else if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  const handleFormatChange = (formatType, formatValue) => {
    const newFormatting = {
      ...localFormatting,
      [formatType]: formatValue
    };
    setLocalFormatting(newFormatting);
    onUpdate(row, col, localValue, newFormatting);
  };

  const getCellStyle = () => {
    const style = {};
    
    if (localFormatting.bold) {
      style.fontWeight = 'bold';
    }
    if (localFormatting.italic) {
      style.fontStyle = 'italic';
    }
    if (localFormatting.underline) {
      style.textDecoration = 'underline';
    }
    if (localFormatting.color) {
      style.color = localFormatting.color;
    }
    
    return style;
  };

  return (
    <td
      className={`spreadsheet-cell ${isSelected ? 'selected' : ''} ${isEditing ? 'editing' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isSelected && !isEditing && (
        <FormattingToolbar
          formatting={localFormatting}
          onFormatChange={handleFormatChange}
        />
      )}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="cell-input"
          style={getCellStyle()}
        />
      ) : (
        <div className="cell-content" style={getCellStyle()}>
          {localValue}
        </div>
      )}
    </td>
  );
}

export default Cell;
