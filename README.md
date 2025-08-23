# Introduction

This project is a **Flight Scenario Simulation Platform** that lets you **design, play, and analyze realistic airspace situations** by combining real-time aircraft trajectories with **3D danger zones** rendered on a Cesium globe.  

You can:  
- Create and save custom **flight paths**  
- Run them as **live scenarios**  with options like pause and playspeed
- Danger zones: Continuously monitor whether aircraft penetrate **restricted 3D volumes** defined by altitude-bounded polygons
  
**Note: install instructions are at the bottom of the readme**

---
## Create Trajectories

The platform allows you to design custom aircraft trajectories directly on the 3D globe.
You can place waypoints by selecting points on the map and build a continuous path that represents the aircraft’s planned route.
Once sent to the server, the server calculates the positions of each plane at any point, based on its trajectory and configured velocity.

Example visualization:

<img width="1920" height="1080" alt="CreateTrajectoryScenario" src="https://github.com/user-attachments/assets/b2ee287e-bdc6-4332-b426-1572742bb275" />


---
## Playing a Scenario

Once a scenario is selected, the system begins live playback of all aircraft within it.
Now the server Sends all of the points and data about the planes at REAL TIME, And Client present them on the globe.
There is also a "tail" behing every plane, that represents the last 30 point of the plane.

Example visualization:


![PlaneFlying](https://github.com/user-attachments/assets/172c6a24-76b6-4d90-aafa-b1a4470e03b3)


---

## Creating Danger Zones

The platform allows you to define 3D restricted airspace volumes directly on the globe.
Danger zones are created as polygons with:
- Latitude and longitude points defining the base area
- Bottom and top altitude to define the vertical range

These zones can be added and they are fully interactive, and their visual representation is updated in real time on the Cesium globe.

Example visualization:

![CreateDangerZone](https://github.com/user-attachments/assets/e34512ba-6f39-4e9a-8b60-a6eee6b6273d)

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
