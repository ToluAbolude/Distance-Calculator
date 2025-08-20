import * as React from "react";
import DistanceEstimator from "./DistanceEstimator.jsx"; // <- the new page

// Top-level app with a simple toggle between the two pages
export default function App() {
  const [page, setPage] = React.useState("calc"); // "calc" | "estimate"

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <header className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Distance Tools
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Switch between the time calculator and the distance estimator.
          </p>
        </header>

        <nav className="flex gap-2 mb-6">
          <button
            onClick={() => setPage("calc")}
            className={`px-3 py-1.5 rounded-xl border ${
              page === "calc" ? "bg-slate-900 text-white" : "bg-white"
            }`}
          >
            Time Calculator
          </button>
          <button
            onClick={() => setPage("estimate")}
            className={`px-3 py-1.5 rounded-xl border ${
              page === "estimate" ? "bg-slate-900 text-white" : "bg-white"
            }`}
          >
            Distance Estimator
          </button>
        </nav>

        {page === "calc" ? <DistanceTimeCalculator /> : <DistanceEstimator />}
      </div>
    </div>
  );
}

/* --------------------- Distance ➜ Time Calculator --------------------- */

function DistanceTimeCalculator() {
  // --- Constants ---
  const KM_PER_MILE = 1.609344;

  const MODE_PRESETS = {
    walking_casual: { label: "Walking • casual", speed: 5, unit: "kmh" },
    walking_brisk: { label: "Walking • brisk", speed: 6, unit: "kmh" },
    running_jog: { label: "Running • jog", speed: 9, unit: "kmh" },
    cycling_casual: { label: "Cycling • casual", speed: 16, unit: "kmh" },
    cycling_commute: { label: "Cycling • commute", speed: 20, unit: "kmh" },
    driving_city: { label: "Driving • city avg", speed: 30, unit: "kmh" },
    driving_a_road: { label: "Driving • A-road avg", speed: 60, unit: "kmh" },
    driving_motorway: { label: "Driving • motorway avg", speed: 100, unit: "kmh" },
    custom: { label: "Custom", speed: 5, unit: "kmh" },
  };

  // --- State ---
  const [legs, setLegs] = React.useState([
    createLeg(1, {
      modeKey: "walking_casual",
      distance: 5,
      distanceUnit: "km",
      speed: MODE_PRESETS.walking_casual.speed,
      speedUnit: MODE_PRESETS.walking_casual.unit,
      factor: 100,
      note: "",
    }),
  ]);
  const [startTime, setStartTime] = React.useState(""); // HH:MM
  const [displayUnit, setDisplayUnit] = React.useState("km"); // for totals/pace

  // Persist to localStorage
  React.useEffect(() => {
    try {
      const payload = JSON.stringify({ legs, startTime, displayUnit });
      localStorage.setItem("distance-time-calculator", payload);
    } catch {}
  }, [legs, startTime, displayUnit]);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("distance-time-calculator");
      if (saved) {
        const { legs: L, startTime: S, displayUnit: D } = JSON.parse(saved);
        if (Array.isArray(L) && L.length) setLegs(L);
        if (typeof S === "string") setStartTime(S);
        if (D === "km" || D === "mi") setDisplayUnit(D);
      }
    } catch {}
  }, []);

  // --- Derived totals ---
  const totals = React.useMemo(() => {
    const totals = { distanceKm: 0, seconds: 0 };
    for (const leg of legs) {
      const secs = legSeconds(leg);
      totals.seconds += secs;
      totals.distanceKm += toKm(leg.distance, leg.distanceUnit);
    }
    return totals;
  }, [legs]);

  const pacePerKm = totals.distanceKm > 0 ? totals.seconds / totals.distanceKm : 0;
  const pacePerMile =
    totals.distanceKm > 0 ? totals.seconds / (totals.distanceKm / KM_PER_MILE) : 0;

  // ETA
  const eta = React.useMemo(() => {
    if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) return null;
    const [hh, mm] = startTime.split(":").map((n) => parseInt(n, 10));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hh,
      mm,
      0,
      0
    );
    const end = new Date(start.getTime() + totals.seconds * 1000);
    const dayDiff = Math.floor((end - start) / (24 * 3600 * 1000));
    return {
      end,
      label: `${pad(end.getHours())}:${pad(end.getMinutes())}${
        dayDiff > 0 ? ` (+${dayDiff}d)` : ""
      }`,
    };
  }, [startTime, totals.seconds]);

  // --- UI Handlers ---
  function addLeg() {
    const nextId = (legs[legs.length - 1]?.id || 0) + 1;
    setLegs((L) => [
      ...L,
      createLeg(nextId, {
        modeKey: "custom",
        distance: 1,
        distanceUnit: displayUnit,
        speed: displayUnit === "km" ? 5 : 3.1,
        speedUnit: displayUnit === "km" ? "kmh" : "mph",
        factor: 100,
        note: "",
      }),
    ]);
  }
  function removeLeg(id) {
    setLegs((L) => L.filter((x) => x.id !== id));
  }
  function updateLeg(id, patch) {
    setLegs((L) => L.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function resetAll() {
    setLegs([
      createLeg(1, {
        modeKey: "walking_casual",
        distance: 5,
        distanceUnit: "km",
        speed: MODE_PRESETS.walking_casual.speed,
        speedUnit: MODE_PRESETS.walking_casual.unit,
        factor: 100,
        note: "",
      }),
    ]);
    setStartTime("");
    setDisplayUnit("km");
  }

  // --- Render ---
  return (
    <div className="w-full">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Distance ➜ Time Calculator
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Convert distance to travel time for walking, running, cycling, or
            driving. Add multiple legs, tweak speeds, and get an ETA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Display</label>
          <select
            className="px-2 py-1 rounded-lg border border-slate-300 bg-white text-sm"
            value={displayUnit}
            onChange={(e) => setDisplayUnit(e.target.value)}
          >
            <option value="km">km</option>
            <option value="mi">miles</option>
          </select>
          <button
            onClick={resetAll}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-sm"
            title="Reset"
          >
            Reset
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {legs.map((leg, idx) => (
          <LegCard
            key={leg.id}
            idx={idx}
            leg={leg}
            presets={MODE_PRESETS}
            onChange={updateLeg}
            onRemove={() => removeLeg(leg.id)}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={addLeg}
          className="px-4 py-2 rounded-2xl bg-slate-900 text-white hover:opacity-90 shadow"
        >
          + Add leg
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm">Start time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
          />
          {eta && (
            <span className="text-sm text-slate-700">
              ETA: <span className="font-semibold">{eta.label}</span>
            </span>
          )}
        </div>
      </div>

      <Summary
        totals={totals}
        pacePerKm={pacePerKm}
        pacePerMile={pacePerMile}
        displayUnit={displayUnit}
      />

      <Tests />

      <section className="mt-8 text-sm text-slate-600">
        <h3 className="font-semibold mb-2">Tips</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Use the dropdown presets to quickly set typical speeds, then
            fine-tune the speed field if needed.
          </li>
          <li>
            Adjust the <em>Conditions</em> factor to account for hills, traffic,
            weather, or rest stops.
          </li>
          <li>
            Add multiple legs for mixed travel (e.g., walk → train → walk) and
            get a single ETA.
          </li>
        </ul>
      </section>

      <footer className="mt-10 text-xs text-slate-500">
        <p>Estimates only. Always allow extra time for real-world conditions.</p>
      </footer>
    </div>
  );
}

/* --------------------------- Subcomponents --------------------------- */

function LegCard({ idx, leg, presets, onChange, onRemove }) {
  const preset = presets[leg.modeKey] ?? presets.custom;
  const seconds = legSeconds(leg);

  const distanceDisplay = `${leg.distance || 0} ${leg.distanceUnit}`;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
            Leg {idx + 1}
          </span>
          <span className="text-sm text-slate-500">{preset.label}</span>
        </div>
        <button
          onClick={onRemove}
          className="text-slate-500 hover:text-red-600 text-sm"
          title="Remove leg"
        >
          Remove
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Mode</label>
          <select
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            value={leg.modeKey}
            onChange={(e) => {
              const key = e.target.value;
              const p = presets[key] ?? presets.custom;
              onChange(leg.id, {
                modeKey: key,
                speed: p.speed,
                speedUnit: p.unit,
              });
            }}
          >
            {Object.entries(presets).map(([key, p]) => (
              <option key={key} value={key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Distance</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={leg.distance}
              onChange={(e) =>
                onChange(leg.id, { distance: safeNum(e.target.value) })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            />
            <select
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
              value={leg.distanceUnit}
              onChange={(e) =>
                onChange(leg.id, { distanceUnit: e.target.value })
              }
            >
              <option value="km">km</option>
              <option value="mi">miles</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Speed</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={leg.speed}
              onChange={(e) =>
                onChange(leg.id, { speed: safeNum(e.target.value) })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            />
            <select
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
              value={leg.speedUnit}
              onChange={(e) => onChange(leg.id, { speedUnit: e.target.value })}
            >
              <option value="kmh">km/h</option>
              <option value="mph">mph</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <PresetSpeedButton
              label="Walk"
              valueKmH={5}
              onPick={(v) => onChange(leg.id, toSpeedPatch(v, leg.speedUnit))}
            />
            <PresetSpeedButton
              label="Jog"
              valueKmH={9}
              onPick={(v) => onChange(leg.id, toSpeedPatch(v, leg.speedUnit))}
            />
            <PresetSpeedButton
              label="Cycle"
              valueKmH={20}
              onPick={(v) => onChange(leg.id, toSpeedPatch(v, leg.speedUnit))}
            />
            <PresetSpeedButton
              label="City"
              valueKmH={30}
              onPick={(v) => onChange(leg.id, toSpeedPatch(v, leg.speedUnit))}
            />
            <PresetSpeedButton
              label="Motorway"
              valueKmH={100}
              onPick={(v) => onChange(leg.id, toSpeedPatch(v, leg.speedUnit))}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Conditions</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="50"
              max="200"
              step="1"
              value={leg.factor}
              onChange={(e) =>
                onChange(leg.id, { factor: safeNum(e.target.value) })
              }
              className="w-full"
            />
            <span className="text-sm w-16 text-right">{leg.factor}%</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Adjust for hills, traffic, weather, or rest stops (100% = normal).
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3 items-end">
        <div className="lg:col-span-2">
          <label className="text-sm font-medium mb-1">Note (optional)</label>
          <input
            type="text"
            value={leg.note || ""}
            onChange={(e) => onChange(leg.id, { note: e.target.value })}
            placeholder="e.g., Walk from station to office"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
          />
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-600">Time for this leg</div>
          <div className="text-lg font-semibold">{formatHMS(seconds)}</div>
          <div className="text-xs text-slate-500">
            {distanceDisplay} @ {formatSpeed(leg.speed, leg.speedUnit)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Summary({ totals, pacePerKm, pacePerMile, displayUnit }) {
  const totalDistance =
    displayUnit === "km" ? totals.distanceKm : totals.distanceKm / 1.609344;
  const unitLabel = displayUnit === "km" ? "km" : "miles";

  return (
    <section className="mt-6 rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-3">Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          label={`Total distance (${unitLabel})`}
          value={fmt(totalDistance, 2)}
          sub={`${fmt(totals.distanceKm, 2)} km • ${fmt(
            totals.distanceKm / 1.609344,
            2
          )} miles`}
        />
        <Stat
          label="Total time"
          value={formatHMS(totals.seconds)}
          sub={`${fmt(totals.seconds / 3600, 2)} hours`}
        />
        <Stat label="Pace (per km)" value={formatPace(pacePerKm)} sub={`/km`} />
        <Stat
          label="Pace (per mile)"
          value={formatPace(pacePerMile)}
          sub={`/mile`}
        />
      </div>
    </section>
  );
}

function Tests() {
  const tests = [];
  const sec = (h) => Math.round(h * 3600);
  tests.push({
    name: "10 km at 5 km/h",
    got: Math.round(
      legSeconds({
        distance: 10,
        distanceUnit: "km",
        speed: 5,
        speedUnit: "kmh",
        factor: 100,
      })
    ),
    want: sec(2),
  });
  tests.push({
    name: "3 miles at 3 mph",
    got: Math.round(
      legSeconds({
        distance: 3,
        distanceUnit: "mi",
        speed: 3,
        speedUnit: "mph",
        factor: 100,
      })
    ),
    want: sec(1),
  });
  tests.push({
    name: "Conditions factor 150%",
    got: Math.round(
      legSeconds({
        distance: 10,
        distanceUnit: "km",
        speed: 10,
        speedUnit: "kmh",
        factor: 150,
      })
    ),
    want: sec(1.5),
  });
  tests.push({
    name: "Zero speed -> 0s",
    got: Math.round(
      legSeconds({
        distance: 5,
        distanceUnit: "km",
        speed: 0,
        speedUnit: "kmh",
        factor: 100,
      })
    ),
    want: 0,
  });
  tests.push({
    name: "Negative distance -> 0s",
    got: Math.round(
      legSeconds({
        distance: -5,
        distanceUnit: "km",
        speed: 5,
        speedUnit: "kmh",
        factor: 100,
      })
    ),
    want: 0,
  });
  const paceSample = formatPace(300);
  tests.push({ name: "Pace 300s -> 5:00", got: paceSample, want: "5:00" });

  const results = tests.map((t) => ({ ...t, pass: t.got === t.want }));
  const passed = results.filter((r) => r.pass).length;

  return (
    <details className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer select-none text-sm font-semibold">
        Built-in tests: {passed}/{tests.length} passing
      </summary>
      <ul className="mt-3 space-y-2 text-sm">
        {results.map((r, i) => (
          <li key={i} className={r.pass ? "text-emerald-700" : "text-red-700"}>
            <span className="font-medium">
              {r.pass ? "✓" : "✗"} {r.name}:
            </span>
            <span className="ml-2">
              got{" "}
              <code className="px-1 rounded bg-slate-100">{String(r.got)}</code>{" "}
              expected{" "}
              <code className="px-1 rounded bg-slate-100">{String(r.want)}</code>
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs text-slate-600">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function PresetSpeedButton({ label, valueKmH, onPick }) {
  return (
    <button
      type="button"
      className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200"
      onClick={() => onPick(valueKmH)}
      title={`${valueKmH} km/h`}
    >
      {label}
    </button>
  );
}

/* ------------------------------ Helpers ------------------------------ */

function createLeg(id, init) {
  return {
    id,
    modeKey: "custom",
    distance: 0,
    distanceUnit: "km", // "km" | "mi"
    speed: 5,
    speedUnit: "kmh", // "kmh" | "mph"
    factor: 100, // % time multiplier
    note: "",
    ...init,
  };
}

function toKm(distance, unit) {
  if (!isFinite(distance) || distance < 0) return 0;
  return unit === "mi" ? distance * 1.609344 : distance;
}

function toKmh(speed, unit) {
  if (!isFinite(speed) || speed <= 0) return 0;
  return unit === "mph" ? speed * 1.609344 : speed;
}

function legSeconds(leg) {
  const dKm = toKm(leg.distance, leg.distanceUnit);
  const vKmh = toKmh(leg.speed, leg.speedUnit);
  if (vKmh <= 0) return 0;
  const baseSeconds = (dKm / vKmh) * 3600;
  const scaled = baseSeconds * (Math.max(1, leg.factor) / 100);
  return Math.max(0, scaled);
}

function formatHMS(seconds) {
  const secs = Math.max(0, Math.round(seconds));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  return `${m}m ${pad(s)}s`;
}

function formatPace(secPerUnit) {
  if (!isFinite(secPerUnit) || secPerUnit <= 0) return "—";
  const m = Math.floor(secPerUnit / 60);
  let s = Math.round(secPerUnit % 60);
  if (s === 60) {
    s = 0;
  }
  return `${m}:${pad(s)}`;
}

function formatSpeed(speed, unit) {
  return `${fmt(speed)} ${unit === "kmh" ? "km/h" : "mph"}`;
}

function fmt(n, dp = 1) {
  if (!isFinite(n)) return "0";
  return Number(n).toFixed(dp);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function safeNum(v) {
  const n = parseFloat(v);
  return isFinite(n) ? n : 0;
}

function toSpeedPatch(valueKmH, currentUnit) {
  if (currentUnit === "kmh") return { speed: valueKmH };
  return { speed: valueKmH / 1.609344 };
}
