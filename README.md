# Introduction
 
This project is a **Flight Scenario Simulation Platform** that lets you **design, play, and analyze realistic airspace situations** by combining real-time aircraft trajectories with **3D danger zones** rendered on a Cesium globe.  

You can:  
- Create and save custom **flight paths**  
- Run them as **live scenarios**  with options like pause and playspeed
- Danger zones: Continuously monitor whether aircraft penetrate **restricted 3D volumes** defined by altitude-bounded polygons
  
**Note: install instructions are at the bottom of the readme**

---
# 🛩️ Drone Battle Arena

**A multiplayer drone battle game.**  
Fly, fight, and survive against other drones in a fast-paced 3D arena.



### 🎮 Gameplay
- Control a drone and shoot other players.  
- Leave the arena → you’re destroyed.  
- Get killed → you respawn at a random spot.  
- Includes:
  -  Kill indicator  
  -  Kill feed  
  -  Minimap (you = green, enemies = red)

Example visualization:


https://github.com/user-attachments/assets/6fa20c1f-6ca8-43a6-b3ec-871abb877180

https://github.com/user-attachments/assets/dfc53b62-9dfd-49a0-9c02-7f0bbc2d69ac

https://github.com/user-attachments/assets/addc25d6-d743-4f9f-8c78-0bb5e487a8b8

https://github.com/user-attachments/assets/5a3e8d36-48b4-4537-bbbb-90774c64840a



---

---
## Scenarios

The platform allows you to design custom aircraft trajectories directly on the 3D globe.
You can place waypoints by selecting points on the map and build a continuous path that represents the aircraft’s planned route.
**Each scenario can be removed or edited whenever you wish.**
Once sent to the server, the server calculates the positions of each plane at any point, based on its trajectory and configured velocity.

Example visualization:

![CreateTrajectory](https://github.com/user-attachments/assets/e95facdb-ae60-4f68-a654-99a47bf89887)


---



## Playing a Scenario

Once a scenario is selected, the system begins live playback of all aircraft within it.
Now the server Sends all of the points and data about the planes at REAL TIME, And Client present them on the globe.
There is also a "tail" behing every plane, that represents the last 30 point of the plane.
**When scenario is played, there is a pause and resume, and you can also change playspeed**

Example visualization:


![PlaneFlying](https://github.com/user-attachments/assets/172c6a24-76b6-4d90-aafa-b1a4470e03b3)

![_Flight-simulator - Google Chrome_ 2025-08-23 22-13-14](https://github.com/user-attachments/assets/6888a5e8-e5af-46d0-9825-c0b595e348a5)




---

## Danger Zones

The platform allows you to define 3D restricted airspace volumes directly on the globe.
Danger zones are created as polygons with:
- Latitude and longitude points defining the base area
- Bottom and top altitude to define the vertical range

These zones can be added and they are fully interactive, and their visual representation is updated in real time on the Cesium globe.
**Each DangerZone can be removed or edited whenever you wish.**

Example visualization:

![CreateDangerZoneNew](https://github.com/user-attachments/assets/65c997b1-fc5e-448b-baf1-483abe780796)

---

## Danger Zone in Action

When a plane enters a danger zone, the zone will **blink between red and yellow**, providing a clear visual alert.
Before sending each new position update to the client, the server calculates the plane’s location relative to all danger zones.
It checks whether the plane is inside any zone, including both horizontal boundaries and altitude range.
If a plane is within a zone, the client triggers the blinking effect.
This ensures that alerts and visual feedback are synchronized with live scenario playback in real time.

Example visualization:

![DangerZoneBlink](https://github.com/user-attachments/assets/4d08b0d6-71bc-4d30-8adf-c6b8d542a0f2)

---

## Architecture Overview

**Client (Vite + React + TypeScript + Cesium)**  
- Handles **3D visualization**
- Provides **scenarios**
- Provides **scenario controls**  
- Provides **danger zones**  
- Displays **real-time user feedback**  

**Server (C#)**  
- calculates **full trajectories**
- Performs **geometric and altitude-aware checks**  
- Returns **structured results** for the UI

  
---

## Installation
first clone the repo in VSCODE.
```bash
git clone https://github.com/AdamNebrat123/flight-simulator.git
cd flight-simulator/
```

### Client (React + Vite + TypeScript + Cesium)
Navigate to the client folder and install dependencies:

```bash
cd flight-simulator/ReactClient/
npm install
```
To start the client in development mode:
```bash
npm run dev
```

### Server (C#)
Navigate to the server folder and restore NuGet packages:
```bash
cd flight-simulator/Server/
dotnet restore
```
To run the server:
```bash
dotnet run
```

## Running the Application
Start the Server first:
```bash
cd flight-simulator/Server/
dotnet run
```
Then start the ReactClient:
```bash
cd flight-simulator/ReactClient/
npm run dev
```
EXPLORE AND DO WHAT YOU WANT!
