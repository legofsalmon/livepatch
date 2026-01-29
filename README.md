# Live Patch - Real-time Collaborative Spreadsheet

Live Patch is a web-based collaborative spreadsheet application designed for live event production and stage management. It enables multiple users to work together in real-time, managing patch lists, sub-boxes, artist lineups, and technical configurations. Built with Next.js, React, and Firebase Realtime Database, it provides a seamless experience across desktop and mobile browsers with offline support.

## Features

### Spreadsheet Management
- **Multiple Spreadsheets**: Create, manage, and switch between multiple spreadsheet projects
- **Spreadsheet Selector**: Intuitive interface to browse, create, and open spreadsheets
- **Metadata Tracking**: Each spreadsheet includes title, stage, date, and modification timestamps
- **Real-time Sync**: Changes are instantly synchronized across all connected users via Firebase Realtime Database
- **Offline Support**: Full offline functionality with automatic sync queue when connection is restored
- **Local Persistence**: Data is automatically saved to browser local storage for offline access

### Spreadsheet Editing
- **Editable Cells**: Click to select, double-click to edit cells with rich formatting
- **Smart Auto-complete**: Context-aware suggestions based on column headers (microphones, stands, sub-boxes, etc.)
- **Text Formatting**: Format text within individual cells with:
  - Bold
  - Italic
  - Underline
  - Color selection (12 preset colors)
- **Editable Headers**: Custom row and column headers with inline editing
- **Dynamic Row/Column Management**:
  - Add rows/columns at the end
  - Insert rows/columns at specific positions
  - Remove rows/columns with automatic data shifting
  - Rename headers with inline editing

### Stage & Event Management
- **Sub-Box Manager**: Configure and manage stage sub-boxes with:
  - Custom names and colors
  - Input count tracking
  - Stage position mapping (USC, MSC, DSC, USL, MSL, DSL, USR, MSR, DSR)
  - Real-time sync across all users
- **Lineup Manager**: Manage artist lineup and scheduling with:
  - Artist name, start time, and end time
  - Notes and additional information
  - File upload support (images and PDFs)
  - Drag-and-drop file management
- **CSV Export**: Download complete spreadsheet data as CSV with proper formatting and metadata

### User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile browsers
- **Collapsible Headers**: Toggle header visibility to maximize workspace
- **Connection Status**: Visual indicator showing real-time connection status
- **Sync Queue Indicator**: Shows pending changes awaiting synchronization
- **Toast Notifications**: Real-time feedback for actions, errors, and connection status
- **Modern Interface**: Clean, intuitive UI with visual feedback and smooth animations

## Technology Stack

- **Next.js 16.1.5**: React framework with App Router for server-side rendering and routing
- **React 18.2.0**: Component-based UI library for building interactive interfaces
- **Firebase Realtime Database 12.8.0**: Real-time data synchronization and cloud storage
- **Sass 1.69.5**: CSS preprocessor with SCSS modules for component-scoped styling
- **JavaScript (ES6+)**: Modern JavaScript with async/await and module support
- **Local Storage API**: Browser storage for offline persistence and sync queue management

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/legofsalmon/livepatch.git
cd livepatch
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase (Optional - works offline with demo credentials):
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Realtime Database
   - Create a `.env.local` file in the project root
   - Add your Firebase project credentials to `.env.local`:
   
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```
   
   **Note**: The application works offline with demo credentials for development and testing. For production deployment with real-time collaboration across multiple users, configure your own Firebase project.

4. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`.

### Building for Production

```bash
npm run build
npm start
```

The production-ready files will be optimized and served by Next.js.

## Usage

### Getting Started
1. **Select or Create a Spreadsheet**: On first launch, you'll see the spreadsheet selector. Choose an existing spreadsheet or create a new one.
2. **Working Offline**: The app works fully offline. Changes are saved locally and synced when connection is restored.
3. **Collaboration**: Share the same spreadsheet ID with team members for real-time collaboration.

### Spreadsheet Operations
- **Select Cell**: Click on any cell
- **Edit Cell**: Double-click on a cell or start typing when selected
- **Save Changes**: Press Enter or click outside the cell
- **Cancel Editing**: Press Escape
- **Auto-complete**: Start typing in cells to see context-aware suggestions

### Formatting
1. Select a cell
2. Use the formatting toolbar that appears above the cell
3. Click format buttons to toggle bold, italic, or underline
4. Click the color button to choose a text color

### Managing Rows and Columns
- **Edit Headers**: Click on row/column headers to rename them
- **Add Row/Column**: Click the "➕" button on any header to insert a new row/column after it
- **Remove Row/Column**: Click the "➖" button on any header to remove that row/column
- **Header Actions**: Right-click or long-press headers for quick actions

### Metadata Management
- **Edit Title**: Click the spreadsheet title at the top to rename it
- **Set Stage**: Edit the stage field to specify the performance stage
- **Set Date**: Use the date picker to set the event date

### Sub-Box Configuration
1. Click the "Sub-Boxes" button in the toolbar
2. Add, edit, or remove sub-boxes
3. Configure name, inputs, color, and stage position for each sub-box
4. Sub-box names appear as auto-complete options in relevant columns

### Lineup Management
1. Click the "Lineup" button in the toolbar
2. Add artists with name, start time, and end time
3. Add notes and upload reference files (images/PDFs)
4. Manage multiple artists for your event

### Exporting Data
- Click "Export CSV" to download the spreadsheet as a CSV file
- The exported file includes the title, stage, and date in the filename
- All headers and cell values are included in the export

### Interface Controls
- **Toggle Headers**: Click the "▲" button in the top-left to hide/show the header area for more workspace
- **Connection Status**: Monitor the connection indicator (green = connected, red = offline)
- **Sync Queue**: Check for pending changes that will sync when connection is restored

## Future Enhancements

### Planned Features
- **Enhanced Formulas**: Cell formulas and calculations for automatic totals
- **Data Validation**: Input validation and data type enforcement
- **Advanced Sorting**: Multi-column sorting and filtering capabilities
- **Import Support**: Import data from CSV and Excel files
- **User Authentication**: Secure user accounts with Firebase Authentication
- **Permission Management**: Role-based access control (viewer, editor, admin)
- **Cell Comments**: Threaded comments and discussions on cells
- **Version History**: Track changes and restore previous versions
- **Undo/Redo**: Multi-level undo/redo functionality
- **Advanced Copy/Paste**: Copy cells with formatting and formulas
- **Cell Merging**: Merge and split cells for complex layouts
- **Conditional Formatting**: Highlight cells based on conditions
- **Printing Support**: Print-optimized layouts and PDF generation

### Mobile Applications
The codebase is structured to support future native mobile apps:
- React components can be adapted for React Native
- Firebase SDK works on iOS and Android platforms
- Business logic is separated from UI components for reusability
- Next.js API routes can provide additional backend functionality

## Architecture

### Project Structure
```
livepatch/
├── app/
│   ├── layout.js              # Root layout with metadata
│   └── page.js                # Main page with spreadsheet logic
├── components/
│   ├── Cell.js                # Cell with editing, formatting, and auto-complete
│   ├── ColumnHeader.js        # Column header with rename and actions
│   ├── FormattingToolbar.js   # Text formatting controls (bold, italic, underline, color)
│   ├── LineupManager.js       # Artist lineup management with file uploads
│   ├── RowColumnActionToolbar.js  # Insert/remove row/column actions
│   ├── RowHeader.js           # Row header with rename and actions
│   ├── Spreadsheet.js         # Grid layout and cell management
│   ├── SpreadsheetSelector.js # Browse and create spreadsheets
│   ├── SubBoxManager.js       # Sub-box configuration management
│   ├── Toast.js               # Notification toast system
│   └── Toolbar.js             # Title, metadata, and action buttons
├── hooks/
│   ├── useNotifications.js    # Toast notification state management
│   └── useSyncQueue.js        # Offline sync queue management
├── lib/
│   ├── constants.js           # App constants and defaults
│   ├── firebaseConfig.js      # Firebase configuration
│   ├── firebaseOperations.js  # Firebase CRUD operations
│   └── localStorage.js        # Browser storage utilities
├── styles/
│   ├── globals.scss           # Global styles and CSS variables
│   ├── App.module.scss        # Main app layout styles
│   ├── Cell.module.scss       # Cell-specific styles
│   ├── FormattingToolbar.module.scss  # Formatting toolbar styles
│   ├── LineupManager.module.scss      # Lineup manager styles
│   ├── RowColumnActions.module.scss   # Row/column action styles
│   ├── Spreadsheet.module.scss        # Spreadsheet grid styles
│   ├── SpreadsheetSelector.module.scss # Selector screen styles
│   ├── SubBoxManager.module.scss      # Sub-box manager styles
│   ├── Toast.module.scss              # Toast notification styles
│   └── Toolbar.module.scss            # Toolbar styles
├── .gitignore                 # Git ignore rules
├── jsconfig.json              # Path aliases configuration
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies and scripts
└── README.md                  # Documentation
```

### Data Structure

Spreadsheet data stored in Firebase and local storage:
```json
{
  "spreadsheets": {
    "spreadsheet-id-123": {
      "rows": 10,
      "cols": 5,
      "cells": {
        "0-0": {
          "value": "Sub-box 1 (MSC)",
          "formatting": {
            "bold": true,
            "color": "#FF0000"
          }
        },
        "0-1": {
          "value": "Guitar",
          "formatting": {}
        }
      },
      "rowHeaders": {
        "0": "Channel 1",
        "1": "Channel 2"
      },
      "columnHeaders": {
        "0": "Sub-box",
        "1": "Input",
        "2": "Description",
        "3": "Mic/DI",
        "4": "Stand"
      },
      "subBoxes": [
        {
          "id": 1234567890,
          "name": "Sub-box 1",
          "inputs": 4,
          "color": "#ff0000",
          "stagePosition": "MSC"
        }
      ],
      "lineup": [
        {
          "id": 1234567891,
          "name": "Artist Name",
          "startTime": "19:00",
          "endTime": "20:00",
          "notes": "Main stage performance",
          "files": []
        }
      ],
      "metadata": {
        "title": "Festival Main Stage",
        "stage": "Main Stage",
        "date": "2024-06-15",
        "created": "2024-01-15T10:30:00.000Z",
        "lastModified": "2024-01-15T14:25:00.000Z"
      }
    }
  }
}
```

### Key Components

#### Spreadsheet Management
- **SpreadsheetSelector**: Displays available spreadsheets, allows creation of new ones
- **Spreadsheet**: Main grid component managing rows, columns, and cells
- **Cell**: Individual editable cell with formatting and auto-complete

#### Header Components
- **RowHeader**: Editable row labels with insert/remove actions
- **ColumnHeader**: Editable column labels with insert/remove actions
- **RowColumnActionToolbar**: Contextual action menu for headers

#### Feature Managers
- **SubBoxManager**: Modal for managing stage sub-box configurations
- **LineupManager**: Modal for managing artist lineup and schedules
- **Toolbar**: Top-level controls for title, metadata, and actions

#### Utilities
- **Toast**: System-wide notification display
- **FormattingToolbar**: Cell text formatting controls
- **useNotifications**: Hook for managing toast notifications
- **useSyncQueue**: Hook for offline change synchronization

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
