# SHIELD by Odin-CV — AI-Powered CCTV Surveillance Frontend

> **Smart India Hackathon (SIH) 2026**
> A premium, real-time AI surveillance operations dashboard built with React + Vite + JavaScript + CSS.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Application Pages](#4-application-pages)
5. [Component Architecture](#5-component-architecture)
6. [Services and Hooks](#6-services-and-hooks)
7. [Design System](#7-design-system)
8. [Real-Time Integration](#8-real-time-integration)
9. [User Roles and Permissions](#9-user-roles-and-permissions)
10. [UI States](#10-ui-states)
11. [Routing](#11-routing)
12. [Development Phases](#12-development-phases)
13. [Getting Started](#13-getting-started)
14. [Backend Integration Checklist](#14-backend-integration-checklist)
15. [Definition of Done](#15-definition-of-done)
16. [Architecture Diagram](#16-architecture-diagram)
17. [Non-Goals](#17-non-goals)

---

## 1. Project Overview

**Odin-CV** is the operator-facing frontend of an AI-powered CCTV surveillance platform. It presents real-time camera feeds, AI detection results, alerts, footage search, face records, OSINT pipeline status, incident reports, and system settings — all in a clean, professional control-room interface.

### Core Operator Workflow

```
Dashboard (Live Cameras)
   |
Suspicious Activity Detected (AI Backend)
   |
Real-Time Alert Received
   |
Frame Priority Highlighted
   |
Operator Opens Alert -> Reviews Snapshot and Footage
   |
Searches/Tracks Entity
   |
Face Database -> Search Deeper (OSINT)
   |
OSINT Results -> Generate Incident Report
   |
Report Center
```

### What the Frontend Presents

| Feature | Description |
|---------|-------------|
| Live Camera Feeds | 4 simultaneous CCTV camera panels with status indicators |
| Detection Overlays | Bounding boxes + labels + confidence + track IDs from backend |
| Real-Time Alerts | Priority-based alerts with full lifecycle management |
| Footage Search | Natural-language + filter-based search with frame viewer |
| Face Database | Authorized face records with OSINT pipeline integration |
| Footage Database | Browse and view recorded CCTV clips |
| Reports | Incident report builder, lifecycle tracking, export |
| Live Map | Geographic/floor-plan event visualization |
| Settings | Camera, alert, AI, tracking, user, storage, and UI config |

---

## 2. Tech Stack

### Core (Implemented)

```
React 18         — UI framework
JavaScript       — Language
Vite 5           — Build tool and dev server
CSS              — Styling (vanilla, design-token based)
React Router 6   — Client-side routing
Lucide React     — Icon system
```

### Planned for Backend Integration

| Library | Purpose |
|---------|---------|
| Axios / Fetch API | REST API communication |
| Socket.IO / WebSocket | Real-time alerts and events |
| Recharts | Analytics dashboards |
| React Leaflet / Mapbox | Live map integration |

---

## 3. Project Structure

```
SIH/
|-- src/
|   |-- App.jsx                    # Root app with Router + Routes
|   |-- main.jsx                   # Entry point
|   |
|   |-- pages/                     # One file per primary page
|   |   |-- Dashboard.jsx
|   |   |-- Search.jsx
|   |   |-- Alerts.jsx
|   |   |-- FaceDatabase.jsx
|   |   |-- FootageDatabase.jsx
|   |   |-- Reports.jsx
|   |   `-- Settings.jsx
|   |
|   |-- components/
|   |   |-- layout/                # Application shell
|   |   |   |-- Navbar.jsx
|   |   |   |-- Sidebar.jsx
|   |   |   |-- PageContainer.jsx
|   |   |   `-- UserMenu.jsx
|   |   |
|   |   |-- dashboard/             # Dashboard-specific components
|   |   |   |-- MetricCard.jsx
|   |   |   |-- CameraGrid.jsx
|   |   |   |-- CameraCard.jsx
|   |   |   |-- DetectionOverlay.jsx
|   |   |   |-- PriorityEventPanel.jsx
|   |   |   |-- MapPanel.jsx
|   |   |   |-- RecentAlerts.jsx
|   |   |   |-- EventTimeline.jsx
|   |   |   `-- SystemHealth.jsx
|   |   |
|   |   |-- search/
|   |   |   |-- SearchBar.jsx
|   |   |   |-- SearchFilters.jsx
|   |   |   |-- SearchHistory.jsx
|   |   |   |-- SearchResultCard.jsx
|   |   |   `-- FrameViewer.jsx
|   |   |
|   |   |-- alerts/
|   |   |   |-- AlertTable.jsx
|   |   |   |-- AlertFilters.jsx
|   |   |   |-- AlertDetails.jsx
|   |   |   |-- AlertStatusBadge.jsx
|   |   |   `-- AlertActions.jsx
|   |   |
|   |   |-- faces/
|   |   |   |-- FaceCard.jsx
|   |   |   |-- FaceGrid.jsx
|   |   |   |-- FaceDetails.jsx
|   |   |   |-- FaceFilters.jsx
|   |   |   `-- OsintStatus.jsx
|   |   |
|   |   |-- footage/
|   |   |   |-- FootageCard.jsx
|   |   |   |-- FootageFilters.jsx
|   |   |   |-- FootageViewer.jsx
|   |   |   `-- FootageTimeline.jsx
|   |   |
|   |   |-- reports/
|   |   |   |-- ReportCard.jsx
|   |   |   |-- ReportBuilder.jsx
|   |   |   |-- ReportDetails.jsx
|   |   |   `-- ReportStatus.jsx
|   |   |
|   |   |-- settings/
|   |   |   |-- SettingsSection.jsx
|   |   |   |-- ToggleSetting.jsx
|   |   |   |-- SelectSetting.jsx
|   |   |   `-- SettingInput.jsx
|   |   |
|   |   `-- common/                # Reusable UI primitives
|   |       |-- Button.jsx
|   |       |-- Badge.jsx
|   |       |-- Modal.jsx
|   |       |-- Drawer.jsx
|   |       |-- Toast.jsx
|   |       |-- EmptyState.jsx
|   |       |-- LoadingState.jsx
|   |       |-- ErrorState.jsx
|   |       |-- OfflineState.jsx
|   |       `-- Pagination.jsx
|   |
|   |-- services/                  # All API/network calls (no direct calls in components)
|   |   |-- api.js                 # Base HTTP config, auth headers, error normalization
|   |   |-- cameraService.js
|   |   |-- alertService.js
|   |   |-- searchService.js
|   |   |-- faceService.js
|   |   |-- footageService.js
|   |   |-- reportService.js
|   |   `-- realtimeService.js     # WebSocket/Socket.IO connection manager
|   |
|   |-- hooks/                     # Reusable React hooks wrapping services
|   |   |-- useCameras.js
|   |   |-- useAlerts.js
|   |   |-- useSearch.js
|   |   |-- useFaces.js
|   |   |-- useFootage.js
|   |   |-- useReports.js
|   |   `-- useRealtime.js
|   |
|   |-- data/
|   |   `-- mockData.js            # Mock data (swapped for real API in Phase 9)
|   |
|   `-- styles/
|       |-- globals.css            # Global resets + base styles
|       `-- variables.css          # CSS design tokens
|
|-- index.html
|-- vite.config.js
|-- package.json
|-- README.md                      <- You are here
`-- ODIN_CV_FRONTEND_README.md     # Detailed master specification document
```

---

## 4. Application Pages

### Navigation Bar

```
[ ODIN-CV Logo ] | Dashboard | Search | Alerts | Face DB | Footage | Reports | Settings | Bell | User
```

| Route | Page | Description |
|-------|------|-------------|
| / | Dashboard | Live operational overview — cameras, alerts, map, timeline, metrics |
| /search | Search | Natural-language footage + event search with frame-by-frame viewer |
| /alerts | Alerts | Alert list, lifecycle management (New to Acknowledged to Investigating to Resolved) |
| /alerts/:alertId | Alert Detail | Snapshot, related footage, notes, audit trail, actions |
| /faces | Face Database | Authorized face records, OSINT pipeline trigger |
| /faces/:faceId | Face Profile | Full profile, associated events, related footage |
| /footage | Footage Database | Browse and view recorded CCTV clips |
| /footage/:footageId | Footage Viewer | Frame-level playback, event timeline, snapshot |
| /reports | Reports | Report list, builder, status tracking, export |
| /reports/new | Report Builder | Attach footage + snapshots + alerts + notes |
| /reports/:reportId | Report Detail | View generated report |
| /settings | Settings | Camera, Alert, AI, Tracking, User, Storage, Interface config |

---

### 4.1 Dashboard

The primary operational page. An operator should immediately understand:

- How many cameras are online
- Whether active alerts exist
- Which camera/event has the highest priority
- Where events are occurring
- What entities are being tracked

**Sections:**
1. Header — date/time + system status
2. Summary metric cards — Cameras, Active Alerts, Tracked Entities, System Health
3. Live camera grid — 4 panels (2x2 on desktop)
4. Priority event panel
5. Real-time map (geographic or floor-plan SVG)
6. Recent alerts panel
7. Event timeline
8. System health breakdown

**Camera Priority States:**

| State | Visual |
|-------|--------|
| Normal | Neutral border, Green ONLINE badge |
| Warning | Amber badge, optional amber border |
| High Priority | Red border, Red HIGH PRIORITY badge, alert overlay |
| Offline | Greyed out, OFFLINE badge, last-seen timestamp, Retry button |

> WARNING: Red is reserved ONLY for backend-confirmed high-priority events. Normal detections must remain visually neutral.

---

### 4.2 Search Page

- Large natural-language search input
- Filters: date, time range, camera, location, person/entity, event type, severity
- Frame-wise viewer with play/pause, prev/next, scrubber, snapshot, fullscreen
- Recent search history (click to restore query + filter state)
- Result cards: thumbnail, camera ID, timestamp, matched entity, severity

---

### 4.3 Alerts Page

- Table/list of all alerts: Alert ID, Time, Camera, Location, Entity, Event, Severity, Status, Assigned
- Filters: date, camera, severity, status, assigned operator
- Alert detail panel: snapshot, related footage, operator notes, audit info
- Alert lifecycle actions per status level:

```
NEW           -> [View] [Acknowledge] [Assign]
ACKNOWLEDGED  -> [View] [Start Investigation] [Assign]
INVESTIGATING -> [View] [Add Note] [Resolve] [Generate Report]
RESOLVED      -> [View] [Generate Report]
```

---

### 4.4 Face Database

> Privacy rule: A face match is NOT proof of identity. Use labels like "Potential Match", "Associated Face Record", "Detection Event".

- Search by name, person ID, status, date, tags
- Face card: photo, name, person ID, status, last detected, event count
- Actions: View Profile, Search Associated Footage, Search Deeper (OSINT), Generate Report

**OSINT Pipeline States:**

```
Select Record -> [Confirm] -> QUEUED -> PROCESSING -> COLLECTING -> RESULTS READY
                                                                 -> FAILED -> [Retry]
```

---

### 4.5 Footage Database

- Grid/list of recorded clips: thumbnail, camera, date, duration, event label
- Filters: camera, date, time range, event type, person/entity
- Footage viewer with event timeline, frame controls, snapshot capture

---

### 4.6 Reports

**Report types:** Suspicious Activity, Incident, Person Activity, OSINT Findings, Daily Summary

**Report lifecycle:**
```
DRAFT -> QUEUED -> GENERATING -> READY
                             -> FAILED -> [Retry]
```

Report builder: attach footage clips + snapshots + alerts + operator notes -> Save Draft or Generate.

---

### 4.7 Settings

| Section | Controls |
|---------|---------|
| Camera | Name, ID, location, stream URL, recording toggle, display ordering |
| Alerts | Enable/disable categories, severity preferences, notification sounds |
| AI / Detection | Confidence thresholds, event categories, priority mode |
| Tracking | Duration, priority, notifications, history visibility |
| User and Access | Roles: Viewer / Operator / Investigator / Administrator |
| Storage | Retention policy, backup, archive, export settings |
| Interface | Theme, density, timezone, language, date format |

---

## 5. Component Architecture

### Data Flow

```
Pages
  -> Custom Hooks (useAlerts, useCameras, ...)
       -> Services (alertService, cameraService, ...)
            -> api.js / realtimeService.js
                 -> Backend API / WebSocket
```

This strict separation ensures pages never call APIs directly and mock data can be swapped for real APIs without touching components.

### Key Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| Navbar | Navigation, notification bell, user menu, system status |
| CameraCard | Frame display, status badge, detection overlay, priority state, actions |
| DetectionOverlay | Render backend-provided bounding boxes, labels, confidence, track IDs only |
| FrameViewer | Frame display, play/pause, prev/next, scrubber, snapshot, fullscreen |
| AlertDetails | Alert info, snapshot, related footage, notes, available actions |
| MapPanel | Camera markers, event markers, selection, map status |
| OsintStatus | Display pipeline stage: Queued -> Processing -> Collecting -> Ready / Failed |

---

## 6. Services and Hooks

### Services

| File | Key Methods |
|------|------------|
| api.js | Base URL, auth headers, error normalization, timeout |
| cameraService.js | getCameras(), getCamera(id), getCameraStatus(id) |
| alertService.js | getAlerts(), acknowledgeAlert(id), assignAlert(id, user), resolveAlert(id), addNote(id, note) |
| searchService.js | searchFootage(query, filters), getSearchHistory(), getFrame(...) |
| faceService.js | getFaces(), getFace(id), startOsint(id), getOsintStatus(id) |
| footageService.js | getFootage(...), getFootageById(id), getFrames(...) |
| reportService.js | getReports(), createReport(data), generateReport(id), exportReport(id) |
| realtimeService.js | WebSocket connect/subscribe/reconnect/close, normalized event dispatch |

### Custom Hooks

| Hook | Returns |
|------|---------|
| useCameras | cameras, loading, error, refresh |
| useAlerts | alerts, loading, error, refresh |
| useSearch | query, filters, results, loading, search(), clear() |
| useFaces | faces, loading, error, refresh |
| useFootage | footage, filters, loading, error |
| useReports | reports, loading, error, refresh |
| useRealtime | connected, connectionError, subscribe(), unsubscribe() |

---

## 7. Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Background | #F5F5F5 | Page background |
| Surface | #FFFFFF | Cards, navbar |
| Primary Text | #171717 | Headings |
| Secondary Text | #525252 | Descriptions |
| Muted Text | #737373 | Placeholders |
| Accent | #EA580C | Active states, key actions, links |
| Accent Light | #FFEDD5 | Selected/hover backgrounds |
| Critical | #EF4444 | High-priority alerts only |
| Warning | #F59E0B | Review-required states |
| Success | #22C55E | Online, healthy, resolved |
| Info | #3B82F6 | Informational states |

### Typography

- Font: Inter / Geist / Manrope (Google Fonts)
- Page title: 28-36px semibold
- Section title: 18-22px semibold
- Body: 14-16px
- Metadata / labels: 11-14px

### Spacing Scale

4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px

### Border Radius

- Badges: 6px or pill
- Inputs / Buttons: 8-12px
- Cards: 14-20px
- Large panels: 20-24px

---

## 8. Real-Time Integration

### WebSocket Events Listened

| Event | Action |
|-------|--------|
| camera:connected | Mark camera online, update UI |
| camera:disconnected | Mark camera offline, show last-seen + retry |
| alert:new | Increment counter, show notification, update panels |
| alert:updated | Update existing alert in place (no duplicate) |
| alert:resolved | Remove from active count, update status |
| frame:priority_changed | Update camera/frame priority state |
| tracking:started | Increment tracked-entity count |
| tracking:updated | Update entity tracking data |
| tracking:stopped | Update entity tracking state |
| report:completed | Update report status, show success notification |
| osint:updated | Update OSINT pipeline status/results |

### Data Sources (Phase 9)

- REST API — queries, alerts, footage, faces, reports
- WebSocket / Socket.IO — real-time events
- WebRTC or HLS — live camera video streams
- Backend search, report, and OSINT APIs

---

## 9. User Roles and Permissions

| Action | Viewer | Operator | Investigator | Administrator |
|--------|--------|----------|--------------|---------------|
| View cameras | Yes | Yes | Yes | Yes |
| View alerts | Yes | Yes | Yes | Yes |
| Acknowledge alerts | No | Yes | Yes | Yes |
| Investigate alerts | No | Yes | Yes | Yes |
| Search footage | Yes | Yes | Yes | Yes |
| Search Deeper / OSINT | No | No | Yes | Yes |
| Generate reports | No | Yes | Yes | Yes |
| Change system settings | No | No | No | Yes |

> The backend is the authority for actual authorization. The frontend hides restricted UI elements based on role but does not enforce security.

---

## 10. UI States

Every page and component must handle all of these states, not just the success state:

| State | Example |
|-------|---------|
| Loading | Skeleton loaders / spinners |
| Loaded | Normal data display |
| Empty | "No recent alerts" with icon + guidance |
| Error | "Unable to load data. [Retry]" |
| Offline | "Camera offline — last seen 21:39 [Retry]" |
| Permission Denied | "You do not have permission to access this." |
| Processing | OSINT progress bar: 80% — Collecting results... |
| Success | "Report generated successfully" |
| No Search Results | "No matching footage found. Try different search terms." |

---

## 11. Routing

```
/                   -> Dashboard
/search             -> Search
/alerts             -> Alerts list
/alerts/:alertId    -> Alert detail
/faces              -> Face Database
/faces/:faceId      -> Face profile
/footage            -> Footage Database
/footage/:footageId -> Footage viewer
/reports            -> Reports list
/reports/new        -> Report builder
/reports/:reportId  -> Report detail
/settings           -> Settings
*                   -> 404 Not Found page
```

---

## 12. Development Phases

| Phase | Status | Focus |
|-------|--------|-------|
| 1 — Foundation | In Progress | Vite + React + CSS, routing, design tokens, Navbar, common components |
| 2 — Dashboard | In Progress | Header, metrics, 4 camera cards, alert overlays, map placeholder, timeline |
| 3 — Search | In Progress | Search input, filters, history, mock results, frame viewer |
| 4 — Alerts | In Progress | Alert table, filters, detail panel, full lifecycle actions |
| 5 — Face DB | In Progress | Face cards, profile, Search Deeper, OSINT state/result UI |
| 6 — Footage | In Progress | Footage list, filters, viewer, timeline, frame controls, snapshot |
| 7 — Reports | In Progress | Report list, builder, status states, export UI |
| 8 — Settings | In Progress | Grouped sections, toggles, selects, permission-aware controls |
| 9 — Backend Integration | Planned | Replace mock data with real APIs, connect streams + WebSocket events |
| 10 — Testing and Polish | Planned | Responsive, all UI states, keyboard nav, accessibility, performance, browser compat |

---

## 13. Getting Started

### Prerequisites

- Node.js version 18 or higher
- npm version 9 or higher

### Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at http://localhost:5173 by default.

### Other Scripts

```bash
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint check
```

### Environment Variables

Create a .env file in the project root for public config values:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

Never store secrets or API keys in frontend source code or .env files committed to git.

---

## 14. Backend Integration Checklist

Before connecting the real backend, confirm the following with the backend team:

### Gateway

- [ ] Gateway base URL
- [ ] Health check endpoint
- [ ] Authentication scheme (JWT, session, API key)
- [ ] CORS configuration
- [ ] Error response schema

### Camera Streams

- [ ] Stream format (WebRTC / HLS / MJPEG)
- [ ] Camera / source ID field
- [ ] Connection status endpoint
- [ ] Frame delivery mechanism
- [ ] Timestamp format

### Detection Schema

Confirm exact field names and types for:
- [ ] Human detection (class, confidence, track_id, bbox)
- [ ] Vehicle detection (class, type, confidence, bbox)
- [ ] Face detection (face_id, confidence, bbox)
- [ ] ANPR (plate_number, confidence, bbox)
- [ ] Priority level vocabulary (NORMAL / WARNING / HIGH / CRITICAL)

### Alerts

- [ ] Alert ID format
- [ ] Severity vocabulary
- [ ] Status vocabulary
- [ ] Timestamp format
- [ ] Snapshot URL format

### Search

- [ ] Search endpoint URL
- [ ] Filter parameter schema
- [ ] Result schema
- [ ] Frame retrieval method
- [ ] Footage retrieval method

### Face Database

- [ ] Face record schema
- [ ] Authorization check endpoint
- [ ] OSINT trigger endpoint
- [ ] OSINT status polling endpoint
- [ ] OSINT result schema

### Reports

- [ ] Create report endpoint
- [ ] Generate report endpoint
- [ ] Status polling
- [ ] Export/download endpoint
- [ ] Archive endpoint

---

## 15. Definition of Done

The frontend is ready for backend integration when:

- [ ] All 7 primary pages exist and navigation works
- [ ] Dashboard displays 4 camera panels with all status states
- [ ] Detection overlays are implemented (bounding boxes + labels)
- [ ] Priority/alert state is visually differentiated
- [ ] Alert overlays and notification panel are implemented
- [ ] Search UI with filters and frame viewer is complete
- [ ] Alerts page with full lifecycle is complete
- [ ] Face database with cards, profile, OSINT confirmation, and result states exists
- [ ] Footage database with viewer, timeline, frame controls, snapshot is complete
- [ ] Report builder, report list, and status lifecycle exist
- [ ] Settings page is organized into all sections with permission-aware controls
- [ ] All UI states exist: Loading, Empty, Error, Offline, Permission Denied, Processing, Success, No Results
- [ ] Mock data is cleanly separated from API services
- [ ] Responsive layout works on desktop, tablet, and mobile
- [ ] Keyboard navigation works for interactive controls
- [ ] No secrets or sensitive data are stored in frontend source
- [ ] Tested in the target browser

---

## 16. Architecture Diagram

```
                         ODIN-CV FRONTEND
                                |
                         React + Vite + CSS
                                |
              +------------------+------------------+
              |                  |                  |
            PAGES           COMPONENTS          SERVICES
              |                  |                  |
       +------+------+           |           +------+-------+
       |      |      |           |           |      |       |
   Dashboard Search Alerts   CameraCard    REST  WebSocket  Mock
   Faces   Footage Reports   FrameViewer    |      |       |
   Settings              AlertDetails      |      |       |
                          MapPanel         |      |       |
                          OsintStatus      +------+-------+
                                                  |
                                            GATEWAY :8000
                                                  |
                +----------------------------------+-------------------+
                |                                 |                   |
                v                                 v                   v
          Human Detection                Vehicle Detection           ANPR
              :8001                          :8002                  :8004
                |                                 |                   |
                +---------------------------------+-------------------+
                                                  |
                                                  v
                                          FRONTEND DISPLAY
```

Core Principle: The frontend presents the intelligence of the backend in a clear operator workflow. It does not perform the intelligence itself.

---

## 17. Non-Goals

The frontend does NOT implement:

- Computer-vision or face-recognition algorithms
- Vehicle detection or ANPR algorithms
- Suspicious-activity detection
- Frame-prioritization algorithms
- Video-stream processing or encoding
- Camera tracking algorithms
- OSINT data collection
- Backend database logic
- Report-generation logic

All of the above are handled by backend microservices. The frontend only presents their output and sends user actions back via API.

---

*Built for Smart India Hackathon (SIH) 2026 | Odin-CV Frontend | README v2.0*
#   O D I N _ C V _ F R O N T E N D  
 #   O D I N _ C V _ F R O N T E N D  
 