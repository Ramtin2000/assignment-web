# Interview Platform - Frontend

A modern React application for conducting AI-powered technical interviews with real-time voice interaction.

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **OpenAI Realtime API** - Real-time voice interviews
- **Axios** - HTTP client

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Running backend API (see `assignment-api/README.md`)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001
```

### 3. Start Development Server

```bash
npm run dev
# or
npm start
```

The application will start on [http://localhost:3001](http://localhost:3001) (or the next available port).

## Available Scripts

- `npm run dev` / `npm start` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/            # Reusable UI components
│   ├── Login.js       # Authentication
│   ├── Register.js    # User registration
│   ├── RealtimeInterview.js  # Main interview component
│   └── ...
├── hooks/              # Custom React hooks
│   └── useRealtimeInterview.js  # Interview logic hook
├── context/           # React context providers
│   ├── AuthContext.js
│   └── SideNavContext.js
├── services/          # API services
│   └── api.service.js
└── lib/              # Utilities and config
    └── theme.js
```

## Features

- ✅ User authentication (Login/Register)
- ✅ Real-time voice interviews using OpenAI Realtime API
- ✅ Interview session management
- ✅ Skill-based interview generation
- ✅ Live transcript display
- ✅ Interview evaluation and feedback
- ✅ Responsive dashboard UI
- ✅ Modern, polished design system

## Key Components

### RealtimeInterview

Main component for conducting interviews with step-based flow:

- **Skills Selection** - Choose skills to be interviewed on
- **Preparation** - Review selected skills before starting
- **Active Interview** - Real-time voice interview with transcript
- **Done** - Interview completion with results

### useRealtimeInterview Hook

Custom hook managing:

- OpenAI Realtime Agent connection
- Audio transcription
- Interview state management
- Question tracking
- User input blocking during assistant speech

## UI Components

See `src/components/ui/README.md` for detailed component documentation.

## Development

The project uses:

- **Vite** for fast HMR (Hot Module Replacement)
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **React Router** for client-side routing

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## API Integration

The frontend communicates with the backend API. Ensure the API is running on the port specified in your `.env` file (default: `http://localhost:3000`).

See `assignment-api/README.md` for backend setup and API documentation.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Note:** Real-time voice features require a modern browser with Web Audio API support.
