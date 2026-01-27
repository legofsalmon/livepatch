import React, { useState } from 'react';

function FormattingToolbar({ formatting, onFormatChange }) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const toggleBold = () => {
    onFormatChange('bold', !formatting.bold);
  };

  const toggleItalic = () => {
    onFormatChange('italic', !formatting.italic);
  };

  const toggleUnderline = () => {
    onFormatChange('underline', !formatting.underline);
  };

  const handleColorChange = (color) => {
    onFormatChange('color', color);
    setShowColorPicker(false);
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#000080', '#808080'
  ];

  return (
    <div className="formatting-toolbar">
      <button
        className={`format-button ${formatting.bold ? 'active' : ''}`}
        onClick={toggleBold}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        className={`format-button ${formatting.italic ? 'active' : ''}`}
        onClick={toggleItalic}
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        className={`format-button ${formatting.underline ? 'active' : ''}`}
        onClick={toggleUnderline}
        title="Underline"
      >
        <u>U</u>
      </button>
      <button
        className="format-button color-button"
        onClick={() => setShowColorPicker(!showColorPicker)}
        title="Text Color"
        style={{ color: formatting.color || '#000000' }}
      >
        A
      </button>
      {showColorPicker && (
        <div className="color-picker">
          {colors.map((color) => (
            <button
              key={color}
              className="color-option"
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FormattingToolbar;
