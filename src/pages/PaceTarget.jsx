import * as React from "react";

/**
 * Given a target time and distance, compute required pace and km/mi splits.
 */
export default function PaceTarget(){
  const [distance, setDistance] = React.useState(10);      // 10 km default
  const [unit, setUnit] = React.useState("km");            // km | mi
  const [hh, setH] = React.useState(0);
  const [mm, setM] = React.useState(50);
  const [ss, setS] = React.useState(0);
  const totalSec = Math.max(0, hh*3600 + mm*60 + ss);

  const distanceKm = unit === "km" ? distance : distance * 1.609344;
  const distanceMi = unit === "mi" ? distance : distance / 1.609344;

  const pacePerKm = distanceKm > 0 ? totalSec / distanceKm : 0;
  const pacePerMi = distanceMi > 0 ? totalSec / distanceMi : 0;

  // Generate split table for 1 km or 1 mile
  const splitUnit = unit; // follow selected unit for friendliness
  const splits = [];
  const steps = Math.max(1, Math.floor(distance));
  const pacePerUnit = splitUnit === "km" ? pacePerKm : pacePerMi;
  for (let i=1; i<=steps; i++){
    const t = i * pacePerUnit;
    splits.push({ seg: i, time: formatHMS(t) });
  }

  return (
    <div className="bg-white border rounded-2xl p-4">
      <h2 className="text-lg font-semibold mb-3">Pace Target & Splits</h2>

      <div className="grid sm:grid-cols-3 gap-3">
        <L label={`Distance (${unit})`}>
          <input type="number" className="w-full border rounded-xl px-3 py-2" value={distance}
            onChange={e=>setDistance(Math.max(0, Number(e.target.value)||0))} step={0.1} min={0}/>
        </L>
        <L label="Unit">
          <select value={unit} onChange={e=>setUnit(e.target.value)} className="border rounded-xl px-3 py-2">
            <option value="km">km</option><option value="mi">miles</option>
          </select>
        </L>
        <L label="Target time (HH:MM:SS)">
          <div className="flex gap-2">
            <N v={hh} set={setH} max={99}/><span className="py-2">:</span>
            <N v={mm} set={setM} max={59}/><span className="py-2">:</span>
            <N v={ss} set={setS} max={59}/>
          </div>
        </L>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        <Stat label="Required pace / km" value={pacePerKm>0 ? formatPace(pacePerKm)+"/km" : "—"} />
        <Stat label="Required pace / mile" value={pacePerMi>0 ? formatPace(pacePerMi)+"/mi" : "—"} />
        <Stat label="Avg speed" value={avgSpeed(totalSec, distanceKm)} />
      </div>

      <div className="mt-4 rounded-2xl border bg-slate-50 p-3">
        <div className="text-sm font-semibold mb-2">Splits ({splitUnit})</div>
        {splits.length === 0 ? <p className="text-sm text-slate-600">Enter a distance and time.</p> :
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            {splits.map(s => (
              <li key={s.seg} className="rounded-lg border bg-white px-3 py-2 flex justify-between">
                <span>{s.seg} {splitUnit}</span>
                <span className="font-mono">{s.time}</span>
              </li>
            ))}
          </ul>
        }
      </div>

      <p className="mt-2 text-xs text-slate-500">Even pacing assumed; terrain and stops not included.</p>
    </div>
  );
}

function L({label,children}){return(<label className="text-sm">{label}<div className="mt-1">{children}</div></label>)}
function N({v,set,max=999}){return(<input type="number" className="w-16 border rounded-xl px-2 py-2 text-center" value={v} onChange={e=>set(clamp(Number(e.target.value)||0,0,max))} min={0} max={max}/>)}
function Stat({label,value}){return(<div className="rounded-xl border bg-slate-100 p-3"><div className="text-xs text-slate-600">{label}</div><div className="text-lg font-semibold">{value}</div></div>)}

function formatPace(sec){ const m=Math.floor(sec/60); const s=Math.round(sec%60); return `${m}:${String(s).padStart(2,"0")}`; }
function formatHMS(sec){ const t=Math.round(sec); const h=Math.floor(t/3600), m=Math.floor((t%3600)/60), s=t%60; return `${h>0? h+\"h \":\"\"}${String(m).padStart(2,\"0\")}m ${String(s).padStart(2,\"0\")}s`; }
function avgSpeed(totalSec, km){ if (totalSec<=0||km<=0) return "—"; const h=totalSec/3600; const kmh=km/h; return `${kmh.toFixed(1)} km/h`; }
function clamp(n,min,max){ return Math.min(max, Math.max(min, n)); }
