import * as React from "react";

/**
 * DistanceEstimator
 *
 * Estimate a physical cable/run length when you don't have a tape measure.
 * Converts everyday things—steps, walking time, room counts, floors—into metres/feet,
 * with quick rules of thumb and HDMI-friendly safety slack.
 *
 * Drop this into your Vite app as `src/DistanceEstimator.jsx` and route to it.
 */
export default function DistanceEstimator() {
  const FT_PER_M = 3.28084;

  // Reasonable defaults (can be tweaked in UI)
  const [unit, setUnit] = React.useState("m"); // display unit: m or ft
  const [stepLengthCm, setStepLengthCm] = React.useState(75); // avg adult step ≈ 0.75 m
  const [walkingSpeedKmh, setWalkingSpeedKmh] = React.useState(5); // casual walk
  const [floorHeightM, setFloorHeightM] = React.useState(2.6); // typical floor-to-floor
  const [safetySlackPct, setSafetySlackPct] = React.useState(15); // extra slack for routing

  // Inputs
  const [inputs, setInputs] = React.useState({
    steps: 0,
    minutesWalking: 0,
    rooms: 0, // multiply by typical room width
    roomWidthM: 3.5,
    floors: 0,
    straightLineMeters: 0, // if you have any partial measurement
  });

  // Derived estimates
  const estimates = React.useMemo(() => {
    const parts = [];

    // 1) Steps → distance
    if (inputs.steps > 0) {
      const metres = (inputs.steps * stepLengthCm) / 100;
      parts.push({ label: `${inputs.steps} steps`, metres });
    }

    // 2) Walking time → distance (projected straight-line equivalent)
    if (inputs.minutesWalking > 0 && walkingSpeedKmh > 0) {
      const metres = (walkingSpeedKmh * 1000) * (inputs.minutesWalking / 60);
      parts.push({ label: `${inputs.minutesWalking} min walk`, metres });
    }

    // 3) Rooms → distance (rough across rooms)
    if (inputs.rooms > 0 && inputs.roomWidthM > 0) {
      const metres = inputs.rooms * inputs.roomWidthM;
      parts.push({ label: `${inputs.rooms} room(s) × ${fmt(inputs.roomWidthM)} m`, metres });
    }

    // 4) Floors → vertical trunk
    if (inputs.floors > 0 && floorHeightM > 0) {
      const metres = inputs.floors * floorHeightM;
      parts.push({ label: `${inputs.floors} floor(s)`, metres });
    }

    // 5) Straight-line / partial known
    if (inputs.straightLineMeters > 0) {
      parts.push({ label: `Known segment`, metres: inputs.straightLineMeters });
    }

    // Combine: pick the largest (safer for cable ordering), and also show average
    const metresList = parts.map(p => p.metres).filter(Boolean);
    const sum = metresList.reduce((a,b)=>a+b,0);
    const maxM = metresList.length ? Math.max(...metresList) : 0;
    const avgM = metresList.length ? sum / metresList.length : 0;

    // Apply slack
    const slackFactor = 1 + Math.max(0, safetySlackPct)/100;
    const maxWithSlack = maxM * slackFactor;
    const avgWithSlack = avgM * slackFactor;

    return { parts, maxM, avgM, maxWithSlack, avgWithSlack };
  }, [inputs, stepLengthCm, walkingSpeedKmh, floorHeightM, safetySlackPct]);

  // Helpers
  const toDisplay = (metres) => unit === "m"
    ? `${fmt(metres,2)} m`
    : `${fmt(metres * FT_PER_M,2)} ft`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Distance Estimator</h1>
            <p className="text-slate-600 text-sm mt-1">Convert everyday cues (steps, time, rooms, floors) into a practical cable length with safety slack. Great for HDMI, Ethernet, or any run without a tape measure.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Display</label>
            <select className="px-2 py-1 rounded-lg border" value={unit} onChange={(e)=>setUnit(e.target.value)}>
              <option value="m">metres (m)</option>
              <option value="ft">feet (ft)</option>
            </select>
          </div>
        </header>

        {/* Tunables */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Field label="Step length" hint="Avg adult ≈ 0.75 m">
            <div className="flex gap-2">
              <input type="number" className="w-full px-3 py-2 rounded-xl border" min={30} step={1}
                value={stepLengthCm}
                onChange={(e)=>setStepLengthCm(clampNum(e.target.value,30,120))}/>
              <span className="px-2 py-2 text-sm">cm</span>
            </div>
          </Field>
          <Field label="Walking speed" hint="Casual ≈ 5 km/h">
            <div className="flex gap-2">
              <input type="number" className="w-full px-3 py-2 rounded-xl border" min={1} step={0.1}
                value={walkingSpeedKmh}
                onChange={(e)=>setWalkingSpeedKmh(clampNum(e.target.value,1,10))}/>
              <span className="px-2 py-2 text-sm">km/h</span>
            </div>
          </Field>
          <Field label="Floor height" hint="Typical 2.4–2.7 m">
            <div className="flex gap-2">
              <input type="number" className="w-full px-3 py-2 rounded-xl border" min={2} step={0.1}
                value={floorHeightM}
                onChange={(e)=>setFloorHeightM(clampNum(e.target.value,2,5))}/>
              <span className="px-2 py-2 text-sm">m</span>
            </div>
          </Field>
          <Field label="Safety slack" hint="Extra length for routing">
            <div className="flex gap-2 items-center">
              <input type="range" min={0} max={30} step={1} value={safetySlackPct}
                onChange={(e)=>setSafetySlackPct(Number(e.target.value))} className="w-full"/>
              <span className="text-sm w-12 text-right">{safetySlackPct}%</span>
            </div>
          </Field>
        </section>

        {/* Inputs */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card title="Steps">
            <NumberInput value={inputs.steps} onChange={(v)=>setInputs({...inputs, steps:v})} min={0} step={1} />
            <p className="text-xs text-slate-600 mt-2">Tip: walk the path and count steps. Adjust step length above for your stride.</p>
          </Card>

          <Card title="Walking time (minutes)">
            <NumberInput value={inputs.minutesWalking} onChange={(v)=>setInputs({...inputs, minutesWalking:v})} min={0} step={0.5} />
            <p className="text-xs text-slate-600 mt-2">Rough time at your normal indoor pace.</p>
          </Card>

          <Card title="Rooms across">
            <div className="grid grid-cols-3 gap-2 items-center">
              <NumberInput value={inputs.rooms} onChange={(v)=>setInputs({...inputs, rooms:v})} min={0} step={1} />
              <span className="text-sm text-slate-600 text-center">×</span>
              <div className="flex items-center gap-2">
                <input type="number" className="w-full px-3 py-2 rounded-xl border" min={2} step={0.1}
                  value={inputs.roomWidthM}
                  onChange={(e)=>setInputs({...inputs, roomWidthM: clampNum(e.target.value,2,8)})}
                />
                <span className="text-sm">m</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">Default room width ≈ 3.5 m; tweak for your home.</p>
          </Card>

          <Card title="Floors up/down">
            <NumberInput value={inputs.floors} onChange={(v)=>setInputs({...inputs, floors:v})} min={0} step={1} />
            <p className="text-xs text-slate-600 mt-2">Multiplies by floor height for vertical risers.</p>
          </Card>

          <Card title="Known straight segment (optional)">
            <div className="flex items-center gap-2">
              <input type="number" className="w-full px-3 py-2 rounded-xl border" min={0} step={0.1}
                value={inputs.straightLineMeters}
                onChange={(e)=>setInputs({...inputs, straightLineMeters: Math.max(0, Number(e.target.value)||0)})}
              />
              <span className="text-sm">m</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">If you measured any part with a ruler, tiles, or arm span, add it here.</p>
          </Card>
        </section>

        {/* Results */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Estimates</h2>
          {estimates.parts.length === 0 ? (
            <p className="text-slate-600 text-sm">Enter at least one input above to get estimates.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {estimates.parts.map((p, i) => (
                <div key={i} className="rounded-xl border bg-white p-3">
                  <div className="text-xs text-slate-600">{p.label}</div>
                  <div className="text-xl font-semibold">{toDisplay(p.metres)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            <Stat label="Average (no slack)" value={toDisplay(estimates.avgM)} />
            <Stat label="Max (no slack)" value={toDisplay(estimates.maxM)} />
            <Stat label={`Average +${safetySlackPct}%`} value={toDisplay(estimates.avgWithSlack)} />
            <Stat label={`Max +${safetySlackPct}%`} value={toDisplay(estimates.maxWithSlack)} />
          </div>
        </section>

        {/* HDMI guidance */}
        <section className="mt-8 rounded-2xl border bg-white p-4">
          <h3 className="font-semibold">HDMI quick guidance</h3>
          <ul className="list-disc pl-5 text-sm mt-2 space-y-1 text-slate-700">
            <li><strong>Short passive HDMI:</strong> up to ~5–7 m is usually fine for 4K/60 on good quality cable.</li>
            <li><strong>Longer runs (10–15 m+):</strong> use an <em>active</em> HDMI cable or HDMI-over-fibre/HDBaseT baluns.</li>
            <li>Add <strong>{safetySlackPct}% slack</strong> for routing around door frames, skirting, and furniture.</li>
            <li>Prefer a <strong>continuous</strong> cable; avoid couplers if possible.</li>
          </ul>
        </section>

        {/* Tiny test block */}
        <details className="mt-6 rounded-2xl border bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold">Built‑in tests</summary>
          <ul className="mt-2 text-sm text-slate-700 list-disc pl-5">
            <li>100 steps @ 75 cm → {fmt((100*75)/100,2)} m</li>
            <li>5 min @ 5 km/h → {fmt((5*1000)*(5/60),2)} m (approx walking path)</li>
            <li>2 rooms × 3.5 m → {fmt(2*3.5,2)} m</li>
            <li>1 floor @ 2.6 m → {fmt(1*2.6,2)} m</li>
          </ul>
        </details>

        <footer className="mt-8 text-xs text-slate-500">
          Estimates only. Real routing adds bends; measure where possible.
        </footer>
      </div>
    </div>
  );
}

// --- Small UI primitives ---
function Field({label, hint, children}){
  return (
    <div>
      <div className="text-sm font-medium">{label}</div>
      {children}
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}
function Card({title, children}){
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}
function NumberInput({value, onChange, min=0, step=1}){
  return (
    <input type="number" className="w-full px-3 py-2 rounded-xl border" value={value}
      onChange={(e)=>onChange(Math.max(min, Number(e.target.value)||0))}
      min={min} step={step}
    />
  );
}
function Stat({label, value}){
  return (
    <div className="rounded-xl border bg-slate-50 p-3">
      <div className="text-xs text-slate-600">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

// --- Utils ---
function fmt(n, dp=1){
  if (!isFinite(n)) return "0";
  return Number(n).toFixed(dp);
}
function clampNum(v, min, max){
  const n = Number(v); if (!isFinite(n)) return min; return Math.min(max, Math.max(min, n));
}
