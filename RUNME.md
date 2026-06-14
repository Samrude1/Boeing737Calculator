# 🛫 Quick Start Guide: SkyGuide B737-800

Welcome to the **SkyGuide B737-800 Performance Computer**. Follow this guide to get the project up and running in your local development environment.

## 🛠 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Version 18.0 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))

## 🚀 Setup & Installation

### 1. Install Dependencies
Open your terminal in the root folder and run:
```bash
npm install
```

### 2. Configure Environment Variables
The application requires a Google Gemini API Key for its AI features.
1. Create a file named `.env.local` in the root directory (if it doesn't already exist).
2. Add your API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   *You can obtain an API key from the [Google AI Studio](https://aistudio.google.com/).*

### 3. Start Development Server
Launch the application locally:
```bash
npm run dev
```
The terminal will provide a local URL (e.g., `http://localhost:5173`). Open this link in your browser to view the app.

## 🖥 IDE Best Practices (VS Code)

To get the best experience while working on this project, we recommend installing these extensions:

- **ESLint**: For code quality and linting.
- **Prettier**: For consistent code formatting.
- **Tailwind CSS IntelliSense**: For autocompletion of CSS classes.
- **TypeScript Vue Plugin (Volar)**: (Optional) If you use Vue-related features, otherwise standard TS support is built-in.

---

## ✈️ Key Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Creates a production-ready build in the `dist` folder.
- `npm run preview`: Locally previews the production build.

## ⚠️ Important Note
This application is strictly for **flight simulation use only**. It is not a real aviation tool and must never be used for actual flight planning or navigation in real aircraft.
