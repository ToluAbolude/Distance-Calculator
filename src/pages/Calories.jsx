import * as React from "react";
export default function Calories(){
  const [distanceKm, setDistanceKm] = React.useState(2);
  const [weightKg, setWeightKg] = React.useState(75);
  const [mode, setMode] = React.useState("walk"); // walk | run

  // Very rough MET model: walk ~3.5 MET, run ~9.8 MET. kcal = MET * weight(kg) * hours
  const [paceMinPerKm, setPace] = React.useState(12); // walk 12, run 6 default
  const hours = (distanceKm * paceMinPerKm) / 60;
  const MET = mode==="walk" ? 3.5 : 9.8;
  const kcal = MET * weightKg * (hours/1);

  return (
    <div className="bg-white border rounded-2xl p-4">
      <h2 className="text-lg font-semibold mb-3">Calories by Distance</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <L label="Distance (km)"><N v={distanceKm} set={setDistanceKm} min={0} step={0.5}/></L>
        <L label="Weight (kg)"><N v={weightKg} set={setWeightKg} min={20} step={1}/></L>
        <L label="Mode">
          <select value={mode} onChange={e=>setMode(e.target.value)} className="border rounded-xl px-3 py-2">
            <option value="walk">Walk</option><option value="run">Run</option>
          </select>
        </L>
        <L label="Pace (min/km)"><N v={paceMinPerKm} set={setPace} min={4} step={0.5}/></L>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        <Stat label="Time" value={`${fmt(hours*60,0)} min`} />
        <Stat label="MET estimate" value={`${MET}`} />
        <Stat label="Calories" value={`${fmt(kcal,0)} kcal`} />
      </div>
      <p className="mt-2 text-xs text-slate-500">Back-of-envelope; actual burn varies by physiology & terrain.</p>
    </div>
  );
}
function L({label,children}){return(<label className="text-sm">{label}<div className="mt-1">{children}</div></label>)}
function N({v,set,min=0,step=1}){return(<input type="number" className="w-full border rounded-xl px-3 py-2" value={v} onChange={e=>set(Math.max(min, Number(e.target.value)||0))} min={min} step={step}/>)}
function Stat({label,value}){return(<div className="rounded-xl border bg-slate-50 p-3"><div className="text-xs text-slate-600">{label}</div><div className="text-lg font-semibold">{value}</div></div>)}
function fmt(n,dp=1){return isFinite(n)?Number(n).toFixed(dp):"0"}
