'use client';

import { usePanelStore } from '@/lib/stores/panelStore';
import type { LocationAnalysis } from '@/lib/intelligence/LocationAnalysisEngine';

function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-mono text-zinc-400 w-14 text-right">{value.toLocaleString()}/km²</span>
    </div>
  );
}

function ClassRow({ label, pct, active }: { label: string; pct: number; active?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className={['text-[11px] w-28 shrink-0', active ? 'text-zinc-200 font-medium' : 'text-zinc-500'].join(' ')}>
        {label}
      </span>
      <div className="flex-1 h-1 rounded-full bg-zinc-800">
        <div
          className={active ? 'h-full rounded-full bg-blue-500' : 'h-full rounded-full bg-zinc-700'}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-mono text-zinc-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-4 space-y-3">
      {[...Array(6)].map((_, i) => <div key={i} className="h-3 rounded bg-zinc-800 animate-pulse" />)}
    </div>
  );
}

function inferClassDistribution(analysis: LocationAnalysis) {
  const { populationRecord, catchmentRecord, pincodeRecord } = analysis;
  const density = populationRecord?.densityPerKm2 ?? (pincodeRecord?.populationDensity ?? 5000);
  const income  = populationRecord?.incomeTier ?? 'Middle';

  // Derive class distribution from density + income tier
  if (income === 'High' || density > 25000) {
    return { upperClass: 22, upperMiddle: 38, middle: 25, emerging: 10, workingClass: 5 };
  }
  if (income === 'Middle' || density > 10000) {
    return { upperClass: 5, upperMiddle: 20, middle: 40, emerging: 22, workingClass: 13 };
  }
  return { upperClass: 2, upperMiddle: 8, middle: 25, emerging: 35, workingClass: 30 };
}

function DemographicsContent({ analysis }: { analysis: LocationAnalysis }) {
  const { populationRecord, catchmentRecord, pincodeRecord } = analysis;
  const density   = populationRecord?.densityPerKm2 ?? (pincodeRecord?.populationDensity ?? 5000);
  const commRatio = catchmentRecord.commercialDensityRatio;
  const classes   = inferClassDistribution(analysis);
  const zone      = pincodeRecord?.zoneType ?? 'semi-urban';
  const income    = populationRecord?.incomeTier ?? 'Middle';

  // Derive area category label
  const areaCategory =
    zone === 'metro' && income === 'High' ? 'Premium Metro'
    : zone === 'metro'                    ? 'Urban Metro'
    : zone === 'urban'                    ? 'Developed Urban'
    : zone === 'semi-urban'               ? 'Semi-Urban Growth'
    : 'Rural / Emerging';

  // Dominant class
  const dominant = Object.entries(classes).sort((a, b) => b[1] - a[1])[0][0]
    .replace(/([A-Z])/g, ' $1').trim();

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Summary card */}
      <div className="m-3 rounded-xl border border-zinc-800 bg-[#1a1f2c] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Area Category</span>
          <span className="text-[11px] font-medium text-blue-400">{areaCategory}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Dominant Class</span>
          <span className="text-[11px] font-medium text-zinc-200 capitalize">{dominant}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Income Tier</span>
          <span className="text-[11px] font-medium text-zinc-200">{income}</span>
        </div>
      </div>

      {/* Class distribution */}
      <section className="px-4 pb-4">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3 pt-1">Class Distribution</p>
        <ClassRow label="Upper Class"        pct={classes.upperClass}   active={classes.upperClass > 15}   />
        <ClassRow label="Upper Middle"       pct={classes.upperMiddle}  active={classes.upperMiddle > 25}  />
        <ClassRow label="Middle"             pct={classes.middle}       active={classes.middle > 30}       />
        <ClassRow label="Emerging"           pct={classes.emerging}     active={classes.emerging > 30}     />
        <ClassRow label="Working Class"      pct={classes.workingClass} active={classes.workingClass > 30} />
      </section>

      {/* Density metrics */}
      <section className="px-4 pb-4 border-t border-zinc-800">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3 pt-3">Density Metrics</p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[11px] text-zinc-400">Population Density</span>
            </div>
            <StatBar value={density} max={50000} color="bg-blue-500" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[11px] text-zinc-400">Residential Density</span>
            </div>
            <StatBar value={Math.round(density * (1 - commRatio))} max={50000} color="bg-indigo-500" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[11px] text-zinc-400">Commercial Density</span>
            </div>
            <StatBar value={Math.round(density * commRatio)} max={50000} color="bg-amber-500" />
          </div>
        </div>
      </section>

      {/* Age distribution */}
      {populationRecord && (
        <section className="px-4 pb-4 border-t border-zinc-800">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3 pt-3">Age Distribution</p>
          <ClassRow label="Under 18"   pct={Math.round(populationRecord.ageDistribution.under18Pct * 100)}    />
          <ClassRow label="Working Age" pct={Math.round(populationRecord.ageDistribution.workingAgePct * 100)} active />
          <ClassRow label="Over 60"    pct={Math.round(populationRecord.ageDistribution.over60Pct * 100)}     />
        </section>
      )}
    </div>
  );
}

export function DemographicsTab() {
  const analysis  = usePanelStore((s) => s.analysis);
  const isLoading = usePanelStore((s) => s.isLoading);
  if (isLoading) return <Skeleton />;
  if (!analysis) return null;
  return <DemographicsContent analysis={analysis} />;
}
