import * as React from "react";

/**
 * Map metres to everyday objects so distances “feel” intuitive.
 * Values are rough; the goal is relatability, not engineering precision.
 */
const REF = [
  { key: "bus",       label: "Double-decker bus",     m: 10.9 },
  { key: "car",       label: "Family car",            m: 4.5  },
  { key: "room",      label: "Average room width",    m: 3.5  },
  { key: "hall",      label: "Hallway width",         m: 1.1  },
  { key: "door",      label: "Door height",           m: 2.0  },
  { key: "pitch",     label: "Football pitch (length)", m: 105 },
  { key: "trackLap",  label: "Athletics track (400 m)", m: 400 },
  { key: "phoneBox",  label: "UK phone box height",   m: 2.4  },
];

export default function Analogies(){
  const [metres, setMetres] = React.useState(10);
  const [unit, setUnit] = React.useState("m"); // m | ft

  const display = unit === "m" ? metres : metres * 0.3048; // accept ft input if needed later
  const items = REF.map(r => ({
    ...r,
    count: display > 0 && r.m > 0 ? (display / r.m) : 0
  }));

  return (
    <div className="bg-white border rounded-2xl p-4">
      <h2 className="text-lg font-semibold mb-3">Everyday Analogies</h2>

      <div className="grid sm:grid-cols-3 gap-3">
        <L label="Distance">
          <input type="number" className="w-full border rounded-xl px-3 py-2" value={metres}
            onChange={e=>setMetres(Math.max(0, Number(e.target.value)||0))} step={0.1} min={0}/>
        </L>
        <L label="Unit">
          <select value={unit} onChange={e=>setUnit(e.target.value)} className="border rounded-xl px-3 py-2">
            <option value="m">metres (m)</option>
            <option value="ft">feet (ft)</option>
          </select>
        </L>
        <Stat label="Normalised" value={`${fmt(display,2)} m`} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {items.map(i => (
          <div key={i.key} className="rounded-xl border bg-slate-50 p-3">
            <div className="text-xs text-slate-600">{i.label}</div>
            <div className="text-lg font-semibold">≈ {fmt(i.count,2)} ×</div>
            <div className="text-xs text-slate-500">{i.m} m each</div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-xs text-slate-500">
        These are approximations to help visualise scale. Real objects vary by model and venue.
      </p>
    </div>
  );
}

function L({label,children}){return(<label className="text-sm">{label}<div className="mt-1">{children}</div></label>)}
function Stat({label,value}){return(<div className="rounded-xl border bg-slate-100 p-3"><div className="text-xs text-slate-600">{label}</div><div className="text-lg font-semibold">{value}</div></div>)}
function fmt(n,dp=1){return isFinite(n)?Number(n).toFixed(dp):"0"}
