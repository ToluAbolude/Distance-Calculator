import * as React from "react";
export default function CableLengthHelper(){
  const [straightM, setStraightM] = React.useState(0);
  const [bends, setBends] = React.useState(4);      // number of 90°-ish bends
  const [perBendPct, setPerBendPct] = React.useState(3); // % overhead per bend
  const [slackPct, setSlackPct] = React.useState(15);
  const [standard, setStandard] = React.useState("HDMI"); // HDMI | Cat6

  const bendFactor = 1 + (Math.max(0,bends) * Math.max(0,perBendPct))/100;
  const withBends = straightM * bendFactor;
  const withSlack = withBends * (1 + Math.max(0,slackPct)/100);

  const warn = (() => {
    if (standard === "HDMI") {
      if (withSlack >= 10) return "For ~10m+ consider ACTIVE HDMI or fiber/HDBaseT.";
      if (withSlack >= 7)  return "7–10m passive may be unreliable at 4K/60—buy quality.";
    } else {
      if (withSlack > 100) return "Cat6 permanent link spec ~90m (+patch to 100m).";
    }
    return null;
  })();

  return (
    <div className="bg-white border rounded-2xl p-4">
      <h2 className="text-lg font-semibold mb-3">Cable Length Helper</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <L label="Standard">
          <select value={standard} onChange={e=>setStandard(e.target.value)} className="border rounded-xl px-3 py-2">
            <option>HDMI</option><option>Cat6</option>
          </select>
        </L>
        <L label="Straight-line (m)">
          <N v={straightM} set={setStraightM} min={0} step={0.1}/>
        </L>
        <L label="Bends (count)">
          <N v={bends} set={setBends} min={0} step={1}/>
        </L>
        <L label="Per-bend overhead (%)">
          <N v={perBendPct} set={setPerBendPct} min={0} step={1}/>
        </L>
        <L label="Safety slack (%)">
          <N v={slackPct} set={setSlackPct} min={0} step={1}/>
        </L>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        <Stat label="With bends" value={`${fmt(withBends,2)} m`} />
        <Stat label={`+${slackPct}% slack`} value={`${fmt(withSlack,2)} m`} />
        <Stat label="Round up to buy" value={`${Math.ceil(withSlack)} m`} />
      </div>

      {warn && <p className="mt-3 text-sm text-amber-700">{warn}</p>}
      <p className="mt-2 text-xs text-slate-500">Tip: add a service loop near endpoints.</p>
    </div>
  );
}

function L({label, children}){return(<label className="text-sm">{label}<div className="mt-1">{children}</div></label>)}
function N({v,set,min=0,step=1}){return(<input type="number" className="w-full border rounded-xl px-3 py-2" value={v} onChange={e=>set(Math.max(min, Number(e.target.value)||0))} min={min} step={step}/>)}
function Stat({label,value}){return(<div className="rounded-xl border bg-slate-50 p-3"><div className="text-xs text-slate-600">{label}</div><div className="text-lg font-semibold">{value}</div></div>)}
function fmt(n,dp=1){return isFinite(n)?Number(n).toFixed(dp):"0"}
