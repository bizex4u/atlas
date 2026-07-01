'use client';

import { useState } from 'react';
import { useSavedLocationsStore, type SavedLocation } from '@/lib/stores/savedLocationsStore';
import { buildProposalHtml } from '@/lib/proposal/buildHtml';
import type { ProposalData, OOHSite, CampaignZone, MediaPhase, StrategicGap, StateRevenue } from '@/lib/proposal/types';

// ── tiny helpers ──────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10.5px] font-semibold text-gray-500 mb-1">{children}</label>;
}
function Input({ value, onChange, placeholder, className = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[12.5px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/25 focus:border-[#6B21A8] ${className}`}
    />
  );
}
function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all ${
        on ? 'bg-purple-50 text-[#6B21A8] border-purple-200' : 'bg-gray-50 text-gray-400 border-gray-200'
      }`}
    >
      <div className={`w-3 h-3 rounded-full border-2 transition-all ${on ? 'bg-[#6B21A8] border-[#6B21A8]' : 'border-gray-300'}`} />
      {label}
    </button>
  );
}
function SectionHead({ children }: { children: React.ReactNode }) {
  return <p className="text-[9.5px] font-black uppercase tracking-widest text-[#6B21A8] mb-2 mt-4 first:mt-0">{children}</p>;
}

// ── derived OOH sites from saved locations ────────────────────────────────

function savedToOohSite(loc: SavedLocation, zone: string): OOHSite {
  const a    = loc.analysis;
  const city = a.knowledge?.location?.city ?? a.city ?? loc.label;
  const pin  = a.pincode ?? '';
  return {
    city,
    zone,
    neighbourhood:    a.knowledge?.location?.neighbourhood ?? loc.label,
    pin,
    billboardHotspot: `${loc.label}`,
    footfallProfile:  a.attentionResult.tier === 'High'   ? 'Commercial + High Footfall' :
                      a.attentionResult.tier === 'Medium' ? 'Market + Residential'       : 'Residential',
    units:            4,
    storeNearby:      true,
  };
}

// ── main component ────────────────────────────────────────────────────────

interface Props { open: boolean; onClose: () => void; }

type Step = 'client' | 'market' | 'campaign' | 'review' | 'generating' | 'done';

const STEPS: { id: Step; label: string }[] = [
  { id: 'client',   label: 'Client Profile'  },
  { id: 'market',   label: 'Market Context'  },
  { id: 'campaign', label: 'OOH Campaign'    },
  { id: 'review',   label: 'Review & Export' },
];

export function ProposalModal({ open, onClose }: Props) {
  const saved = useSavedLocationsStore(s => s.saved);

  // ── step ──────────────────────────────────────────────────────────────
  const [step,     setStep]     = useState<Step>('client');
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState('');

  // ── step 1: client profile ────────────────────────────────────────────
  const [clientName,    setClientName]    = useState('');
  const [clientTagline, setClientTagline] = useState('');
  const [targetGeo,     setTargetGeo]     = useState('');
  const [category,      setCategory]      = useState('');
  const [preparedBy,    setPreparedBy]    = useState('BIZEX4U');
  const [agencyEmail,   setAgencyEmail]   = useState('Yash@bizex4u.com');
  const [commission,    setCommission]    = useState('10% Transparent');

  // AI-filled hidden fields (not shown as manual inputs)
  const [isPublic,       setIsPublic]       = useState(false);
  const [hq,             setHq]             = useState('');
  const [founded,        setFounded]        = useState('');
  const [storeCount,     setStoreCount]     = useState('');
  const [revenue,        setRevenue]        = useState('');
  const [yearsOp,        setYearsOp]        = useState('');
  const [bseTicker,      setBseTicker]      = useState('');
  const [products,       setProducts]       = useState('');
  const [ambassadorName, setAmbassadorName] = useState('');
  const [ambassadorDate, setAmbassadorDate] = useState('');
  const [ambassadorCtx,  setAmbassadorCtx]  = useState('');

  const [aiFilled,    setAiFilled]    = useState(false);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiError,     setAiError]     = useState('');

  // ── step 2: market context ────────────────────────────────────────────
  const [brandPositioning, setBrandPositioning] = useState('');
  const [competitorsRaw,   setCompetitorsRaw]   = useState('');
  const [finPartnersRaw,   setFinPartnersRaw]   = useState('');

  const [includeRevMix, setIncludeRevMix] = useState(false);
  const [revMixRows,    setRevMixRows]    = useState<StateRevenue[]>([{ state: '', pct: 0 }]);

  const [includeGap,   setIncludeGap]   = useState(true);
  const [stratQuote,   setStratQuote]   = useState('');
  const [gaps,         setGaps]         = useState<StrategicGap[]>([
    { tag: 'GAP 01', heading: '', body: '' },
    { tag: 'GAP 02', heading: '', body: '' },
    { tag: 'GAP 03', heading: '', body: '' },
  ]);

  // ── step 3: campaign / OOH ────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [zoneMap,     setZoneMap]     = useState<Record<string, string>>({});  // locId → zone name

  const [includeRwa,   setIncludeRwa]   = useState(false);
  const [includePhases, setIncludePhases] = useState(false);
  const [phases, setPhases] = useState<MediaPhase[]>([
    { phaseLabel:'Phase 1 · Months 1–2', title:'Proof of Concept',   bullets:[''], goal:'' },
    { phaseLabel:'Phase 2 · Months 3–4', title:'Scale & Expand',     bullets:[''], goal:'' },
    { phaseLabel:'Phase 3 · Months 5–6', title:'Full Amplification', bullets:[''], goal:'' },
  ]);
  const [totalBarter,    setTotalBarter]    = useState('');
  const [cashInvestment, setCashInvestment] = useState('');
  const [barterSaving,   setBarterSaving]   = useState('30–45% below market');

  if (!open) return null;

  // ── step navigation ───────────────────────────────────────────────────

  const stepOrder: Step[] = ['client','market','campaign','review'];
  const stepIdx = stepOrder.indexOf(step as any);

  function nextStep() {
    if (step === 'client' && !clientName.trim()) { setError('Client name required.'); return; }
    setError('');
    const next = stepOrder[stepIdx + 1];
    if (next) setStep(next);
  }
  function prevStep() {
    const prev = stepOrder[stepIdx - 1];
    if (prev) setStep(prev);
  }

  async function autofill() {
    if (!clientName.trim()) { setAiError('Enter company name first.'); return; }
    setAiLoading(true); setAiError(''); setAiFilled(false);
    try {
      const res  = await fetch('/api/proposal/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: clientName.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.tagline)          setClientTagline(data.tagline);
      if (data.category)         setCategory(data.category);
      if (data.hq)               setHq(data.hq);
      if (data.founded)          setFounded(data.founded);
      if (data.storeCount)       setStoreCount(data.storeCount);
      if (data.revenue)          setRevenue(data.revenue);
      if (data.yearsOp)          setYearsOp(data.yearsOp);
      if (data.bseTicker)        setBseTicker(data.bseTicker);
      if (data.products)         setProducts(data.products);
      if (typeof data.isPublic === 'boolean') setIsPublic(data.isPublic);
      if (data.ambassador?.name) {
        setAmbassadorName(data.ambassador.name);
        setAmbassadorDate(data.ambassador.date ?? '');
        setAmbassadorCtx(data.ambassador.context ?? '');
      }
      if (data.brandPositioning) setBrandPositioning(data.brandPositioning);
      if (data.competitors?.length) setCompetitorsRaw(data.competitors.join(', '));
      if (data.strategicQuote)   setStratQuote(data.strategicQuote);
      if (data.gaps?.length) {
        setIncludeGap(true);
        setGaps(data.gaps.map((g: StrategicGap, i: number) => ({
          tag: `GAP ${String(i+1).padStart(2,'0')}`,
          heading: g.heading ?? '',
          body:    g.body    ?? '',
        })));
      }
      setAiFilled(true);
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : 'AI autofill failed.');
    } finally {
      setAiLoading(false);
    }
  }

  function toggleLocation(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  // ── PDF generation ────────────────────────────────────────────────────

  async function generate() {
    setError('');
    setStep('generating');
    setProgress(10);

    const selLocs = selectedIds.map(id => saved.find(l => l.id === id)!).filter(Boolean);

    // Build zones from zone map
    const zoneNames = [...new Set(Object.values(zoneMap).filter(Boolean))];
    const zones: CampaignZone[] = zoneNames.map(zn => {
      const zoneLocs = selLocs.filter(l => zoneMap[l.id] === zn);
      const cities = [...new Map(zoneLocs.map(l => {
        const city = l.analysis.knowledge?.location?.city ?? l.analysis.city ?? l.label;
        return [city, { name: city, stores: undefined as number|undefined }];
      })).values()];
      return { name: zn, cities, units: cities.length * 4 };
    });

    const oohSites: OOHSite[] = selLocs.map(l => savedToOohSite(l, zoneMap[l.id] ?? 'Campaign Zone'));

    const allCities = [...new Set(oohSites.map(s => s.city))];
    const geoStr = targetGeo || `${allCities.length} cities`;

    const data: ProposalData = {
      clientName:       clientName.trim(),
      clientTagline:    clientTagline.trim() || 'Expanding reach across key markets.',
      targetGeo:        geoStr,
      isPublicCompany: isPublic,
      brandStats: {
        storeCount: storeCount || '',
        revenue:    isPublic && revenue ? revenue : undefined,
        products:   products  || undefined,
        yearsOp:    yearsOp   || '—',
        founded:    founded   || undefined,
        hq:         hq        || '—',
        bseTicker:  isPublic && bseTicker ? bseTicker : undefined,
      },
      ambassador: ambassadorName ? {
        name:    ambassadorName,
        date:    ambassadorDate || undefined,
        context: ambassadorCtx  || undefined,
      } : undefined,
      brandPositioning:  brandPositioning || `India's leading ${category || 'brand'} expanding into new markets.`,
      category,
      stateRevenueMix:   includeRevMix ? revMixRows.filter(r => r.state && r.pct > 0) : undefined,
      financePartners:   finPartnersRaw ? finPartnersRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      keyCompetitors:    competitorsRaw ? competitorsRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined,

      includeStrategicGap: includeGap,
      strategicQuote:  includeGap ? stratQuote || undefined : undefined,
      strategicGaps:   includeGap ? gaps.filter(g => g.heading) : undefined,

      zones:    zones.length ? zones : [{ name:'Campaign Zone', cities: allCities.map(c=>({name:c})), units: allCities.length*4 }],
      oohSites,

      includeRwaNetwork: includeRwa,
      rwaScreens:  undefined,
      posterFrames: undefined,

      includePhases,
      phases:        includePhases ? phases : undefined,
      totalBarter:   totalBarter   || undefined,
      cashInvestment: cashInvestment || undefined,
      barterSaving:  barterSaving  || undefined,

      preparedBy:  preparedBy.trim()  || 'BIZEX4U',
      agencyEmail: agencyEmail.trim() || 'Yash@bizex4u.com',
      commission:  commission.trim()  || '10% Transparent',
    };

    try {
      setProgress(25);
      const html = buildProposalHtml(data);
      setProgress(38);

      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      setProgress(48);

      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:1122px;height:794px;border:none;visibility:hidden;';
      document.body.appendChild(iframe);

      await new Promise<void>(res => { iframe.onload = () => res(); iframe.srcdoc = html; });
      setProgress(56);

      const doc = new jsPDF({ orientation:'landscape', unit:'px', format:[1122,794] });
      const slides = Array.from(iframe.contentDocument!.querySelectorAll('.slide')) as HTMLElement[];

      for (let i = 0; i < slides.length; i++) {
        const canvas = await html2canvas(slides[i], { scale:2, useCORS:true, allowTaint:true, width:1122, height:794 });
        const img = canvas.toDataURL('image/jpeg', 0.93);
        if (i > 0) doc.addPage([1122,794],'landscape');
        doc.addImage(img,'JPEG',0,0,1122,794);
        setProgress(56 + Math.round(((i+1)/slides.length)*40));
      }

      document.body.removeChild(iframe);
      doc.save(`${clientName.trim().replace(/\s+/g,'_')}_Proposal_${preparedBy.trim()}.pdf`);
      setStep('done');
    } catch (e) {
      console.error(e);
      setError('PDF generation failed — check console.');
      setStep('review');
    }
  }

  // ── render helpers ────────────────────────────────────────────────────

  function StepNav() {
    return (
      <div className="flex items-center gap-1 px-7 pt-4 pb-2 shrink-0">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              step === s.id ? 'bg-purple-50 text-[#6B21A8]' :
              stepOrder.indexOf(step as any) > i ? 'text-emerald-600' : 'text-gray-300'
            }`} onClick={() => stepOrder.indexOf(step as any) > i && setStep(s.id)}>
              <div className={`w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center ${
                step === s.id ? 'bg-[#6B21A8] text-white' :
                stepOrder.indexOf(step as any) > i ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>{stepOrder.indexOf(step as any) > i ? '✓' : i+1}</div>
              {s.label}
            </div>
            {i < STEPS.length-1 && <div className="w-6 h-px bg-gray-200" />}
          </div>
        ))}
      </div>
    );
  }

  // ── step panels ───────────────────────────────────────────────────────

  function StepClient() {
    const filledTags = [
      isPublic && bseTicker   ? `BSE: ${bseTicker}` : null,
      hq                      ? `HQ: ${hq}` : null,
      founded                 ? `Est. ${founded}` : null,
      storeCount              ? `${storeCount} stores` : null,
      revenue                 ? revenue : null,
      yearsOp                 ? yearsOp : null,
      products                ? products : null,
      ambassadorName          ? `Ambassador: ${ambassadorName}` : null,
      isPublic                ? 'Public company' : (aiFilled ? 'Private company' : null),
    ].filter(Boolean) as string[];

    return (
      <div className="space-y-3">
        <SectionHead>Client</SectionHead>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Brand / Client Name *</Label>
            <div className="flex gap-2">
              <Input value={clientName} onChange={setClientName} placeholder="e.g. Voltas, Aditya Vision, Bikano" />
              <button
                onClick={autofill}
                disabled={aiLoading || !clientName.trim()}
                className="shrink-0 flex items-center gap-1.5 rounded-xl bg-[#6B21A8] text-white text-[11px] font-bold px-3 py-2 hover:bg-[#5b1a91] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {aiLoading
                  ? <span className="animate-spin">⟳</span>
                  : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                }
                {aiLoading ? 'Filling…' : 'AI Auto-fill'}
              </button>
            </div>
            {aiError && <p className="text-[10.5px] text-red-500 mt-1">{aiError}</p>}
          </div>
          <div><Label>Category / Industry</Label><Input value={category} onChange={setCategory} placeholder="e.g. Electronics Retail" /></div>
          <div className="col-span-2"><Label>Brand Tagline</Label><Input value={clientTagline} onChange={setClientTagline} placeholder="e.g. Retailing technology to the remotest of households." /></div>
          <div className="col-span-2"><Label>Campaign Geography</Label><Input value={targetGeo} onChange={setTargetGeo} placeholder="e.g. A traditional media plan for 26 cities across Uttar Pradesh" /></div>
        </div>

        {aiFilled && filledTags.length > 0 && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
            <p className="text-[9.5px] font-black text-emerald-700 uppercase tracking-widest mb-2">AI filled {filledTags.length} fields</p>
            <div className="flex flex-wrap gap-1.5">
              {filledTags.map(t => (
                <span key={t} className="text-[10px] font-semibold bg-white border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-lg">{t}</span>
              ))}
            </div>
            <p className="text-[10px] text-emerald-600 mt-2">These appear in your PDF slides. Edit anything in Market Context →</p>
          </div>
        )}

        <SectionHead>Agency Details</SectionHead>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Prepared By</Label><Input value={preparedBy} onChange={setPreparedBy} /></div>
          <div><Label>Agency Email</Label><Input value={agencyEmail} onChange={setAgencyEmail} /></div>
          <div><Label>Commission</Label><Input value={commission} onChange={setCommission} /></div>
        </div>
      </div>
    );
  }

  function StepMarket() {
    return (
      <div className="space-y-3">
        <SectionHead>Brand Positioning</SectionHead>
        <div>
          <Label>Positioning Statement (1–2 lines)</Label>
          <textarea
            value={brandPositioning}
            onChange={e => setBrandPositioning(e.target.value)}
            placeholder="India's only BSE-listed multi-brand CE retailer outside the metros. Dominant in Bihar, aggressively growing in UP."
            rows={2}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[12.5px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/25 focus:border-[#6B21A8] resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Key Competitors (comma-separated)</Label><Input value={competitorsRaw} onChange={setCompetitorsRaw} placeholder="Reliance Digital, Vijay Sales, Croma" /></div>
          <div><Label>Finance / Channel Partners (optional)</Label><Input value={finPartnersRaw} onChange={setFinPartnersRaw} placeholder="Bajaj Finserv, HDFC, Kotak…" /></div>
        </div>

        <div className="flex gap-2 flex-wrap pt-1">
          <Toggle on={includeRevMix} onToggle={() => setIncludeRevMix(v=>!v)} label="State revenue mix chart" />
          <Toggle on={includeGap}    onToggle={() => setIncludeGap(v=>!v)}    label="Strategic gap slide" />
        </div>

        {includeRevMix && (
          <div className="pl-2 border-l-2 border-purple-100 space-y-2">
            <Label>State Revenue Mix</Label>
            {revMixRows.map((r,i) => (
              <div key={i} className="flex gap-2">
                <Input value={r.state} onChange={v => setRevMixRows(prev => prev.map((x,j)=>j===i?{...x,state:v}:x))} placeholder="State" className="flex-1" />
                <input type="number" value={r.pct||''} onChange={e => setRevMixRows(prev => prev.map((x,j)=>j===i?{...x,pct:Number(e.target.value)}:x))}
                  placeholder="%" className="w-16 rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-[12.5px] text-center focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/25" />
                {i === revMixRows.length-1 && (
                  <button onClick={()=>setRevMixRows(p=>[...p,{state:'',pct:0}])} className="text-[11px] text-[#6B21A8] font-bold px-2">+ Add</button>
                )}
              </div>
            ))}
          </div>
        )}

        {includeGap && (
          <div className="pl-2 border-l-2 border-purple-100 space-y-3">
            <div><Label>Strategic Quote (appears on dark banner)</Label>
              <textarea value={stratQuote} onChange={e=>setStratQuote(e.target.value)}
                placeholder="75% revenue from Bihar. Only 13% from UP — the opportunity is hiding in plain sight. Traditional media is the unlock that digital alone cannot provide."
                rows={2} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[12.5px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/25 resize-none" />
            </div>
            {gaps.map((g,i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <div><Label>Gap {i+1} Heading</Label><Input value={g.heading} onChange={v=>setGaps(p=>p.map((x,j)=>j===i?{...x,heading:v}:x))} placeholder="Low brand recall across target market" /></div>
                <div><Label>Gap {i+1} Body</Label><Input value={g.body} onChange={v=>setGaps(p=>p.map((x,j)=>j===i?{...x,body:v}:x))} placeholder="Despite X stores, brand awareness remains sub-15%…" /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function StepCampaign() {
    // Group saved by unique cities for display
    return (
      <div className="space-y-3">
        <SectionHead>Select Locations & Assign Zones</SectionHead>
        <p className="text-[11px] text-gray-400">Pick locations from your saved list. Assign each a zone name (e.g. "Central UP", "Awadh"). Zones become cluster slides in the PDF.</p>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {saved.length === 0 && <p className="text-[12px] text-gray-400 text-center py-6">No saved locations. Save some from the map first.</p>}
          {saved.map(loc => {
            const sel   = selectedIds.includes(loc.id);
            const score = loc.analysis.attentionResult.compositeScore;
            const tier  = loc.analysis.attentionResult.tier;
            const tc    = tier==='High'?'text-emerald-600':tier==='Medium'?'text-amber-600':'text-red-500';
            const city  = loc.analysis.knowledge?.location?.city ?? loc.analysis.city ?? loc.label;
            return (
              <div key={loc.id} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${sel?'border-[#6B21A8] bg-purple-50/50':'border-gray-100 bg-gray-50'}`}>
                <button onClick={() => toggleLocation(loc.id)} className={`h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${sel?'bg-[#6B21A8] border-[#6B21A8]':'border-gray-300'}`}>
                  {sel && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] font-bold text-gray-900 truncate">{loc.label}</p>
                  <p className="text-[10px] text-gray-400">{city} · {loc.analysis.pincode}</p>
                </div>
                <span className={`text-[11px] font-black tabular-nums ${tc}`}>{score}</span>
                {sel && (
                  <input
                    value={zoneMap[loc.id] ?? ''}
                    onChange={e => setZoneMap(prev => ({...prev,[loc.id]:e.target.value}))}
                    placeholder="Zone (e.g. Awadh)"
                    className="w-32 rounded-lg border border-purple-200 bg-white px-2 py-1 text-[11px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#6B21A8]"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 flex-wrap pt-1">
          <Toggle on={includeRwa}    onToggle={() => setIncludeRwa(v=>!v)}    label="RWA screen network slide" />
          <Toggle on={includePhases} onToggle={() => setIncludePhases(v=>!v)} label="Phased media plan slide" />
        </div>

        {includePhases && (
          <div className="pl-2 border-l-2 border-purple-100 space-y-3">
            <Label>Campaign Phases</Label>
            {phases.map((p,i) => (
              <div key={i} className="space-y-1.5">
                <p className="text-[10px] font-bold text-[#6B21A8]">Phase {i+1}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={p.phaseLabel} onChange={v=>setPhases(pr=>pr.map((x,j)=>j===i?{...x,phaseLabel:v}:x))} placeholder="Phase 1 · Months 1–2" />
                  <Input value={p.title}      onChange={v=>setPhases(pr=>pr.map((x,j)=>j===i?{...x,title:v}:x))}      placeholder="Proof of Concept" />
                </div>
                <textarea
                  value={p.bullets.join('\n')}
                  onChange={e => setPhases(pr=>pr.map((x,j)=>j===i?{...x,bullets:e.target.value.split('\n')}:x))}
                  placeholder="One bullet per line — OOH: Station + Bus Stand sites across all cities&#10;RWA Screens: 20 pilot LED screens"
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[11.5px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/25 resize-none"
                />
                <Input value={p.goal} onChange={v=>setPhases(pr=>pr.map((x,j)=>j===i?{...x,goal:v}:x))} placeholder="Phase goal summary…" />
              </div>
            ))}
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Total Barter Value</Label><Input value={totalBarter} onChange={setTotalBarter} placeholder="Rs. 82–90 Lakh" /></div>
              <div><Label>Cash Investment</Label><Input value={cashInvestment} onChange={setCashInvestment} placeholder="Rs. 61–90 Lakh over 6 months" /></div>
              <div><Label>Barter Saving</Label><Input value={barterSaving} onChange={setBarterSaving} /></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function StepReview() {
    const totalCities = [...new Set(selectedIds.map(id => {
      const loc = saved.find(l=>l.id===id);
      return loc?.analysis.knowledge?.location?.city ?? loc?.analysis.city ?? '';
    }))].length;
    const zones = [...new Set(Object.values(zoneMap).filter(Boolean))];
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-100 p-4 space-y-1">
            <p className="text-[9.5px] font-black text-[#6B21A8] uppercase tracking-widest mb-2">Client</p>
            <p className="text-[14px] font-black text-gray-900">{clientName}</p>
            <p className="text-[11px] text-gray-400">{category}</p>
            <p className="text-[11px] text-gray-500 italic">"{clientTagline}"</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-4 space-y-1">
            <p className="text-[9.5px] font-black text-[#6B21A8] uppercase tracking-widest mb-2">Campaign</p>
            <p className="text-[13px] font-bold text-gray-900">{selectedIds.length} sites · {totalCities} cities</p>
            <p className="text-[11px] text-gray-500">{zones.length ? `${zones.length} zones: ${zones.join(', ')}` : 'No zones assigned'}</p>
            <p className="text-[11px] text-gray-400">{targetGeo}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
          <p className="text-[9.5px] font-black text-[#6B21A8] uppercase tracking-widest mb-2">Slides to be generated</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Cover','Who We Are','Why Barter?','Process','Past Clients','Differentiators',
              'Brand at a Glance',
              includeGap ? 'Strategic Gap' : null,
              'Zone Coverage','All Cities Table','Media Channels','OOH Strategy',
              ...([...new Set(Object.values(zoneMap).filter(Boolean))].map(z=>`Zone: ${z}`)),
              includeRwa ? 'RWA Network' : null,
              includePhases ? 'Phased Plan' : null,
              'Next Steps',
            ].filter(Boolean).map(s=>(
              <span key={s} className="text-[10px] font-semibold bg-white border border-gray-100 text-gray-600 px-2 py-1 rounded-lg">{s}</span>
            ))}
          </div>
        </div>
        {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
      </div>
    );
  }

  // ── loading / done ────────────────────────────────────────────────────

  if (step === 'generating') return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center gap-5 w-72">
        <div className="relative h-16 w-16">
          <svg className="animate-spin h-16 w-16" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="6"/>
            <circle cx="32" cy="32" r="28" fill="none" stroke="#6B21A8" strokeWidth="6"
              strokeLinecap="round" strokeDasharray={`${progress*1.76} 176`}/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[13px] font-black text-[#6B21A8]">{progress}%</div>
        </div>
        <div className="text-center">
          <p className="text-[15px] font-black text-gray-900 mb-1">Building proposal…</p>
          <p className="text-[11.5px] text-gray-400">
            {progress < 40 ? 'Rendering slides…' : progress < 56 ? 'Loading PDF engine…' : 'Capturing slides…'}
          </p>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#6B21A8] rounded-full transition-all" style={{width:`${progress}%`}} />
        </div>
      </div>
    </div>
  );

  if (step === 'done') return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center gap-5 w-80">
        <div className="h-16 w-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-[16px] font-black text-gray-900 mb-1">Proposal downloaded!</p>
          <p className="text-[12px] text-gray-400 leading-relaxed">PDF saved to Downloads.<br/>Share directly with the client.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setStep('client'); setProgress(0); }} className="text-[12px] font-semibold text-gray-500 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors">New Proposal</button>
          <button onClick={onClose} className="text-[12px] font-bold text-white bg-[#6B21A8] rounded-xl px-5 py-2 hover:bg-[#5b1a91] transition-colors">Done</button>
        </div>
      </div>
    </div>
  );

  // ── main modal ────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step==='client'?onClose:undefined} />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-[15px] font-black text-gray-900">Campaign Proposal Generator</p>
            <p className="text-[10.5px] text-gray-400 mt-0.5">Build a professional OOH pitch deck from your saved locations</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <StepNav />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 pb-5">
          {error && <p className="text-[12px] text-red-500 font-medium mb-3">{error}</p>}
          {step === 'client'   && StepClient()}
          {step === 'market'   && StepMarket()}
          {step === 'campaign' && StepCampaign()}
          {step === 'review'   && StepReview()}
        </div>

        {/* Footer nav */}
        <div className="border-t border-gray-100 px-7 py-4 flex items-center justify-between bg-gray-50/50 shrink-0">
          <button onClick={stepIdx>0?prevStep:onClose} className="text-[12px] font-semibold text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:bg-white transition-colors">
            {stepIdx === 0 ? 'Cancel' : '← Back'}
          </button>
          {step !== 'review'
            ? <button onClick={nextStep} className="text-[12px] font-bold text-white bg-[#6B21A8] rounded-xl px-5 py-2 hover:bg-[#5b1a91] transition-colors">
                Continue →
              </button>
            : <button onClick={generate} disabled={selectedIds.length===0} className="flex items-center gap-2 text-[12px] font-bold text-white bg-[#6B21A8] rounded-xl px-5 py-2 hover:bg-[#5b1a91] transition-colors disabled:opacity-40">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                </svg>
                Generate PDF
              </button>
          }
        </div>
      </div>
    </div>
  );
}
