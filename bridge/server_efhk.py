import asyncio
import websockets
import json
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)

print("VERSION: PURE_EFHK_FINLAND")

async def handler(websocket):
    print("Client connected")
    try:
        while True:
            # PURE MOCK DATA - HELSINKI (EFHK)
            # EFHK Coordinates: 60.3172 N, 24.9633 E
            
            data = {
                "connected": True,
                "mock": True,
                "lat": 60.3172, 
                "lon": 24.9633,
                "alt": 179,
                "ias": 0,
                "gs": 0,
                "heading": 220
            }

            await websocket.send(json.dumps(data))
            await asyncio.sleep(0.5)

    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")
    except Exception as e:
        print(f"Handler Error: {e}")

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
