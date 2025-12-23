# * READ THE README, THERE ARE VISUAL EXAMPLES *
<br>
 
# Introduction

This project is a **Flight Simulation and Multiplayer Platform** built with a **C# (.NET) server** and a **React + Vite + TypeScript + Cesium client**, connected through a **WebSocket**.

It includes several interactive modes:

- **Drone Battle Arena:** A multiplayer drone battle game. 
- **Real Planes Mode:** Displays real-world aircraft using live ADS-B data.  
- **Scenarios And Danger Zones:** Create, edit, and play custom aircraft trajectories with adjustable speed and live playback to **all clients**. Define and monitor 3D restricted airspace volumes that trigger alerts when entered. 
- **Free Flight Mode:** Explore freely in a multiplayer environment with smooth controls and switchable camera views.

### ***The system is built to allow global access through ngrok, so clients can connect from anywhere in the world.**

**Note:** Installation instructions are at the bottom of the README.

---
# JAMMERS

**JAMMERS**  
SO COOLLL!!!!!


## Example visualization:

https://github.com/user-attachments/assets/8cfaa464-137d-4f60-8ac8-e2fda84bf8ba


---


# Drone Battle Arena

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



## Example visualization:

https://github.com/user-attachments/assets/b82a1f63-82aa-42d1-8dd4-f119dda77c62

https://github.com/user-attachments/assets/dfc53b62-9dfd-49a0-9c02-7f0bbc2d69ac

https://github.com/user-attachments/assets/addc25d6-d743-4f9f-8c78-0bb5e487a8b8

https://github.com/user-attachments/assets/5a3e8d36-48b4-4537-bbbb-90774c64840a

---

# ✈️ Real Planes Mode

**A live mode that displays real-world aircraft using ADS-B data.**  
Planes are shown on the map in real time, based on their actual positions and flight information.
I can also automatically fly to a specific plane by typing his ID.

###  Performance Optimization
To keep performance smooth, the rendering changes with distance:

- **Long-range:** aircraft are displayed as simple dots for efficiency.  
- **Close-range:** detailed 3D aircraft models appear for a realistic view.  



### Data Source
Powered by **OpenSky, ADSB (Automatic Dependent Surveillance–Broadcast)** data, providing real-time flight positions and identifiers.
Data updated every 2 minutes (because of the limit of the requests i can make to OpenSky's API a day..)

## Example visualization (a bit laggy, there is a lot of data..):

https://github.com/user-attachments/assets/4f55ad30-bf07-41e1-ab64-7536c2fee726

https://github.com/user-attachments/assets/812b6e77-d36e-4b66-be23-f817e6861826

---

# Scenarios And Danger Zones

## Scenarios

The platform allows you to design custom aircraft trajectories directly on the 3D globe.
You can place waypoints by selecting points on the map and build a continuous path that represents the aircraft’s planned route.
<br>**Each scenario can be removed or edited whenever you wish.**
Once sent to the **server**, the server calculates the positions of each plane at any point, based on its trajectory and configured velocity.
<br><br>**When a scenario added/edited/removed by one client, the server sends it to the rest of the clients** 


## Example visualization:

![CreateTrajectory](https://github.com/user-attachments/assets/e95facdb-ae60-4f68-a654-99a47bf89887)


## Playing a Scenario

Once a scenario is selected, the system begins live playback of all aircraft within it.
Now the **server** Sends all of the points and data about the planes at **real time**, And Client present them on the globe.
There is also a "tail" behing every plane, that represents the last 30 point of the plane.
<br><br>**When a scenario is played, there is a pause and resume, and you can also change playspeed**
<br>**When a scenario is played the server broadcasts it to every client**

## Example visualization:


![PlaneFlying](https://github.com/user-attachments/assets/172c6a24-76b6-4d90-aafa-b1a4470e03b3)

![_Flight-simulator - Google Chrome_ 2025-08-23 22-13-14](https://github.com/user-attachments/assets/6888a5e8-e5af-46d0-9825-c0b595e348a5)


## Danger Zones

The platform allows you to define 3D restricted airspace volumes directly on the globe.
Danger zones are created as polygons with:
- Latitude and longitude points defining the base area
- Bottom and top altitude to define the vertical range

These zones can be added and they are fully interactive, and their visual representation is updated in real time on the Cesium globe.
<br><br>**Each DangerZone can be removed or edited whenever you wish.**
<br>**When a danger zone added/edited/removed by one client, the server sends it to the rest of the clients** 

## Example visualization:

![CreateDangerZoneNew](https://github.com/user-attachments/assets/65c997b1-fc5e-448b-baf1-483abe780796)



## Danger Zone in Action

When a plane enters a danger zone, the zone will **blink between red and yellow**, providing a clear visual alert.
Before sending each new position update to the client, the **server** calculates the plane’s location relative to all danger zones.
It checks whether the plane is inside any zone, including both horizontal boundaries and altitude range.
If a plane is within a zone, the clients trigger the blinking effect.
This ensures that alerts and visual feedback are synchronized with live scenario playback in real time.

## Example visualization:

![DangerZoneBlink](https://github.com/user-attachments/assets/4d08b0d6-71bc-4d30-8adf-c6b8d542a0f2)

---



# Free Flight Mode

**Experience true freedom of flight in a shared multiplayer world.**  

#### Flight Controls
- Full **360° movement freedom**  
- Complete **rotational control**  
- Smooth **altitude and position adjustments** for precise navigation  

#### Multiplayer Interaction
- See other pilots flying **in real time**  
- Movements are fully **synchronized across all clients**  

#### Camera Modes
- **First-person view:** immersive cockpit-like perspective  
- **Third-person view:** dynamic chase camera  

## Example visualization:

https://github.com/user-attachments/assets/b7556dec-b39c-484e-8c1c-29711d135b6b

---

## Architecture Overview

**Client:** React + Vite + TypeScript + Cesium  
**Server:** C# (.NET)  
Communication between them is done in real time over a **WebSocket** connection.

### Drone Battle Arena
- **Client:** Renders drones, arena, bullets, UI (kill feed, minimap, indicators).  
- **Server:** Handles player movements, kills, respawns, and sync.

### Real Planes Mode
- **Client:** Fetches and filters real ADS-B data, and displays live aircraft with distance-based rendering (dots/models).  

### Scenarios
- **Client:** Allows building and visualizing flight paths.  
- **Server:** Calculates positions along trajectories and streams them in real time to **every client**.

### Danger Zones
- **Client:** Draws interactive 3D restricted zones and visual alerts.  
- **Server:** Detects plane–zone intersections and triggers alerts and sends in to **every client**.

### Free Flight Mode
- **Client:** Provides flight controls, camera modes, and multiplayer rendering.  
- **Server:** Syncs player movement and manages shared airspace state.

  
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
