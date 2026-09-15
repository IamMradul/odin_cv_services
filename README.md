# Odin-CV — System Architecture & Team Onboarding

## 1. What this project is

A CCTV-style surveillance system with 8 independent detection/analysis capabilities running on live camera feeds (initially phones acting as cameras) and on historical footage (including low-light / jungle-border footage per the problem statement). Results from all capabilities are shown live in a single web frontend, replicating a real multi-camera CCTV control room.

**The 8 components and owners:**


| # | Component | Owner |
|---|---|---|
| 1 | Human detection & tracking |  |
| 2 | Vehicle detection & classification | Siddharth |
| 3 | Face detection | Mradul |
| 4 | ANPR (number plate recognition) | Siddharth |
| 5 | Virtual fence intrusion detection | Akshat |
| 6 | Suspicious activity detection | You |
| 7 | Night-time movement detection | Akshat |
| 8 | Real-time alert generation & event logging | Mayank |
| — | Deeper OSINT work | Mradul |

## 2. Core architectural principle

**Every component is a fully independent microservice.** Each one:
- Runs as its own container/process
- Has its own codebase folder, own dependencies, own model weights
- Exposes a small HTTP contract (below) — nothing more is required to integrate

This is what guarantees the hard requirement: **if one service crashes, the others keep running.** Isolation comes from process/container boundaries and the gateway's error handling — not from any code discipline inside a service. You can write your service in a completely different way from someone else's, as long as it speaks the same HTTP contract.

## 3. The shared contract (read this before writing any code)

Every service, regardless of who builds it or what model it uses internally, must expose:

**`GET /health`**
```json
{ "status": "ok", "service": "<your-service-name>" }
```
Used by the gateway to check a service is alive before/while routing to it.

**`POST /detect`** (or a task-appropriate name — see note below)
- Input: `multipart/form-data` with a single image file field named `frame`
- Output (always this shape, only the `detections` payload differs per service):
```json
{
  "service": "<your-service-name>",
  "ok": true,
  "detections": [ ... your service's results ... ],
  "error": null
}
```
On any internal failure, return `ok: false` and a message in `error` — **never let an exception escape and crash the process.** Wrap your endpoint body in try/except, always return a valid `DetectionResponse`-shaped object.

Note on naming: components that aren't strictly "detect a box in one frame" (e.g. suspicious activity detection, which likely needs a short sequence of frames, or alert generation, which reacts to other services' outputs rather than raw frames) can adapt the endpoint name and input shape — but keep the `{service, ok, result/detections, error}` response envelope so the gateway and frontend can handle every service generically. If your component's input/output genuinely can't fit an image-in/JSON-out shape, flag it in the group chat before building — better to agree on the shape now than reconcile four different formats later.

## 4. Repo structure

```
odin-cv/
├── gateway/                        # routes requests to services, isolates failures
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── services/
│   ├── human-detection/            # done (Siddharth)
│   ├── vehicle-detection/          # done (Siddharth)
│   ├── anpr/                       # in progress (siddharth)
│   ├── suspicious-activity/        # Siddharth
│   ├── face-detection/             # Mradul
│   ├── virtual-fence/              # Akshat
│   ├── night-movement/             # Akshat
│   └── alert-logging/              # Mayank
│       └── <each folder internally>
│           ├── app/
│           │   ├── main.py         # FastAPI app, /health + /detect
│           │   ├── model.py        # your detection/model logic, isolated from main.py
│           │   └── schemas.py      # pydantic request/response models
│           ├── requirements.txt
│           └── Dockerfile
├── test/                           # ALL local testing lives here, not in service folders
│   ├── models/                     # test-only model weight files (gitignored)
│   ├── videos/                     # test video clips (gitignored)
│   ├── outputs/                    # annotated test outputs (gitignored)
│   ├── loader.py                   # shared helper to import any service's model.py directly
│   ├── test_<service>.py           # one per service, standalone quick test
│   └── combined_test.py            # runs multiple services on one video at once
├── docker-compose.yml              # one entry per service, wires everything together
└── ARCHITECTURE.md                 # this file
```

**Rules for every service folder:**
- No test videos, no downloaded model weights for testing, no scratch scripts inside `services/<your-service>/`. 
Those go in `test/`. This keeps Docker build contexts small and your folder clean for review.
- `model.py` should be importable and testable on its own, independent of FastAPI — this is what lets `test/loader.py` load and test your detection logic directly without spinning up a server.
- Each service manages its own `requirements.txt`. Don't assume others have your dependencies installed.

## 5. Data flow

**Live mode (phone as camera):**
```
Phone browser (getUserMedia) → captures frame every ~100-200ms
   → POST to Gateway /process-frame
      → Gateway fans out to every service's /detect in parallel, each in its own try/except
         → each service returns its JSON independently
      → Gateway merges all responses into one combined JSON
   → Frontend renders combined result live (boxes, labels, alerts) over the video feed
```
If any one service is down/slow/erroring, the gateway still returns results from the others — the frontend just shows that one field as unavailable, nothing else breaks.

**Historical footage mode (jungle/border footage, past recordings):**
```
User selects a video from history, clicks "Analyse"
   → kicks off a background job (not a synchronous request — videos are long)
   → job reads the video frame-by-frame (sampled, not every frame)
   → each sampled frame goes through the same service /detect calls as live mode
   → results are stored with timestamps
   → frontend polls/fetches the job status and displays results once ready (or progressively)
```
This reuses the exact same 8 services — a video-analysis component is just a different **frame producer**, same as the phone is a frame producer for live mode. No service needs to know or care whether its input came from a phone or a stored video file.

**Multi-camera scaling (4-5+ simultaneous frames):**
Each camera/phone source gets a `source_id`. Every frame sent to the gateway is tagged with which source it came from, so results from camera 3 don't get mixed into camera 5's display panel. The frontend renders one panel per active `source_id`, added dynamically as phones connect — no architectural change to the services themselves, only to the gateway's routing/tagging and the frontend's layout.

## 6. What's already built and verified

- `human-detection`: YOLOv8 + built-in tracking (ByteTrack via `.track()`), tested end-to-end on a real video — boxes and stable track IDs confirmed working.
- `vehicle-detection`: same YOLOv8 approach restricted to vehicle classes (car/motorcycle/bus/truck), tested on a traffic video — correct classification and boxes confirmed. Known gap: small/distant objects (e.g. a scooter) sometimes missed with the nano model; addressable later with a larger model variant or lower confidence threshold.
- `anpr`: two-stage (YOLOv8 plate detector + EasyOCR for text extraction) — in progress, being tested now.
- Unified `test/` directory with a shared `loader.py` pattern so any service's `model.py` can be tested standalone or in combination with others, without needing Docker or the gateway running.
- `gateway/main.py` skeleton exists, calling services independently with per-call timeouts and try/except, so failures don't cascade.
- `docker-compose.yml` skeleton exists — new services just need one more entry.

## 7. Workflow for pushing new services

1. Create your service folder under `services/<your-service-name>/` following the structure in Section 4.
2. Build and verify your `model.py` standalone first — no FastAPI yet. Test it directly against a sample video using the `test/loader.py` pattern (see existing `test_human.py` / `test_vehicle.py` for reference).
3. Wrap it in `main.py` following the `/health` + `/detect` contract in Section 3.
4. Add a `Dockerfile` (copy an existing service's as a template — they're nearly identical, just change the port).
5. Add your service to `docker-compose.yml`.
6. Push to the shared repo. Flag in the group chat if your input/output doesn't cleanly fit the image-in/JSON-out shape so we can align before it's load-bearing for the gateway/frontend.

## 8. Open items to align on as a team

- Exact response schema per service (field names for `suspicious-activity`, `virtual-fence`, `night-movement`, and `alert-logging` — these are less "detect a box" and more stateful/event-based, worth a short discussion).
- How `alert-logging` subscribes to or polls the other services' outputs (it likely consumes results from the others rather than raw frames).
- Historical footage job runner — background task design (simple thread/async task for the demo vs. a proper queue).
- Multi-camera `source_id` tagging convention in the gateway and frontend.
