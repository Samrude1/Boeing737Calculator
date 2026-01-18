# SkyGuide B737-800 Performance Computer

SkyGuide is a professional-grade flight performance calculator designed specifically for flight simulation enthusiasts using Microsoft Flight Simulator. It provides Boeing 737-800 pilots with critical takeoff and landing data, formatted within a modern, aviation-themed interface.

## 🚀 Key Features

### 1. Performance Calculations
*   **Takeoff Speeds**: Accurately computes **V1** (Decision), **VR** (Rotation), and **V2** (Safety) based on aircraft gross weight, flap settings (1, 5, 10, 15), and outside air temperature.
*   **N1 Power Estimation**: Provides target N1 thrust percentages for takeoff, accounting for density altitude and temperature.
*   **Landing Performance**: Computes **VREF** and **VAPP** (Approach Speed) with automatic wind correction logic (VREF + 1/2 Headwind).
*   **Descent Planning**: Calculates Top of Descent (TOD) using the 3:1 glide path rule for smooth approach planning.

### 2. Real-World Dispatch Integration
*   **Live METAR Data**: Integrated with Google Search grounding via Gemini AI to fetch real-world weather. Enter an ICAO code (e.g., KJFK, EGLL) to automatically sync Temperature, Wind Direction/Speed, and Airport Elevation.
*   **AI Safety Briefings**: Generates high-fidelity flight briefings using **Gemini AI**. These briefings analyze crosswind components for your specific assigned runway and provide professional departure/arrival procedures.

### 3. Flight Plan Management
*   **SimBrief Integration**: Import flight plans directly from SimBrief for seamless dispatch workflow.
*   **Weight & Balance**: Automatically calculates Zero Fuel Weight (ZFW), Gross Weight, and Landing Weight based on passenger count, cargo, and fuel load.
*   **Fuel Planning**: Displays trip fuel, reserve fuel, and block fuel for comprehensive fuel management.

### 4. AI Co-Pilot
*   **Context-Aware Assistant**: The AI Co-Pilot is aware of your flight plan, weather, performance calculations, and checklists.
*   **Safety Checks**: Perform automated safety checks that validate weights against structural limits (MTOW/MLW/MZFW) and verify fuel reserves.
*   **ATC Practice**: Practice IFR clearance requests with an AI acting as ATC Ground Control.

### 5. Professional Checklists
*   **Interactive Checklists**: Pre-flight, Before Takeoff, Approach, and After Landing checklists with tap-to-complete functionality.
*   **Progress Tracking**: Visual indicators show checklist completion status.

### 6. Documents Library
*   **Quick Reference**: Access to aircraft reference materials and performance charts.

## 🛠 How to Use

1.  **Create Flight Plan**: Enter origin/destination airports, passenger count, cargo, and fuel load. Click "Calculate" to compute weights.
2.  **Fetch Weather**: Navigate to Weather view, enter ICAO code, and fetch live METAR data.
3.  **Performance Setup**:
    *   Weather data automatically syncs to Performance inputs
    *   Enter your assigned runway
    *   Select flap configuration
    *   Click "Calculate" for V-speeds
4.  **Review with AI**: Use the AI Co-Pilot for safety checks and briefings.
5.  **Run Checklists**: Complete interactive checklists before each flight phase.

## 💻 Technical Details

*   **Frontend**: Built with React, TypeScript, and Tailwind CSS.
*   **Intelligence**: Powered by the **Gemini API**.
    *   `gemini-2.0-flash` for weather grounding and chat.
    *   `gemini-1.5-pro` for complex technical flight briefings.
*   **Weather Grounding**: Uses the `googleSearch` tool to ensure data matches real-world sources.

## ⚠️ Simulation Disclaimer
This application is strictly for **flight simulation use only**. It is not a real aviation tool and must never be used for actual flight planning or navigation in real aircraft.