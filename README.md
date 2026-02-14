# ✈️ SkyGuide B737-800 Performance Computer

![SkyGuide Screenshot](manuals/Näyttökuva%202026-01-18%20184212.png)

**SkyGuide** is a professional-grade flight performance calculator and dispatch system designed specifically for Boeing 737-800 flight simulation enthusiasts using Microsoft Flight Simulator. It provides pilots with critical takeoff and landing data, real-world weather integration, AI-powered flight briefings, and comprehensive flight planning tools—all within a modern, aviation-themed interface.

> [!WARNING]
> **Simulation Use Only**: This application is strictly for **flight simulation purposes**. It is not certified for real-world aviation use and must never be used for actual flight planning, navigation, or operations in real aircraft.

---

## 🎯 Overview

SkyGuide transforms your flight simulation experience by providing:
- **Accurate Performance Calculations**: V-speeds, N1 thrust settings, and landing performance
- **Real-World Weather Integration**: Live METAR data via Google Gemini AI with grounding
- **AI Co-Pilot Assistant**: Context-aware flight assistant powered by Gemini 2.0
- **Flight Plan Management**: SimBrief integration and comprehensive weight & balance
- **Professional Checklists**: Interactive Boeing 737-800 checklists
- **Microsoft Flight Simulator Bridge**: Real-time data integration via FSUIPC (optional)

---

## 🚀 Key Features

### 1. 📊 Performance Calculations

#### Takeoff Performance
- **V-Speeds Computation**: Accurately calculates **V1** (Decision Speed), **VR** (Rotation Speed), and **V2** (Takeoff Safety Speed)
- **Flap Configuration Support**: Supports flap settings 1, 5, 10, and 15
- **N1 Thrust Calculation**: Provides target N1 thrust percentages accounting for:
  - Density altitude
  - Outside Air Temperature (OAT)
  - Runway conditions (DRY/WET)
- **Wind Component Analysis**: Automatic headwind/tailwind and crosswind calculations
- **Weight-Based Adjustments**: Performance varies based on actual gross weight

#### Landing Performance
- **VREF Calculation**: Reference landing speed based on landing weight and flap configuration (30/40)
- **VAPP Computation**: Approach speed with automatic wind correction (VREF + ½ headwind component)
- **Flap 30 & 40 Support**: Accurate calculations for both landing flap configurations

#### Descent Planning
- **Top of Descent (TOD)**: Calculates optimal descent point using the 3:1 glide path rule
- **Rate of Descent**: Provides recommended vertical speed for smooth approaches
- **Distance & Time**: Estimates distance and time required for descent

### 2. 🌤️ Real-World Weather Integration

- **Live METAR Data**: Fetches real-time weather from any ICAO airport code (e.g., KJFK, EGLL, EFHK)
- **Google Search Grounding**: Uses Gemini AI with Google Search grounding to ensure data accuracy
- **Automatic Sync**: Weather data automatically populates performance calculation inputs
- **Comprehensive Data**:
  - Temperature (°C)
  - Wind direction and speed
  - Airport elevation
  - QNH/Altimeter setting
  - Full METAR text

### 3. 🤖 AI Co-Pilot Assistant

Powered by **Google Gemini AI**, the AI Co-Pilot is your intelligent flight assistant:

#### Context Awareness
- Full awareness of your current flight plan
- Access to weather data and performance calculations
- Knowledge of checklist completion status
- Understanding of aircraft configuration and limitations

#### Capabilities
- **Safety Checks**: Validates weights against structural limits (MTOW, MLW, MZFW)
- **Fuel Reserve Verification**: Ensures adequate fuel reserves
- **Flight Briefings**: Generates professional departure and arrival briefings
- **Crosswind Analysis**: Analyzes crosswind components for assigned runways
- **ATC Practice**: Simulates ATC Ground Control for IFR clearance practice
- **Technical Assistance**: Answers aviation questions and provides guidance

#### AI Models
- **Gemini 2.0 Flash**: For weather grounding and general chat
- **Gemini 1.5 Pro**: For complex technical flight briefings

### 4. 📋 Flight Plan Management

#### Weight & Balance
- **Zero Fuel Weight (ZFW)**: Automatic calculation based on:
  - Empty weight (configurable via aircraft.cfg)
  - Passenger count (standard 170 lbs per passenger)
  - Cargo weight
- **Gross Weight (GW)**: Takeoff weight including fuel
- **Landing Weight**: Calculated using trip fuel consumption
- **Structural Limit Validation**: Warnings for MTOW, MLW, and MZFW exceedances

#### Fuel Planning
- **Trip Fuel**: Estimated fuel consumption based on distance
- **Reserve Fuel**: Automatic reserve calculation (typically 10% of trip fuel)
- **Block Fuel**: Total fuel required (trip + reserve)
- **Fuel Flow Modeling**: Configurable fuel flow scalar for different aircraft variants

#### SimBrief Integration
- **Direct Import**: Import flight plans from SimBrief
- **Automatic Population**: Flight plan data auto-fills origin, destination, distance, and fuel
- **Seamless Workflow**: Streamlined dispatch process from SimBrief to SkyGuide

### 5. ✅ Professional Checklists

Interactive Boeing 737-800 checklists with tap-to-complete functionality:

- **Pre-Flight Checklist**: Comprehensive pre-departure checks
- **Before Takeoff**: Final checks before departure
- **Approach Checklist**: Approach and landing preparation
- **After Landing**: Post-landing and shutdown procedures
- **Progress Tracking**: Visual indicators show completion status
- **Reset Functionality**: Quick reset for new flights

### 6. 📚 Documents Library

- **Quick Reference**: Access to aircraft reference materials
- **Performance Charts**: Boeing 737-800 performance data
- **Aircraft Configuration**: View and manage aircraft.cfg parameters
- **Reference Manual**: Integrated Boeing 737-800 reference documentation

### 7. 🔌 Microsoft Flight Simulator Bridge (Optional)

Real-time integration with Microsoft Flight Simulator via FSUIPC:

- **Python WebSocket Server**: Bridge server for FSUIPC communication
- **Live Data Sync**: Real-time aircraft state monitoring
- **Automatic Updates**: Performance data updates from simulator
- **Requirements**:
  - Python 3.x
  - `websockets` library
  - `fsuipc` library (FSUIPC SDK)

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19.2.3 with TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Styling**: Custom CSS with aviation-themed design
- **Icons**: Lucide React 0.562.0
- **Mapping**: Leaflet 1.9.4 + React Leaflet 5.0.0

### AI & Intelligence
- **AI Engine**: Google Gemini API (@google/genai 1.34.0)
  - `gemini-2.0-flash-exp` for weather grounding and chat
  - `gemini-1.5-pro` for complex technical briefings
- **Grounding**: Google Search integration for real-world data accuracy

### Backend Bridge (Optional)
- **Language**: Python 3.x
- **Libraries**: 
  - `websockets` - WebSocket server
  - `fsuipc` - Flight Simulator integration

### Development Tools
- **TypeScript**: Strict type checking with ES2022 target
- **Module System**: ESNext with bundler resolution
- **Path Aliases**: `@/*` for clean imports

---

## 📦 Installation & Setup

### Prerequisites

Ensure you have the following installed:
- **Node.js**: Version 18.0 or higher ([Download](https://nodejs.org/))
- **npm**: Usually comes with Node.js
- **Code Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))
- **Google Gemini API Key**: Required for AI features ([Get API Key](https://aistudio.google.com/))

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd b737FMC
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React and React DOM
- TypeScript and type definitions
- Vite and plugins
- Gemini AI SDK
- Leaflet mapping libraries
- Lucide React icons

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_api_key_here
```

**How to get your API key:**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env.local` file

> [!IMPORTANT]
> Keep your API key secure and never commit `.env.local` to version control. The `.gitignore` file is already configured to exclude it.

### Step 4: Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000` (or the next available port). Open this URL in your browser.

---

## 🎮 Usage Guide

### Basic Workflow

1. **Create Flight Plan**
   - Navigate to the **Flight Plan** view
   - Enter origin and destination ICAO codes (e.g., KJFK, KLAX)
   - Input passenger count, cargo weight, and fuel load
   - Click **Calculate** to compute weights and fuel requirements
   - Optionally import from SimBrief for automatic population

2. **Fetch Weather**
   - Go to the **Weather** view
   - Enter the departure airport ICAO code
   - Click **Fetch Weather** to retrieve live METAR data
   - Review temperature, wind, and altimeter settings
   - Weather data automatically syncs to Performance view

3. **Calculate Performance**
   - Navigate to the **Performance** view
   - Select **Takeoff**, **Landing**, or **Descent** mode
   - For **Takeoff**:
     - Enter assigned runway (e.g., 27R, 09L)
     - Select flap configuration (1, 5, 10, or 15)
     - Verify weight, temperature, and wind data
     - Click **Calculate** to get V1, VR, V2, and N1
   - For **Landing**:
     - Enter landing runway
     - Select flap configuration (30 or 40)
     - Click **Calculate** for VREF and VAPP
   - For **Descent**:
     - Enter cruise altitude and target altitude
     - Input ground speed
     - Calculate Top of Descent point

4. **Use AI Co-Pilot**
   - Open the **AI Co-Pilot** view
   - Ask questions about your flight plan, weather, or procedures
   - Request safety checks: "Perform a safety check"
   - Get flight briefings: "Generate a departure briefing for runway 27R"
   - Practice ATC: "I need an IFR clearance to KLAX"

5. **Complete Checklists**
   - Go to the **Checklist** view
   - Select the appropriate checklist phase
   - Tap each item to mark as complete
   - Use **Reset** button to clear all checklists for a new flight

### Advanced Features

#### SimBrief Integration
1. Create a flight plan on [SimBrief](https://www.simbrief.com/)
2. Copy your SimBrief username or flight plan ID
3. In SkyGuide's Flight Plan view, click **Import from SimBrief**
4. Enter your SimBrief username
5. Flight plan data will automatically populate

#### Aircraft Configuration
The application reads aircraft parameters from `manuals/aircraft.cfg`:
- Empty Weight
- Maximum Gross Weight (MTOW)
- Maximum Landing Weight (MLW)
- Maximum Zero Fuel Weight (MZFW)
- Fuel Flow Scalar

Edit this file to match your specific aircraft variant.

#### FSUIPC Bridge (Advanced)
For real-time integration with Microsoft Flight Simulator:

1. Install Python dependencies:
   ```bash
   cd bridge
   pip install -r requirements.txt
   ```

2. Start the bridge server:
   ```bash
   python server.py
   ```

3. The bridge will connect to FSUIPC and provide real-time data to SkyGuide

---

## 📁 Project Structure

```
b737FMC/
├── components/           # React components
│   ├── AICopilotView.tsx      # AI assistant interface
│   ├── ChecklistView.tsx      # Interactive checklists
│   ├── FlightPlanView.tsx     # Flight planning & W&B
│   ├── Layout.tsx             # Main layout wrapper
│   ├── LibraryView.tsx        # Documents library
│   ├── PerformanceView.tsx    # Performance calculations
│   ├── WeatherView.tsx        # Weather fetching
│   └── ui/                    # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── services/            # Business logic services
│   ├── aircraftService.ts     # Aircraft config parser
│   ├── geminiService.ts       # AI integration
│   ├── planParser.ts          # Flight plan parsing
│   └── simbriefService.ts     # SimBrief API
├── data/                # Static data
│   └── checklists.ts          # Checklist definitions
├── hooks/               # Custom React hooks
│   └── usePerformance.ts      # Performance calculations
├── bridge/              # FSUIPC integration (optional)
│   ├── server.py              # WebSocket bridge server
│   ├── server_efhk.py         # Airport-specific variant
│   ├── server_v3.py           # Enhanced version
│   └── requirements.txt       # Python dependencies
├── manuals/             # Reference materials
│   ├── aircraft.cfg           # Aircraft configuration
│   └── boeing737-800_ref.htm  # Reference manual
├── App.tsx              # Main application component
├── types.ts             # TypeScript type definitions
├── index.tsx            # Application entry point
├── index.css            # Global styles
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Project dependencies
└── README.md            # This file
```

---

## 🎨 UI/UX Features

### Theme Support
- **Day Mode**: Bright, professional interface for daytime use
- **Night Mode**: Dark theme optimized for cockpit lighting conditions
- Toggle between themes with the theme button in the navigation

### Responsive Design
- Optimized for desktop and tablet displays
- Aviation-themed color scheme with blue accents
- Professional typography and spacing

### Visual Feedback
- Real-time calculation updates
- Loading states for API calls
- Error handling with user-friendly messages
- Success indicators for completed actions

---

## 🔧 Available Scripts

### Development
```bash
npm run dev
```
Starts the Vite development server on `http://localhost:3000` with hot module replacement.

### Production Build
```bash
npm run build
```
Creates an optimized production build in the `dist/` folder. The build is minified and optimized for performance.

### Preview Production Build
```bash
npm run preview
```
Locally previews the production build before deployment.

---

## 🚀 Deployment

### Build for Production

1. Create production build:
   ```bash
   npm run build
   ```

2. The `dist/` folder contains the production-ready application

### Deployment Options

#### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Add `GEMINI_API_KEY` in Vercel project settings

#### Netlify
1. Connect your repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add `GEMINI_API_KEY` environment variable

#### Static Hosting
Upload the contents of `dist/` to any static hosting service (GitHub Pages, AWS S3, etc.)

> [!IMPORTANT]
> Remember to configure environment variables on your hosting platform. The `GEMINI_API_KEY` must be available at build time.

---

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes | None |
| `VITE_GEMINI_API_KEY` | Alternative variable name (Vite convention) | No | Falls back to `GEMINI_API_KEY` |

The application checks both `GEMINI_API_KEY` and `VITE_GEMINI_API_KEY` for compatibility.

---

## 🧪 Development Best Practices

### Recommended VS Code Extensions
- **ESLint**: Code quality and linting
- **Prettier**: Consistent code formatting
- **TypeScript Vue Plugin (Volar)**: Enhanced TypeScript support
- **Error Lens**: Inline error highlighting

### Code Style
- TypeScript strict mode enabled
- ES2022 target for modern JavaScript features
- Path aliases (`@/*`) for clean imports
- Component-based architecture
- Separation of concerns (components, services, hooks)

### Type Safety
All components and services are fully typed with TypeScript interfaces defined in `types.ts`:
- `FlightPlanData`
- `WeatherData`
- `PerformanceState`
- `TakeoffInputs`
- `LandingInputs`
- `DescentInputs`
- And more...

---

## 📊 Performance Calculation Details

### V-Speed Calculations
The application uses industry-standard formulas accounting for:
- Aircraft weight
- Pressure altitude (density altitude)
- Temperature
- Flap configuration
- Runway conditions

### N1 Thrust Calculation
N1 percentages are calculated based on:
- Density altitude (pressure altitude + temperature correction)
- Aircraft weight
- Takeoff configuration

### Landing Speed Calculation
- **VREF**: Base reference speed for landing weight and flap configuration
- **VAPP**: VREF + wind correction (½ headwind component, minimum +5 knots)

### Descent Planning
Uses the **3:1 rule**: For every 3 nautical miles traveled, descend 1,000 feet.

---

## 🐛 Troubleshooting

### API Key Issues
**Problem**: "API key not configured" error

**Solution**:
1. Verify `.env.local` exists in the root directory
2. Ensure the file contains: `GEMINI_API_KEY=your_key_here`
3. Restart the development server after adding the key
4. Check that the key is valid at [Google AI Studio](https://aistudio.google.com/)

### Weather Fetch Failures
**Problem**: Weather data not loading

**Solution**:
1. Verify internet connection
2. Check ICAO code is valid (4 letters, e.g., KJFK)
3. Ensure API key has Google Search grounding enabled
4. Check browser console for specific error messages

### Build Errors
**Problem**: Build fails with TypeScript errors

**Solution**:
1. Run `npm install` to ensure all dependencies are installed
2. Delete `node_modules` and `package-lock.json`, then reinstall
3. Check TypeScript version compatibility
4. Verify `tsconfig.json` is not modified

### FSUIPC Bridge Connection
**Problem**: Bridge server not connecting

**Solution**:
1. Ensure FSUIPC is installed and running in MSFS
2. Verify Python dependencies are installed: `pip install -r bridge/requirements.txt`
3. Check that MSFS is running before starting the bridge
4. Review bridge server logs for connection errors

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve SkyGuide:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and TypeScript conventions
- Add types for all new functions and components
- Test thoroughly before submitting
- Update documentation for new features

---

## 📄 License

This project is provided as-is for flight simulation use only. See the repository for license details.

---

## 🙏 Acknowledgments

- **Boeing**: For the 737-800 aircraft design and reference materials
- **Google**: For the Gemini AI API
- **SimBrief**: For flight planning integration
- **FSUIPC**: For Microsoft Flight Simulator integration
- **Microsoft**: For Microsoft Flight Simulator
- **React Team**: For the React framework
- **Vite Team**: For the blazing-fast build tool

---

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check existing documentation in the `manuals/` folder
- Review the AI Co-Pilot's capabilities for in-app assistance

---

## ⚠️ Disclaimer

**SkyGuide B737-800 Performance Computer is strictly for flight simulation use only.**

This application:
- Is NOT certified for real-world aviation use
- Must NEVER be used for actual flight planning or navigation
- Should NOT be relied upon for real aircraft operations
- Is provided WITHOUT WARRANTY of any kind
- Is intended solely for entertainment and educational purposes in flight simulation

Always use official, certified tools and follow proper procedures for real-world aviation operations.

---

**Happy Flying! ✈️**