# Distance ➜ Time Calculator (React + Tailwind)

A single-file React app that converts **distance** to **travel time** across multiple legs (walk/run/cycle/drive), with presets, unit switching, a conditions factor, total/pace readouts, and an optional ETA from a start time. The UI is styled with Tailwind classes.

---

## ✨ Features

* **Multi‑leg routes**: Add/remove legs (e.g., walk → drive → walk) and get a single total.
* **Presets & custom speeds**: Quick buttons + editable speed field (km/h or mph).
* **Units**: Distances in **km** or **miles**; totals can be displayed in either.
* **Conditions factor**: 50–200% multiplier that **scales time** (not speed) to model hills/traffic/rests.
* **Live totals**: Total distance, total time, pace per km and per mile.
* **ETA**: Pick a start time and see the arrival time, with `(+Nd)` when crossing days.
* **Persistence**: Legs, units, and start time saved to `localStorage`.
* **Built‑in smoke tests**: A collapsible in‑app panel validates core calculations.

---

## 📦 What’s in the file

The canvas contains a single React component that exports `DistanceTimeCalculator` and defines small child components (`LegCard`, `Summary`, `Tests`, etc.) plus helper functions. No external dependencies besides **React** (and Tailwind for styling).

---

## 🚀 Quick start (Vite)

> Recommended for the cleanest DX.

```bash
# 1) Create a new Vite React app
npm create vite@latest distance-time -- --template react
cd distance-time

# 2) Install deps
npm install

# 3) Replace the contents of src/App.jsx with the component from the canvas
#    Ensure the first line remains:  import * as React from "react";

# 4) Start dev server
npm run dev
```

Add Tailwind (optional but recommended) by following Tailwind’s Vite setup. If you skip Tailwind, the app still works—just without the styling polish.

---

## 🔧 Using the component

```jsx
import * as React from "react";
import DistanceTimeCalculator from "./DistanceTimeCalculator"; // or from App.jsx if you pasted it there

export default function App() {
  return <DistanceTimeCalculator />;
}
```

Mount `App` as usual with Vite/CRA/Next.js. The calculator renders a full-width page section.

---

## 🌐 Minimal CDN demo (no build step)

If you really need a one‑file HTML demo, include React/ReactDOM UMD and Tailwind CDN, then paste the component code **and remove the import line** (`import * as React from "react";`) so it uses global `React`:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body class="bg-slate-50">
    <div id="root"></div>
    <script type="text/babel">
      // Paste the component here and DELETE the `import * as React from "react";` line.
      // Then render it:
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(DistanceTimeCalculator));
    </script>
  </body>
</html>
```

---

## 🧮 Calculations

* **Unit constants**: `KM_PER_MILE = 1.609344`.
* **Distance to km**: `toKm(distance, unit)` converts miles→km when needed; invalid/negative → 0.
* **Speed to km/h**: `toKmh(speed, unit)` converts mph→km/h; invalid/≤0 → 0.
* **Per‑leg seconds**: `(distanceKm / speedKmh) * 3600`, then scaled by `factor/100` (minimum factor internally clamped to `1`).
* **Totals**: sum of km and seconds across all legs.
* **Pace**: seconds per km and seconds per mile.
* **ETA**: adds total seconds to `HH:MM` start time; renders `HH:MM` with `(+Nd)` if crossing days.

---

## ✅ Built‑in tests (in the UI)

Open the **Built‑in tests** panel in the app; it verifies:

* `10 km @ 5 km/h` → `2h` (7200s)
* `3 miles @ 3 mph` → `1h` (3600s)
* Conditions `150%` → 1.5× time
* Zero speed → `0s`
* Negative distance → `0s`
* Pace formatting: `300s` → `5:00`

> You can add more cases by extending the `Tests()` array in the component.

---

## ⚙️ Configuration & customization

* **Presets**: Edit `MODE_PRESETS` to tweak labels/speeds.
* **Default leg**: Adjust the initial `createLeg(1, {...})` state.
* **Units**: The summary display unit is controlled by `displayUnit` state; per‑leg units remain independent.
* **Persistence**: Stored under `distance-time-calculator` in `localStorage`.

---

## 🛟 Troubleshooting

* **ReferenceError: React is not defined**

  * Ensure the file begins with `import * as React from "react";` **when using a bundler** (Vite/CRA/Next/Parcel).
  * For CDN demos, **remove** the import and rely on the global `React`/`ReactDOM` UMD scripts.
* **No styling**

  * Include Tailwind (build setup or CDN). Without it, functionality remains but visuals are plain.
* **ETA not showing**

  * The `Start time` must be `HH:MM` (24‑hour). Invalid input hides the ETA.

---

## 🧭 Roadmap ideas

* Add fixed overhead minutes per mode (lights/parking/wait times).
* Reverse mode: **time → distance** and pace targets.
* Shareable URLs, export/import JSON.
* Elevation/grade inputs that auto‑adjust the factor.
* Unit tests with Vitest/Jest for helpers.
