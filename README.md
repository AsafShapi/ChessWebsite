# Chess Game

A real-time multiplayer chess application built with React and Node.js, featuring user authentication, friend system, and live chat.
Features

## Live Demo

Visit the live application at [https://v3l0.com](https://v3l0.com)

## Project Structure

### Authentication

    Local authentication with email/password
    Google OAuth integration

### Game Features

    Real-time multiplayer chess gameplay
    Game room system with unique room codes
    Move validation and game state management
    Rematch system
    Game chat
    Move history tracking

### Social Features

    Friend system with friend requests
    Real-time friend status updates
    Private chat with friends
    User search functionality

### UI/UX

    Responsive design
    Dark/Light mode support
    Draggable chat windows
    Interactive chess board
    Move highlighting
    Game status indicators

## Technologies Used

### Frontend

    React
    Vite
    Redux Toolkit for state management
    Socket.io client for real-time communication
    React Hook Form for form handling
    Zod for form validation
    Tailwind CSS for styling
    Lucide React for icons
    React Chessboard for the chess interface
    Chess.js for chess logic

### Backend

    Node.js
    Express
    MongoDB with Mongoose
    Socket.io for real-time features
    Passport.js for authentication
    bcrypt for password hashing

## Getting Started

### Prerequisites

    Node.js
    MongoDB
    Google OAuth credentials (for Google sign-in)

### Installation

Clone the repository:

    git clone https://github.com/AsafShapi/ChessWebsite.git
    cd chess-game

Install server dependencies:

    npm install

Install client dependencies:

    cd client
    npm install

Create a dev.js file in the server/config directory with your configuration:

    module.exports = {
      googleClientID: "your_google_client_id",
      googleClientSecret: "your_google_client_secret",
      mongoURL: "your_mongodb_connection_string",
      cookieKey: "your_cookie_key"
    };

Start the development server:

From the root directory

    npm run dev

This will start both the frontend and backend servers concurrently.


## Project Structure

### Frontend (/client)

    /src/components - React components
    /src/store - Redux store and slices
    /src/context - React context providers
    /src/pages - Page components
    /src/utils - Utility functions
    /src/api - API configuration

### Backend (/server)

    /config - Configuration files
    /models - Mongoose models
    /routes - Express routes
    /services - Service layer (Socket.io, Passport)
    /middlewares - Express middlewares

## Game Flow

    Users can create a game room or join an existing one using a room code
    When two players join a room, a countdown begins
    The game starts with white's turn
    Players can:
        Make moves by dragging pieces or clicking
        Send messages in the game chat
        View move history
        Resign from the game
        Request a rematch after the game ends

## License

This project is licensed under the MIT License.

## Acknowledgments

    React Chessboard for the chess board UI
    Chess.js for chess move validation
    shadcn/ui for UI components
