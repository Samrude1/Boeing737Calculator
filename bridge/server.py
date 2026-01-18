import asyncio
import websockets
import json
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
# Silence SimConnect version warnings
logging.getLogger("SimConnect.SimConnect").setLevel(logging.CRITICAL)

print("VERSION: FSX_FALLBACK_V3")

# Try to import SimConnect
try:
    from SimConnect import SimConnect, AircraftRequests
    HAS_SIMCONNECT = True
except ImportError:
    print("SimConnect library not found. Falling back to internal mock.")
    HAS_SIMCONNECT = False

async def handler(websocket):
    print("Client connected")
    
    sm = None
    aq = None
    
    # Attempt Connection
    if HAS_SIMCONNECT:
        try:
            sm = SimConnect()
            aq = AircraftRequests(sm, _time=2000)
            print("Connected to Simulator via SimConnect!")
        except Exception as e:
            print(f"Connection Failed (FSX/Old Sim?): {e}")
            print("Using MOCK mode (EFHK - Vantaa)")
            sm = None
    
    try:
        while True:
            data = {}
            if sm and aq:
                try:
                    # Real Data
                    lat = aq.get("PLANE_LATITUDE")
                    lon = aq.get("PLANE_LONGITUDE")
                    alt = aq.get("PLANE_ALTITUDE")
                    ias = aq.get("AIRSPEED_INDICATED")
                    gs = aq.get("GROUND_VELOCITY")
                    
                    if lat is None: raise ValueError("No Data")

                    data = {
                        "connected": True,
                        "mock": False,
                        "lat": lat,
                        "lon": lon,
                        "alt": alt,
                        "ias": round(ias) if ias else 0,
                        "gs": round(gs) if gs else 0
                    }
                except Exception as e:
                    print(f"SimConnect Read Failed: {e}")
                    print("This library requires MSFS 2020. Switching to EFHK Fallback.")
                    sm = None # Force complete fallback
            
            if not sm:
                # Mock Data (Stationary at EFHK)
                data = {
                    "connected": True,
                    "mock": True,
                    "lat": 60.3172, # EFHK Exact
                    "lon": 24.9633,
                    "alt": 179, # EFHK Elevation
                    "ias": 0,
                    "gs": 0
                }

            await websocket.send(json.dumps(data))
            await asyncio.sleep(0.5)

    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")
    except Exception as e:
        print(f"Handler Error: {e}")
    finally:
        if sm:
            try:
                sm.exit()
            except:
                pass

async def main():
    stop = asyncio.Event()
    try:
        async with websockets.serve(handler, "localhost", 8080):
            print("WebSocket Server Started on ws://localhost:8080")
            print("Press Ctrl+C to stop")
            await stop.wait() 
    except Exception as e:
        print(f"Server Error: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer Stopped")
    except Exception as e:
        print(f"Critical Startup Error: {e}")
