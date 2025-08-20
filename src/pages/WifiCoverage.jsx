import * as React from "react";

/**
 * Very rough Wi-Fi coverage estimator.
 * Uses a log-distance model + wall attenuation.
 * This is a back-of-envelope tool, not a site survey.
 */
export default function WifiCoverage(){
  const [txPowerDbm, setTxPower] = React.useState(20);      // router EIRP dBm (typical 18–23 dBm)
  const [freqGHz, setFreq] = React.useState(5);             // 2.4 / 5 / 6 GHz
  const [targetRssi, setTargetRssi] = React.useState(-67);  // dBm, “good client” threshold
  const [walls, setWalls] = React.useState(2);              // number of walls
  const [wallLossDb, setWallLossDb] = React.useState(5);    // dB per wall (plaster ~3–5, brick ~8–12)
  const [floorLossDb, setFloorLossDb] = React.useState(12); // floor attenuation (wood ~8–12, concrete more)
  const [floors, setFloors] = React.useState(0);

  // Free-Space Path Loss (FSPL) at distance d(m): FSPL(dB) = 20log10(d) + 20log10(f_MHz) + 32.44
  // We invert for distance where: txPower - (FSPL + walls + floors) = targetRssi
  const fMHz = freqGHz * 1000;
  const obstLoss = walls * wallLossDb + floors * floorLossDb;
  const maxPathLoss = txPowerDbm - targetRssi - obstLoss; // allowable path loss in dB

  // Solve for distance (metres): d = 10^((PL - 20log10(f_MHz) - 32.44)/20)
  const logTerm = (maxPathLoss - (20*Math.log10(fMHz) + 32.44)) / 20;
  const metres = Math.max(0, Math.pow(10, logTerm));
  const rooms = metres / 3.5; // very rough “rooms across” at 3.5m each

  return (
    <div className="bg-white border rounded-2xl p-4">
      <h2 className="text-lg font-semibold mb-3">Wi-Fi Coverage (Rough)</h2>

      <div className="grid sm:grid-cols-2 gap-3">
        <L label="Router EIRP (dBm)">
          <N v={txPowerDbm} set={setTxPower} min={5} step={1}/>
        </L>
        <L label="Frequency (GHz)">
          <select value={freqGHz} onChange={e=>setFreq(Number(e.target.value))} className="border rounded-xl px-3 py-2">
            <option value={2.4}>2.4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
          </select>
        </L>
        <L label="Target RSSI (dBm)">
          <N v={targetRssi} set={setTargetRssi} min={-90} step={1}/>
        </L>
        <L label="Walls (count)">
          <N v={walls} set={setWalls} min={0} step={1}/>
        </L>
        <L label="Loss per wall (dB)">
          <N v={wallLossDb} set={setWallLossDb} min={0} step={1}/>
        </L>
        <L label="Floors (count)">
          <N v={floors} set={setFloors} min={0} step={1}/>
        </L>
        <L label="Loss per floor (dB)">
          <N v={floorLossDb} set={setFloorLossDb} min={0} step={1}/>
        </L>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        <Stat label="Estimated reach" value={`${fmt(metres,1)} m`} />
        <Stat label="≈ Rooms across" value={`${fmt(rooms,1)} rooms`} />
        <Stat label="Obstacle loss" value={`${obstLoss} dB`} />
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Heuristic only. Real performance varies by AP radios, client devices, construction materials, reflections, and airtime congestion.
      </p>
    </div>
  );
}

function L({label,children}){return(<label className="text-sm">{label}<div className="mt-1">{children}</div></label>)}
function N({v,set,min=0,step=1}){return(<input type="number" className="w-full border rounded-xl px-3 py-2" value={v} onChange={e=>set(Number(e.target.value)||0)} min={min} step={step}/>)}
function Stat({label,value}){return(<div className="rounded-xl border bg-slate-50 p-3"><div className="text-xs text-slate-600">{label}</div><div className="text-lg font-semibold">{value}</div></div>)}
function fmt(n,dp=1){return isFinite(n)?Number(n).toFixed(dp):"0"}
