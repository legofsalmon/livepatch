# Live Patch - Real-time Collaborative Spreadsheet

Live Patch is a web-based collaborative spreadsheet application that enables multiple users to work together in real-time. Built with React and Firebase Realtime Database, it provides a seamless experience across desktop and mobile browsers.

## Features

### Core Functionality
- **Real-time Collaboration**: Changes are instantly synchronized across all connected users via Firebase Realtime Database
- **Editable Spreadsheet**: Click to select, double-click to edit cells
- **Dynamic Rows & Columns**: Add rows and columns on-demand with toolbar buttons
- **Text Formatting**: Format text within individual cells with:
  - Bold
  - Italic
  - Underline
  - Color selection (12 preset colors)

### Design
- **Responsive**: Works seamlessly on desktop and mobile browsers
- **Clean Interface**: Modern, intuitive UI with visual feedback
- **Connection Status**: Visual indicator showing real-time connection status

## Technology Stack

- **React 18**: Component-based UI framework
- **Firebase Realtime Database**: Real-time data synchronization
- **Webpack**: Module bundler and development server
- **CSS3**: Responsive styling with mobile-first approach

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd livepatch
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase (Optional - works offline with demo credentials):
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Realtime Database
   - Copy `.env.example` to `.env`
   - Add your Firebase project credentials to `.env`
   
   **Note**: The application works offline with demo credentials for development. For production deployment with real-time collaboration, configure your own Firebase project.

4. Start the development server:
```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Usage

### Basic Operations
- **Select Cell**: Click on any cell
- **Edit Cell**: Double-click on a cell or start typing when selected
- **Save Changes**: Press Enter or click outside the cell
- **Cancel Editing**: Press Escape

### Formatting
1. Select a cell
2. Use the formatting toolbar that appears above the cell
3. Click format buttons to toggle bold, italic, or underline
4. Click the color button to choose a text color

### Adding Rows/Columns
- Click "➕ Add Row" in the toolbar to add a new row at the bottom
- Click "➕ Add Column" in the toolbar to add a new column to the right

## Future Enhancements

### Planned for Mobile Apps
The codebase is structured to support future extension to iOS and Android:
- React components can be adapted for React Native
- Firebase SDK works on all platforms
- Business logic is separated from UI components

### Potential Features
- Cell formulas and calculations
- Data validation
- Sorting and filtering
- Import/export (CSV, Excel)
- User authentication and permissions
- Cell comments and notes
- Undo/redo functionality
- Copy/paste support

## Architecture

### Component Structure
```
src/
├── App.js                      # Main application component
├── components/
│   ├── Spreadsheet.js          # Spreadsheet grid component
│   ├── Cell.js                 # Individual cell component
│   ├── FormattingToolbar.js    # Cell formatting controls
│   └── Toolbar.js              # Main toolbar
├── firebaseConfig.js           # Firebase configuration
├── index.js                    # Application entry point
└── styles.css                  # Global styles
```

### Data Structure

Spreadsheet data in Firebase:
```json
{
  "spreadsheet": {
    "rows": 10,
    "cols": 10,
    "cells": {
      "0-0": {
        "value": "Hello",
        "formatting": {
          "bold": true,
          "color": "#FF0000"
        }
      }
    }
  }
}
```

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
