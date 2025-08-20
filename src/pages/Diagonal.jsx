import * as React from "react";
export default function Diagonal(){
  const [x, setX] = React.useState(3);
  const [y, setY] = React.useState(4);
  const [z, setZ] = React.useState(0);
  const d2 = Math.sqrt(x*x + y*y);
  const d3 = Math.sqrt(x*x + y*y + z*z);

  return (
    <div className="bg-white border rounded-2xl p-4">
      <h2 className="text-lg font-semibold mb-3">Diagonal / Line-of-Sight</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <L label="Width (m)"><N v={x} set={setX} min={0} step={0.1}/></L>
        <L label="Depth (m)"><N v={y} set={setY} min={0} step={0.1}/></L>
        <L label="Height (m) [optional]"><N v={z} set={setZ} min={0} step={0.1}/></L>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <Stat label="2D diagonal" value={`${fmt(d2,2)} m`} />
        <Stat label="3D diagonal" value={`${fmt(d3,2)} m`} />
      </div>
      <p className="mt-2 text-xs text-slate-500">Great for “across the room” cable runs or multi-floor risers.</p>
    </div>
  );
}
function L({label,children}){return(<label className="text-sm">{label}<div className="mt-1">{children}</div></label>)}
function N({v,set,min=0,step=1}){return(<input type="number" className="w-full border rounded-xl px-3 py-2" value={v} onChange={e=>set(Math.max(min, Number(e.target.value)||0))} min={min} step={step}/>)}
function Stat({label,value}){return(<div className="rounded-xl border bg-slate-50 p-3"><div className="text-xs text-slate-600">{label}</div><div className="text-lg font-semibold">{value}</div></div>)}
function fmt(n,dp=1){return isFinite(n)?Number(n).toFixed(dp):"0"}
