import * as React from "react";
export default function FuelCost(){
  const [distanceKm, setDistanceKm] = React.useState(10);
  const [mode, setMode] = React.useState("petrol"); // petrol | diesel | ev
  const [mpgUK, setMpgUK] = React.useState(40);      // for ICE
  const [pricePerL, setPricePerL] = React.useState(1.50);
  const [whPerKm, setWhPerKm] = React.useState(160); // for EVs
  const [pricePerKwh, setPricePerKwh] = React.useState(0.30);

  const litresUsed = (distanceKm / (mpgUK * 1.609344)) * 4.54609; // km -> miles -> gallonsUK -> litres
  const iceCost = litresUsed * pricePerL;

  const kwhUsed = (distanceKm * whPerKm) / 1000;
  const evCost  = kwhUsed * pricePerKwh;
  const evPct   = (kwhUsed / 60) * 100; // assume 60 kWh pack default context

  return (
    <div className="bg-white border rounded-2xl p-4">
      <h2 className="text-lg font-semibold mb-3">Fuel / Energy Cost</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <L label="Distance (km)"><N v={distanceKm} set={setDistanceKm} min={0} step={1}/></L>
        <L label="Mode">
          <select value={mode} onChange={e=>setMode(e.target.value)} className="border rounded-xl px-3 py-2">
            <option value="petrol">Petrol/Diesel</option><option value="ev">EV</option>
          </select>
        </L>
        {mode!=="ev" ? <>
          <L label="Economy (mpg UK)"><N v={mpgUK} set={setMpgUK} min={5} step={1}/></L>
          <L label="Fuel price (€/£ per L)"><N v={pricePerL} set={setPricePerL} min={0} step={0.01}/></L>
        </> : <>
          <L label="Consumption (Wh/km)"><N v={whPerKm} set={setWhPerKm} min={80} step={5}/></L>
          <L label="Electricity (€/£ per kWh)"><N v={pricePerKwh} set={setPricePerKwh} min={0} step={0.01}/></L>
        </>}
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        {mode!=="ev" ? (
          <>
            <Stat label="Litres used" value={fmt(litresUsed,2)} />
            <Stat label="Trip cost" value={`£${fmt(iceCost,2)}`} />
            <Stat label="Per km" value={`£${fmt(iceCost / Math.max(1,distanceKm),3)}`} />
          </>
        ) : (
          <>
            <Stat label="kWh used" value={fmt(kwhUsed,2)} />
            <Stat label="Trip cost" value={`£${fmt(evCost,2)}`} />
            <Stat label="Battery used" value={`${fmt(evPct,1)}% (≈60 kWh pack)`} />
          </>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-500">Adjust inputs for your vehicle/tariff. Uses UK mpg and litres; tweak for locale.</p>
    </div>
  );
}
function L({label,children}){return(<label className="text-sm">{label}<div className="mt-1">{children}</div></label>)}
function N({v,set,min=0,step=1}){return(<input type="number" className="w-full border rounded-xl px-3 py-2" value={v} onChange={e=>set(Math.max(min, Number(e.target.value)||0))} min={min} step={step}/>)}
function Stat({label,value}){return(<div className="rounded-xl border bg-slate-50 p-3"><div className="text-xs text-slate-600">{label}</div><div className="text-lg font-semibold">{value}</div></div>)}
function fmt(n,dp=1){return isFinite(n)?Number(n).toFixed(dp):"0"}
