import type { ProposalData, OOHSite, CampaignZone, MediaChannel } from './types';

// ── helpers ────────────────────────────────────────────────────────────────

function logo() {
  return `<div class="logo">BIZEX4U</div>`;
}

function deco() {
  return `<div class="deco tl"></div><div class="deco br"></div>`;
}

function slideLabel(n: number, section: string) {
  return `<div class="slide-label">SLIDE ${String(n).padStart(2,'0')} · ${section}</div>`;
}

function footer(items: string[], dark = false) {
  return `<div class="footer ${dark ? 'footer-dark' : ''}">
    ${items.map(i => `<span>${i}</span>`).join('<span class="dot">·</span>')}
  </div>`;
}

function purpleFooter(text: string) {
  return `<div class="footer footer-purple">${text}</div>`;
}

// ── CSS ────────────────────────────────────────────────────────────────────

const CSS = `
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; background:#fff; }

.slide {
  width:1122px; height:794px;
  background:#F3EFF8;
  position:relative; overflow:hidden;
  page-break-after:always;
  padding:52px 68px 0;
  display:flex; flex-direction:column;
}

.logo {
  position:absolute; top:28px; right:52px;
  font-size:18px; font-weight:900; color:#6B21A8;
  letter-spacing:-0.5px;
}

.deco {
  position:absolute; width:240px; height:240px;
  border-radius:50%; border:38px solid rgba(107,33,168,0.11);
  pointer-events:none;
}
.deco.tl { top:-75px; left:-75px; }
.deco.br { bottom:-75px; right:-75px; }
.deco.tr { top:-75px; right:-75px; }

.slide-label {
  font-size:9.5px; font-weight:700; letter-spacing:2.5px;
  color:#6B21A8; margin-bottom:8px; text-transform:uppercase;
}
.sec-label {
  font-size:9px; font-weight:700; letter-spacing:2px;
  color:#6B21A8; text-transform:uppercase; margin-bottom:8px;
}
.slide-title {
  font-size:44px; font-weight:900; color:#1a1a2e;
  line-height:1.08; margin-bottom:28px;
}
.slide-sub {
  font-size:15px; color:#555; line-height:1.5; margin-bottom:20px;
}

.footer {
  position:absolute; bottom:0; left:0; right:0;
  background:#6B21A8; color:#fff; font-size:11.5px;
  padding:13px 68px; display:flex; gap:14px; align-items:center;
}
.footer-dark { background:#1a1a2e; }
.footer-purple { background:#6B21A8; color:#fff; font-size:13px; font-weight:500; padding:18px 68px; }
.dot { color:rgba(255,255,255,0.4); }
.dot-dark { color:#bbb; }

/* ── white card ── */
.card {
  background:#fff; border:1.5px solid #e5e7eb;
  border-radius:16px; padding:22px;
}
.card-accent { background:#6B21A8; border-color:#6B21A8; color:#fff; }
.card-purple-light { background:#f5f0ff; border-color:#d8b4fe; }

/* ── chips ── */
.chip {
  display:inline-flex; align-items:center;
  background:#6B21A8; color:#fff;
  font-size:11px; font-weight:700; letter-spacing:.3px;
  padding:5px 14px; border-radius:99px;
}
.chip-outline {
  background:#f5f0ff; color:#6B21A8;
  border:1.5px solid #d8b4fe;
  font-size:10px; font-weight:700;
  padding:3px 10px; border-radius:99px;
}
.chip-city {
  background:#fff; border:1.5px solid #d8b4fe;
  color:#6B21A8; font-size:10.5px; font-weight:700;
  padding:4px 12px; border-radius:99px;
}

/* ── stat grid ── */
.stat-grid { display:grid; gap:14px; }
.stat-grid-4 { grid-template-columns:repeat(4,1fr); }
.stat-grid-2 { grid-template-columns:repeat(2,1fr); }
.stat-num  { font-size:34px; font-weight:900; color:#6B21A8; line-height:1; }
.stat-num-white { font-size:32px; font-weight:900; color:#fff; line-height:1; }
.stat-key  { font-size:10.5px; color:#6b7280; font-weight:600; margin-top:5px; }
.stat-key-white { font-size:10.5px; color:rgba(255,255,255,0.65); font-weight:600; margin-top:5px; }
.stat-sub  { font-size:9.5px; color:#9ca3af; margin-top:2px; }

/* ── table ── */
.tbl { width:100%; border-collapse:collapse; font-size:12px; }
.tbl thead th {
  background:#6B21A8; color:#fff;
  font-size:9.5px; font-weight:700; letter-spacing:1.5px;
  text-transform:uppercase; padding:9px 12px; text-align:left;
}
.tbl thead th:last-child { text-align:center; }
.tbl tbody td { padding:8px 12px; border-bottom:1px solid #f0ebff; color:#374151; }
.tbl tbody td:last-child { text-align:center; font-weight:800; color:#6B21A8; }
.tbl tbody tr:last-child td { border-bottom:none; }

/* ── progress bar ── */
.bar-track { flex:1; height:8px; background:#e5e7eb; border-radius:99px; overflow:hidden; }
.bar-fill  { height:100%; border-radius:99px; background:#6B21A8; }

/* ── phase cards ── */
.phase-tag {
  display:inline-flex; align-items:center;
  font-size:10px; font-weight:700; letter-spacing:.5px;
  padding:4px 12px; border-radius:99px; margin-bottom:10px;
}
.phase-1 { background:#ede9fe; color:#6B21A8; }
.phase-2 { background:#ddd6fe; color:#5b21b6; }
.phase-3 { background:#6B21A8; color:#fff; }

/* ── numbered circle ── */
.num-circle {
  width:38px; height:38px; border-radius:50%;
  background:#6B21A8; color:#fff;
  font-size:16px; font-weight:900;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0;
}
.num-circle-light {
  background:#fff; color:#6B21A8; border:2px solid #6B21A8;
}

/* ── service cards ── */
.svc-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-top:18px; }
.svc-card { background:#fff; border:1.5px solid #e5e7eb; border-radius:12px; padding:14px 12px; }
.svc-title { font-size:11.5px; font-weight:800; color:#1a1a2e; margin-bottom:5px; }
.svc-body  { font-size:10px; color:#6b7280; line-height:1.4; }

/* ── next step rows ── */
.step-row {
  display:flex; align-items:flex-start; gap:16px;
  background:#fff; border:1.5px solid #e5e7eb;
  border-radius:14px; padding:16px 20px; margin-bottom:10px;
}
.step-row-accent { background:#6B21A8; border-color:#6B21A8; }
.step-title { font-size:15px; font-weight:800; color:#1a1a2e; margin-bottom:3px; }
.step-title-white { font-size:15px; font-weight:800; color:#fff; margin-bottom:3px; }
.step-body  { font-size:11.5px; color:#6b7280; line-height:1.45; }
.step-body-white { font-size:11.5px; color:rgba(255,255,255,0.75); line-height:1.45; }

/* ── contact box ── */
.contact-box {
  background:#1a1a2e; border-radius:16px;
  padding:22px 24px; color:#fff;
}
.contact-label { font-size:9px; font-weight:700; letter-spacing:2px; color:#9ca3af; text-transform:uppercase; margin-bottom:3px; }
.contact-val   { font-size:14px; font-weight:700; color:#fff; margin-bottom:12px; }
.contact-name  { font-size:22px; font-weight:900; color:#fff; margin:6px 0 14px; }
.contact-divider { border:none; border-top:1px solid rgba(255,255,255,0.1); margin:0 0 12px; }
.barter-badge  { background:#6B21A8; color:#fff; font-size:13px; font-weight:800; padding:8px 16px; border-radius:8px; text-align:center; }
`;

// ── SLIDE BUILDERS ─────────────────────────────────────────────────────────

function slide01_cover(d: ProposalData): string {
  const date = d.pitchDate || new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  const statsLine = [
    d.brandStats.bseTicker ? `BSE: ${d.brandStats.bseTicker}` : null,
    d.brandStats.founded   ? `Est. ${d.brandStats.founded}`   : null,
    `HQ ${d.brandStats.hq}`,
  ].filter(Boolean).join(' · ');
  return `
<div class="slide" style="justify-content:center">
  ${deco()}${logo()}
  <div class="chip" style="width:fit-content;margin-bottom:28px">TRADITIONAL MEDIA PITCH</div>
  <h1 style="font-size:68px;font-weight:900;color:#1a1a2e;line-height:1.05;margin-bottom:14px">${d.clientName}</h1>
  <p style="font-size:24px;color:#6B21A8;font-weight:600;line-height:1.4;margin-bottom:28px">${d.targetGeo}</p>
  <blockquote style="font-style:italic;color:#555;font-size:14px;margin-bottom:10px">"${d.clientTagline}"</blockquote>
  <div style="width:60px;height:3px;background:#6B21A8;margin-bottom:22px"></div>
  ${statsLine ? `<p style="font-size:13px;color:#333;font-weight:600;margin-bottom:6px">${statsLine}</p>` : ''}
  ${d.ambassador ? `<p style="font-size:13px;color:#555">Brand Ambassador <strong style="color:#6B21A8">${d.ambassador.name}</strong>${d.ambassador.date ? ` · appointed ${d.ambassador.date}` : ''}</p>` : ''}
  ${footer([`Prepared by <strong>${d.preparedBy}</strong>`, 'Traditional + Barter Media', 'Pan-India T1 / T2 / T3', `${d.agencyEmail}`, `${d.commission} Commission`, '30–45% Lower Media Cost'])}
</div>`;
}

function slide02_whoweare(d: ProposalData): string {
  return `
<div class="slide">
  ${logo()}${deco()}
  ${slideLabel(2,'INTRODUCTION')}
  <h2 class="slide-title">Who we are.</h2>
  <p class="slide-sub"><strong style="color:#6B21A8">${d.preparedBy}</strong> helps brands turn unsold inventory into <strong>premium offline visibility</strong> — no cash, no waste.</p>
  <div class="stat-grid stat-grid-4" style="margin-bottom:22px">
    <div class="card"><div class="stat-num">17+</div><div class="stat-key">Years experience</div></div>
    <div class="card"><div class="stat-num">50+</div><div class="stat-key">Brands served</div></div>
    <div class="card"><div class="stat-num">100%</div><div class="stat-key">Inventory-to-media</div></div>
    <div class="card card-accent"><div class="stat-num-white">20%</div><div class="stat-key-white">Cash spend required</div></div>
  </div>
  <div class="sec-label">OUR SERVICES</div>
  <div class="svc-grid">
    <div class="svc-card"><div class="svc-title">Outdoor Advertising</div><div class="svc-body">Hoardings, billboards &amp; transit media on barter.</div></div>
    <div class="svc-card"><div class="svc-title">Society Lift Advertising</div><div class="svc-body">Exposure in residential buildings &amp; gated communities.</div></div>
    <div class="svc-card"><div class="svc-title">Mall &amp; Multiplex Branding</div><div class="svc-body">Engage shoppers &amp; moviegoers with strategic placements.</div></div>
    <div class="svc-card"><div class="svc-title">Digital Out-of-Home</div><div class="svc-body">LED screens, digital billboards &amp; interactive displays.</div></div>
    <div class="svc-card"><div class="svc-title">RWA &amp; Poster Frame Media</div><div class="svc-body">Captive residential audience via lobby &amp; lift screens.</div></div>
  </div>
  ${purpleFooter('YOUR INVENTORY · OUR MEDIA SOLUTION')}
</div>`;
}

function slide03_whybarter(d: ProposalData): string {
  const reasons = [
    { tag:'Save More Cash',        body:'Replace cash media spend with inventory exchange — free up working capital for operations and growth.' },
    { tag:'Use Idle Inventory',    body:'Turn unsold or surplus stock into premium advertising opportunities across top offline channels.' },
    { tag:'Widen Brand Reach',     body:'Access premium OOH, RWA and print media placements with zero direct spend.' },
    { tag:'Expand Into Markets',   body:'Enter new regions and markets via barter-based branding without upfront media costs.' },
    { tag:'Speed Up Distribution', body:'Activations drive product trial and faster distribution through community touchpoints.' },
    { tag:'Guaranteed Exposure',   body:'Assured, measurable brand exposure across trusted, high-footfall offline channels.' },
  ];
  return `
<div class="slide">
  ${logo()}${deco()}
  ${slideLabel(3,'THE BIZEX4U ADVANTAGE')}
  <h2 class="slide-title">Why barter?</h2>
  <p class="slide-sub">Six reasons brands like ${d.clientName} swap stock for screens.</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
    ${reasons.map(r=>`<div class="card"><div class="chip" style="margin-bottom:12px">${r.tag}</div><p style="font-size:12.5px;color:#374151;line-height:1.55">${r.body}</p></div>`).join('')}
  </div>
  ${footer([`Prepared by <strong>${d.preparedBy}</strong>`,'Traditional + Barter Media','Pan-India T1 / T2 / T3'])}
</div>`;
}

function slide04_process(d: ProposalData): string {
  const steps = [
    { n:'1', t:'Agreement',  b:'We formalize media purchases through a contract, ensuring transparency, commitment, and mutual benefits for both parties.' },
    { n:'2', t:'Selection',  b:'Brands review a detailed media and product list with rates, images, and available advertising options across all channels.' },
    { n:'3', t:'Execution',  b:'We execute campaigns end-to-end, provide full documentation, and request transaction fees only upon successful completion.' },
    { n:'4', t:'Exchange',   b:'A purchase order is issued, enabling brands to seamlessly exchange surplus inventory for premium media placements.' },
  ];
  const totalCities = d.zones.reduce((s,z)=>s+z.cities.length,0);
  return `
<div class="slide">
  ${logo()}${deco()}
  ${slideLabel(4,'HOW IT WORKS · 4 SIMPLE STEPS')}
  <h2 class="slide-title">The barter process,<br/>in 4 simple steps.</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;flex:1">
    ${steps.map(s=>`
    <div class="card card-accent" style="display:flex;flex-direction:column;gap:10px">
      <div class="num-circle-light" style="background:#fff;color:#6B21A8;width:34px;height:34px;font-size:14px">${s.n}</div>
      <div style="font-size:18px;font-weight:900;color:#fff">${s.t}</div>
      <p style="font-size:11.5px;color:rgba(255,255,255,0.8);line-height:1.5">${s.b}</p>
    </div>`).join('')}
  </div>
  <p style="font-size:13px;color:#555;padding:16px 0"><strong style="color:#6B21A8">Zero cash outflow model</strong> — ${d.clientName}'s products become the currency that unlocks premium traditional media across all ${totalCities} campaign cities.</p>
  ${footer([`Prepared by <strong>${d.preparedBy}</strong>`,'Traditional + Barter Media','Pan-India T1 / T2 / T3'])}
</div>`;
}

function slide05_clients(): string {
  const brands = ['Mishrambu','GIVA','Arya Vaidya Pharmacy','NISARA','Raw Pressery','Portronics','Zebronics','Bikano','SHARP','Carrera Eyewear','Safilo Group','Deco Window','LUX'];
  return `
<div class="slide">
  ${logo()}${deco()}
  ${slideLabel(5,"TRUSTED BY INDIA'S LEADING BRANDS")}
  <h2 class="slide-title">Trusted by India's<br/>leading brands.</h2>
  <p class="slide-sub">Brands across FMCG, Electronics, Jewellery, Eyewear, Pharma and Consumer Goods trust the Bizex4U barter model.</p>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:18px">
    ${brands.map((b,i)=>i<13
      ? `<div class="card" style="display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#1a1a2e;padding:14px">${b}</div>`
      : '').join('')}
    <div class="card card-accent" style="display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900">+ 37 more</div>
  </div>
  ${purpleFooter('17+ years · 50+ brands · Pan-India presence across FMCG, Electronics, Jewellery, Pharma, Consumer Goods &amp; Lifestyle')}
</div>`;
}

function slide06_differentiators(d: ProposalData): string {
  const diffs = [
    { tag:'Barter Media Model',        body:'30–45% lower effective media costs through barter arrangements with OOH owners and RWA networks. Your product inventory travels further than cash.' },
    { tag:'Pan-India Traditional Reach',body:'Tier 1, 2 &amp; 3 coverage across OOH, RWA digital screens and poster frames. One agency, one plan, zero fragmentation.' },
    { tag:'Transparent 10% Commission', body:'No hidden markups. Flat 10% of gross spend — billed with full rate card disclosure. You see exactly what you pay for every rupee spent.' },
    { tag:'On-Ground Intelligence',     body:`Direct vendor relationships with OOH vendors, RWA society managers and billboard owners across all campaign city locations. We know which sites perform.` },
    { tag:'Performance Tracking',       body:'Monthly reporting on reach, impressions and store-level correlation. QR codes on OOH creatives for digital attribution. Real data, real accountability.' },
  ];
  const totalCities = d.zones.reduce((s,z)=>s+z.cities.length,0);
  return `
<div class="slide">
  ${logo()}${deco()}
  ${slideLabel(6,'OUR DIFFERENTIATORS')}
  <h2 class="slide-title">Five things we do<br/>that the others don't.</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:14px">
    ${diffs.slice(0,3).map(x=>`<div class="card"><div class="chip" style="margin-bottom:10px">${x.tag}</div><p style="font-size:12px;color:#374151;line-height:1.5">${x.body}</p></div>`).join('')}
  </div>
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px">
    ${diffs.slice(3).map(x=>`<div class="card"><div class="chip" style="margin-bottom:10px">${x.tag}</div><p style="font-size:12px;color:#374151;line-height:1.5">${x.body}</p></div>`).join('')}
  </div>
  <p style="font-size:13px;color:#555;padding:12px 0;font-style:italic"><strong>${d.preparedBy}</strong> delivers <strong style="color:#6B21A8">measurable traditional media reach</strong> for ${d.clientName} — barter model, city-specific intelligence, transparent pricing.</p>
  ${footer([`Prepared by <strong>${d.preparedBy}</strong>`,'Traditional + Barter Media','Pan-India T1 / T2 / T3'])}
</div>`;
}

function slide07_brandGlance(d: ProposalData): string {
  const s = d.brandStats;
  const statCards = [
    s.storeCount ? { val: s.storeCount, key: 'Store Locations',  sub: '' }    : null,
    s.revenue    ? { val: s.revenue,    key: 'Revenue FY2025',   sub: '' }    : null,
    s.products   ? { val: s.products,   key: 'Products Offered', sub: '' }    : null,
    { val: s.yearsOp, key: 'In Operation', sub: s.founded ? `Founded ${s.founded} · ${s.hq}` : s.hq },
  ].filter(Boolean) as { val:string; key:string; sub:string }[];

  const revMix = d.stateRevenueMix;
  const competitors = d.keyCompetitors ?? [];
  const finPartners = d.financePartners ?? [];

  return `
<div class="slide">
  ${logo()}${deco()}
  ${slideLabel(7,`${d.clientName.toUpperCase()} · BRAND OVERVIEW`)}
  <h2 class="slide-title">Brand at a glance.</h2>
  <div class="stat-grid" style="grid-template-columns:repeat(${statCards.length},1fr);margin-bottom:18px">
    ${statCards.map(c=>`<div class="card"><div class="stat-num">${c.val}</div><div class="stat-key">${c.key}</div>${c.sub?`<div class="stat-sub">${c.sub}</div>`:''}</div>`).join('')}
  </div>
  <div style="display:grid;grid-template-columns:${d.ambassador?'1fr 1fr':'1fr'};gap:14px;margin-bottom:${revMix||finPartners.length?'14px':'0'}">
    ${d.ambassador ? `
    <div class="card card-accent">
      <div class="sec-label" style="color:rgba(255,255,255,0.6);margin-bottom:4px">BRAND AMBASSADOR</div>
      <div style="font-size:20px;font-weight:900;color:#fff;margin-bottom:8px">${d.ambassador.name}${d.ambassador.date?` · Appointed ${d.ambassador.date}`:''}</div>
      <p style="font-size:11.5px;color:rgba(255,255,255,0.8);line-height:1.5">${d.ambassador.context ?? ''}</p>
    </div>` : ''}
    <div class="card">
      <div class="sec-label" style="margin-bottom:4px">BRAND POSITIONING</div>
      <div style="font-size:14px;font-weight:800;color:#1a1a2e;margin-bottom:8px">${d.brandPositioning}</div>
      ${competitors.length ? `<p style="font-size:11px;color:#6b7280">Key competitors: ${competitors.join(' · ')}</p>` : ''}
    </div>
  </div>
  ${revMix && revMix.length ? `
  <div style="display:grid;grid-template-columns:${finPartners.length?'1fr 1fr':'1fr'};gap:14px">
    <div>
      <div class="sec-label">STATE REVENUE MIX</div>
      <div style="display:flex;height:22px;border-radius:6px;overflow:hidden">
        ${revMix.map((r,i)=>`<div style="flex:${r.pct};background:${i===0?'#6B21A8':i===1?'#9333ea':'#c4b5fd'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700">${r.state} · ${r.pct}%</div>`).join('')}
      </div>
    </div>
    ${finPartners.length ? `
    <div>
      <div class="sec-label">CONSUMER FINANCE PARTNERS</div>
      <p style="font-size:11px;color:#374151;line-height:1.8">${finPartners.join(' · ')}</p>
    </div>` : ''}
  </div>` : ''}
  ${footer([`${d.clientName}`,`Category: ${d.category}`,d.brandStats.bseTicker?`BSE: ${d.brandStats.bseTicker}`:`Est. ${d.brandStats.founded??''} · ${d.brandStats.hq}`].filter(Boolean))}
</div>`;
}

function slide08_strategicGap(d: ProposalData): string {
  if (!d.includeStrategicGap || !d.strategicGaps) return '';
  const gaps = d.strategicGaps;
  return `
<div class="slide">
  ${logo()}${deco()}
  ${slideLabel(8,'THE STRATEGIC GAP')}
  <h2 class="slide-title">The opportunity is<br/>hiding in plain sight.</h2>
  ${d.strategicQuote ? `
  <div class="card card-accent" style="margin-bottom:18px">
    <p style="font-size:14px;font-style:italic;color:rgba(255,255,255,0.9);line-height:1.6">"${d.strategicQuote}"</p>
  </div>` : ''}
  <div style="display:grid;grid-template-columns:repeat(${gaps.length},1fr);gap:14px;flex:1">
    ${gaps.map((g,i)=>`
    <div class="card">
      <div class="chip-outline" style="margin-bottom:12px">${g.tag ?? `GAP ${String(i+1).padStart(2,'0')}`}</div>
      <div style="font-size:16px;font-weight:800;color:#1a1a2e;margin-bottom:10px;line-height:1.3">${g.heading}</div>
      <p style="font-size:12px;color:#374151;line-height:1.55">${g.body}</p>
    </div>`).join('')}
  </div>
  <p style="font-size:12px;color:#555;padding:12px 0">
    <strong style="color:#6B21A8">${d.preparedBy}'s mandate</strong> — build ${d.clientName}'s brand footprint across all campaign cities through a structured traditional media campaign. Measurable store-level impact, 30–45% lower effective cost via barter.
  </p>
  ${footer([`Prepared by <strong>${d.preparedBy}</strong>`,'Traditional + Barter Media'])}
</div>`;
}

function slide09_zoneCoverage(d: ProposalData): string {
  const totalCities = d.zones.reduce((s,z)=>s+z.cities.length,0);
  const totalUnits  = d.zones.reduce((s,z)=>s+z.units,0);
  const totalStores = d.zones.reduce((s,z)=>z.cities.reduce((ss,c)=>ss+(c.stores??0),s),0);
  return `
<div class="slide">
  ${logo()}${deco()}
  ${slideLabel(9,`CAMPAIGN COVERAGE · ${totalCities} CITIES ACROSS ${d.zones.length} ZONES`)}
  <h2 class="slide-title">Every city. Equal weight.<br/>Unified campaign.</h2>
  <p class="slide-sub">OOH placements at station, bus stand &amp; high-footfall intersections across all ${totalCities} demanded markets.</p>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;flex:1">
    ${d.zones.map((z,i)=>`
    <div class="${i===0?'card card-accent':'card'}" style="padding:18px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div class="sec-label" style="${i===0?'color:rgba(255,255,255,0.65)':''}">${z.name.toUpperCase()}</div>
        <span class="chip-outline" style="${i===0?'background:rgba(255,255,255,0.15);color:#fff;border-color:rgba(255,255,255,0.3)':''}">${z.units} units</span>
      </div>
      ${z.cities.map(c=>`<p style="font-size:12px;color:${i===0?'rgba(255,255,255,0.85)':'#374151'};margin-bottom:4px">▸ <strong>${c.name}</strong>${c.stores?` (${c.stores} Stores)`:''}</p>`).join('')}
    </div>`).join('')}
  </div>
  ${purpleFooter(`Total scope: &nbsp;<strong>${totalCities} cities</strong>&nbsp;·&nbsp;${totalStores ? `<strong>${totalStores} active stores</strong>&nbsp;·&nbsp;` : ''}<strong>${totalUnits} billboard demand units</strong>&nbsp;· Unified OOH execution across all zones.`)}
</div>`;
}

function slide10_allCities(d: ProposalData): string {
  // group sites by city
  const cityMap = new Map<string, OOHSite[]>();
  for (const s of d.oohSites) {
    if (!cityMap.has(s.city)) cityMap.set(s.city, []);
    cityMap.get(s.city)!.push(s);
  }
  const rows = Array.from(cityMap.entries());
  const half = Math.ceil(rows.length / 2);
  const left  = rows.slice(0, half);
  const right = rows.slice(half);

  function renderTable(entries: [string, OOHSite[]][]) {
    return `<table class="tbl">
      <thead><tr>
        <th>CITY</th>
        <th>DEMANDED BILLBOARD LOCATIONS</th>
        <th>UNITS</th>
      </tr></thead>
      <tbody>
        ${entries.map(([city, sites])=>`<tr>
          <td style="font-weight:700;white-space:nowrap">${city}</td>
          <td>${sites.map(s=>s.billboardHotspot||s.neighbourhood).filter(Boolean).join(' · ')}</td>
          <td>${sites.reduce((s,x)=>s+x.units,0)}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  }

  const totalUnits = d.oohSites.reduce((s,x)=>s+x.units,0);
  return `
<div class="slide">
  ${logo()}
  ${slideLabel(10,`ALL ${rows.length} CAMPAIGN CITIES · BILLBOARD DEMAND LOCATIONS`)}
  <h2 class="slide-title">${rows.length} cities. ${totalUnits} placements.</h2>
  <p style="font-size:12px;color:#555;margin-bottom:14px">Locations demanded by ${d.clientName} — each city receiving billboard placements executed by ${d.preparedBy}.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;flex:1;overflow:hidden">
    <div>${renderTable(left)}</div>
    <div>${renderTable(right)}</div>
  </div>
  ${purpleFooter(`${rows.length} cities · 2 Station + 2 Bus Stand units per city = <strong>${totalUnits} total billboard placements</strong> · All locations verified from ${d.clientName}'s demand brief.`)}
</div>`;
}

function slide11_touchpoints(d: ProposalData): string {
  const hasRwa   = d.includeRwaNetwork && d.rwaScreens   && d.rwaScreens.length > 0;
  const hasFrame = d.includeRwaNetwork && d.posterFrames && d.posterFrames.length > 0;

  const rwaTotal   = hasRwa   ? { screens: d.rwaScreens!.reduce((s,x)=>s+(x.screens??0),0),   hh: d.rwaScreens!.reduce((s,x)=>s+x.households,0) }   : null;
  const frameTotal = hasFrame ? { frames:  d.posterFrames!.reduce((s,x)=>s+(x.frames??0),0),   hh: d.posterFrames!.reduce((s,x)=>s+x.households,0) } : null;

  const totalCities = d.zones.reduce((s,z)=>s+z.cities.length,0);
  const totalUnits  = d.oohSites.reduce((s,x)=>s+x.units,0);

  return `
<div class="slide">
  ${logo()}${deco()}
  ${slideLabel(11,'RECOMMENDED MEDIA CHANNELS · PROVEN TOUCHPOINTS')}
  <h2 class="slide-title">Three touchpoints.<br/>Zero cash outflow.</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;flex:1">
    <div class="card">
      <div class="num-circle" style="margin-bottom:14px;font-size:14px">01</div>
      <div style="font-size:19px;font-weight:900;color:#1a1a2e;margin-bottom:10px">OOH Billboard<br/>Hoardings</div>
      <p style="font-size:12px;color:#6b7280;line-height:1.55;margin-bottom:14px">Highway corridors near all store clusters. Large-format flex + LED digital. High-dwell commuter audiences for brand recall and walk-in impulse. Mapped to every ${d.clientName} store location.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="card-purple-light" style="border-radius:10px;padding:10px">
          <div style="font-size:15px;font-weight:900;color:#6B21A8">₹1.5–5L</div>
          <div style="font-size:9px;color:#6b7280;margin-top:2px">per site / month</div>
        </div>
        <div class="card-purple-light" style="border-radius:10px;padding:10px">
          <div style="font-size:15px;font-weight:900;color:#6B21A8">${totalUnits} units</div>
          <div style="font-size:9px;color:#6b7280;margin-top:2px">${totalCities} cities</div>
        </div>
      </div>
    </div>

    <div class="card ${hasRwa?'':'card-purple-light'}">
      <div class="num-circle" style="margin-bottom:14px;font-size:14px">02</div>
      <div style="font-size:19px;font-weight:900;color:#1a1a2e;margin-bottom:10px">RWA Digital<br/>Screen Network</div>
      ${hasRwa ? `<p style="font-size:12px;color:#6b7280;line-height:1.55;margin-bottom:14px">${rwaTotal!.screens} LED screens across ${d.rwaScreens!.length} city clusters — reaching ${(rwaTotal!.hh/1000).toFixed(0)}K households. 32" digital TVs in lobbies and lifts — captive premium residential audience daily.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="card-purple-light" style="border-radius:10px;padding:10px">
          <div style="font-size:15px;font-weight:900;color:#6B21A8">${rwaTotal!.screens}</div>
          <div style="font-size:9px;color:#6b7280;margin-top:2px">LED screens</div>
        </div>
        <div class="card-purple-light" style="border-radius:10px;padding:10px">
          <div style="font-size:15px;font-weight:900;color:#6B21A8">${(rwaTotal!.hh/1000).toFixed(0)}K</div>
          <div style="font-size:9px;color:#6b7280;margin-top:2px">households reached</div>
        </div>
      </div>` : `<p style="font-size:12px;color:#6b7280;line-height:1.55">LED screens across RWA properties — captive premium residential audience in lobbies and lifts daily. Available on request across target markets.</p>`}
    </div>

    <div class="card card-accent">
      <div class="num-circle-light" style="margin-bottom:14px;font-size:14px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#fff;color:#6B21A8;font-weight:900">03</div>
      <div style="font-size:19px;font-weight:900;color:#fff;margin-bottom:10px">Poster Frame<br/>Placements</div>
      ${hasFrame ? `<p style="font-size:12px;color:rgba(255,255,255,0.8);line-height:1.55;margin-bottom:14px">Elevator lobby poster frames across RWA properties — reaching ${(frameTotal!.hh/1000).toFixed(0)}K households. Left + Right placements at every elevator door — zero-skip captive viewership.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="background:rgba(255,255,255,0.15);border-radius:10px;padding:10px">
          <div style="font-size:15px;font-weight:900;color:#fff">${frameTotal!.frames}</div>
          <div style="font-size:9px;color:rgba(255,255,255,0.6);margin-top:2px">poster frames</div>
        </div>
        <div style="background:rgba(255,255,255,0.15);border-radius:10px;padding:10px">
          <div style="font-size:15px;font-weight:900;color:#fff">${(frameTotal!.hh/1000).toFixed(0)}K</div>
          <div style="font-size:9px;color:rgba(255,255,255,0.6);margin-top:2px">households reached</div>
        </div>
      </div>` : `<p style="font-size:12px;color:rgba(255,255,255,0.8);line-height:1.55">Elevator lobby poster frames across residential properties. Left + Right placements at every elevator door — zero-skip captive viewership available on request.</p>`}
    </div>
  </div>
  <p style="font-size:12px;color:#555;padding:12px 0"><strong>BARTER ADVANTAGE:</strong> OOH sites, RWA screens &amp; poster frames acquired <strong style="color:#6B21A8">30–45% below market rate</strong> — zero cash outflow from ${d.clientName}.</p>
  ${footer([`Prepared by <strong>${d.preparedBy}</strong>`,'Traditional + Barter Media','Pan-India T1 / T2 / T3'])}
</div>`;
}

function slide12_oohStrategy(d: ProposalData): string {
  const sites = d.oohSites.slice(0, 6);
  return `
<div class="slide">
  ${logo()}${deco()}
  ${slideLabel(12,'OOH STRATEGY · HIGHWAY CORRIDORS & URBAN NODES')}
  <h2 class="slide-title">Highway corridors<br/>&amp; urban nodes.</h2>
  <p style="font-size:11px;color:#555;background:#f5f0ff;border:1px solid #d8b4fe;border-radius:8px;padding:10px 14px;margin-bottom:14px">
    Sample OOH nodes across campaign zones — full ${d.oohSites.reduce((s,x)=>s+x.units,0)}-unit plan covers 2 Station + 2 Bus Stand sites per city &nbsp;|&nbsp; 90-day minimum &nbsp;|&nbsp; Barter rates
  </p>
  <table class="tbl" style="flex:1">
    <thead><tr>
      <th style="width:35%">CORRIDOR / LOCATION</th>
      <th>CITY</th>
      <th>FORMAT</th>
      <th>PRIORITY</th>
    </tr></thead>
    <tbody>
      ${sites.map(s=>`<tr>
        <td style="font-weight:600">${s.billboardHotspot || s.neighbourhood}</td>
        <td>${s.city}</td>
        <td>${s.footfallProfile?.includes('Highway')||s.footfallProfile?.includes('Transit') ? 'Flex Hoarding' : 'Gantry / Unipole'}</td>
        <td><span class="chip" style="font-size:9px;padding:3px 10px">P1</span></td>
      </tr>`).join('')}
      <tr style="background:#f5f0ff">
        <td style="font-weight:700;color:#6B21A8">Station + Bus Stand nodes — All ${d.zones.reduce((s,z)=>s+z.cities.length,0)} cities</td>
        <td style="font-weight:700;color:#6B21A8">All Cities</td>
        <td style="font-weight:700;color:#6B21A8">Flex / Gantry</td>
        <td><span class="chip" style="font-size:9px;padding:3px 10px">P1</span></td>
      </tr>
    </tbody>
  </table>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
    <div class="card" style="padding:14px">
      <div class="sec-label">FORMAT SPECS</div>
      <p style="font-size:11px;color:#374151;line-height:1.6">Flex: 180 GSM, 5-year UV print. LED: 10mm pitch, 5,000 nits. Gantry: galvanised structure, wind-rated.</p>
    </div>
    <div class="card card-accent" style="padding:14px">
      <div class="sec-label" style="color:rgba(255,255,255,0.65)">BARTER ADVANTAGE</div>
      <p style="font-size:11px;color:rgba(255,255,255,0.85);line-height:1.6">${d.preparedBy} negotiates 30–45% effective cost reduction via barter. Direct vendor relationships across all ${d.zones.reduce((s,z)=>s+z.cities.length,0)} city locations.</p>
    </div>
  </div>
  ${footer([`Prepared by <strong>${d.preparedBy}</strong>`,'Traditional + Barter Media'])}
</div>`;
}

function slideZoneCluster(slideNum: number, zone: CampaignZone, sites: OOHSite[], d: ProposalData): string {
  const cityGroups = new Map<string, OOHSite[]>();
  for (const s of sites) {
    if (!cityGroups.has(s.city)) cityGroups.set(s.city, []);
    cityGroups.get(s.city)!.push(s);
  }

  const anchor = zone.cities[0];
  const satellites = zone.cities.slice(1);

  const anchorSites = cityGroups.get(anchor.name) ?? [];
  const satCities   = satellites.map(c=>({ city: c, sites: cityGroups.get(c.name)??[] }));

  return `
<div class="slide">
  ${logo()}${deco()}
  ${slideLabel(slideNum, `${zone.name.toUpperCase()} · ${zone.cities.map(c=>c.name.toUpperCase()).join(' / ')}`)}
  <h2 class="slide-title">${zone.name}.</h2>
  <div style="display:grid;grid-template-columns:${satCities.length?'1fr 1fr':'1fr'};gap:16px;flex:1">
    <div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <span class="chip">${anchor.name.toUpperCase()}</span>
        ${anchorSites.length ? `<span style="font-size:12px;color:#6b7280">${anchorSites.length} location${anchorSites.length>1?'s':''}</span>` : ''}
      </div>
      ${anchorSites.length ? `
      <table class="tbl">
        <thead><tr>
          <th>NEIGHBOURHOOD / AREA</th><th>PIN</th><th>BILLBOARD HOTSPOT</th><th>FOOTFALL</th>
        </tr></thead>
        <tbody>
          ${anchorSites.map(s=>`<tr>
            <td style="font-weight:600">${s.neighbourhood}</td>
            <td>${s.pin}</td>
            <td>${s.billboardHotspot}</td>
            <td style="text-align:left;color:#6b7280;font-size:10.5px">${s.footfallProfile}</td>
          </tr>`).join('')}
        </tbody>
      </table>` : `<div class="card"><p style="font-size:12px;color:#6b7280">Station + Bus Stand placements to be confirmed.</p></div>`}
    </div>
    ${satCities.length ? `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-content:start">
      ${satCities.map(({city,sites:ss})=>`
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span class="chip" style="font-size:9px;padding:3px 10px">${city.name.toUpperCase()}</span>
          <span style="font-size:9.5px;color:#9ca3af">PIN ${ss[0]?.pin??'—'}</span>
        </div>
        <div style="font-size:13px;font-weight:800;color:#1a1a2e;margin-bottom:4px">${ss[0]?.billboardHotspot ?? 'Station + Bus Stand Area'}</div>
        ${ss[0] ? `<div class="sec-label" style="margin-bottom:0">BILLBOARD HOTSPOT</div>
        <p style="font-size:10.5px;color:#6b7280;margin-top:2px">${ss[0]?.billboardHotspot}</p>
        <p style="font-size:10px;color:#6B21A8;font-weight:700;margin-top:4px">${ss[0]?.footfallProfile}</p>` : ''}
      </div>`).join('')}
    </div>` : ''}
  </div>
  ${purpleFooter(`${zone.name}: ${zone.cities.map(c=>c.name).join(' · ')} — ${zone.units} units · Barter OOH at high-footfall commuter &amp; shopping intersections.`)}
</div>`;
}

function slide_rwaNetwork(slideNum: number, d: ProposalData): string {
  if (!d.includeRwaNetwork || !d.rwaScreens?.length) return '';
  const rwa   = d.rwaScreens;
  const frame = d.posterFrames ?? [];
  const rwaTot   = { screens: rwa.reduce((s,x)=>s+(x.screens??0),0), hh: rwa.reduce((s,x)=>s+x.households,0), props: rwa.reduce((s,x)=>s+x.properties,0) };
  const frameTot = { frames: frame.reduce((s,x)=>s+(x.frames??0),0), hh: frame.reduce((s,x)=>s+x.households,0), props: frame.reduce((s,x)=>s+x.properties,0) };
  return `
<div class="slide">
  ${logo()}${deco()}
  ${slideLabel(slideNum,'RWA DIGITAL SCREENS + POSTER FRAME NETWORK')}
  <h2 class="slide-title">${rwaTot.screens} screens + ${frameTot.frames} frames.</h2>
  <div class="card card-accent" style="margin-bottom:14px;padding:16px">
    <div class="sec-label" style="color:rgba(255,255,255,0.6);margin-bottom:10px">RWA DIGITAL SCREEN NETWORK · ${rwaTot.screens} SCREENS · ${rwaTot.props} PROPERTIES · ${(rwaTot.hh/1000).toFixed(0)}K HOUSEHOLDS</div>
    <div style="display:grid;grid-template-columns:repeat(${rwa.length},1fr);gap:10px">
      ${rwa.map(c=>`<div style="background:rgba(255,255,255,0.12);border-radius:10px;padding:12px">
        <div class="sec-label" style="color:rgba(255,255,255,0.5);margin-bottom:6px">${c.city.toUpperCase()}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <div><div style="font-size:18px;font-weight:900;color:#fff">${c.screens}</div><div style="font-size:9px;color:rgba(255,255,255,0.5)">Screens</div></div>
          <div><div style="font-size:18px;font-weight:900;color:#fff">${(c.households/1000).toFixed(0)}K</div><div style="font-size:9px;color:rgba(255,255,255,0.5)">Households</div></div>
          <div><div style="font-size:18px;font-weight:900;color:#fff">${c.impressions}</div><div style="font-size:9px;color:rgba(255,255,255,0.5)">Impressions/mo</div></div>
          <div><div style="font-size:18px;font-weight:900;color:#fff">${c.properties}</div><div style="font-size:9px;color:rgba(255,255,255,0.5)">Properties</div></div>
        </div>
      </div>`).join('')}
    </div>
  </div>
  ${frame.length ? `
  <div class="card card-accent" style="padding:16px">
    <div class="sec-label" style="color:rgba(255,255,255,0.6);margin-bottom:10px">POSTER FRAME PLACEMENTS · ${frameTot.frames} FRAMES · ${frameTot.props} RWA PROPERTIES · ${(frameTot.hh/1000).toFixed(0)}K HOUSEHOLDS</div>
    <div style="display:grid;grid-template-columns:repeat(${frame.length},1fr);gap:10px">
      ${frame.map(c=>`<div style="background:rgba(255,255,255,0.12);border-radius:10px;padding:12px">
        <div class="sec-label" style="color:rgba(255,255,255,0.5);margin-bottom:6px">${c.city.toUpperCase()}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <div><div style="font-size:18px;font-weight:900;color:#fff">${c.frames}</div><div style="font-size:9px;color:rgba(255,255,255,0.5)">Poster frames</div></div>
          <div><div style="font-size:18px;font-weight:900;color:#fff">${(c.households/1000).toFixed(0)}K</div><div style="font-size:9px;color:rgba(255,255,255,0.5)">Households</div></div>
          <div><div style="font-size:18px;font-weight:900;color:#fff">${c.impressions}</div><div style="font-size:9px;color:rgba(255,255,255,0.5)">Impressions/mo</div></div>
          <div><div style="font-size:18px;font-weight:900;color:#fff">${c.properties}</div><div style="font-size:9px;color:rgba(255,255,255,0.5)">Properties</div></div>
        </div>
      </div>`).join('')}
    </div>
  </div>` : ''}
  <p style="font-size:11px;color:#555;padding:10px 0 0">L+R poster frame placements at every elevator door · NCCS A/B/C residential profile · Combined network reaching <strong style="color:#6B21A8">${((rwaTot.hh+frameTot.hh)/1000).toFixed(0)}K unique households monthly</strong></p>
  ${footer([`Prepared by <strong>${d.preparedBy}</strong>`,'RWA Digital + Poster Frame Network','Barter Rates'])}
</div>`;
}

function slide_phases(slideNum: number, d: ProposalData): string {
  if (!d.includePhases || !d.phases?.length) return '';
  const phases = d.phases;
  const colors = ['phase-1','phase-2','phase-3'];
  const cardBg = ['#fff','#ede9fe','#6B21A8'];
  const textCol= ['#374151','#374151','rgba(255,255,255,0.85)'];
  const headCol= ['#1a1a2e','#1a1a2e','#fff'];
  return `
<div class="slide">
  ${logo()}${deco()}
  ${slideLabel(slideNum,'PHASED MEDIA INVESTMENT PLAN')}
  <h2 class="slide-title">From proof of concept<br/>to full amplification.</h2>
  <div style="display:grid;grid-template-columns:repeat(${phases.length},1fr);gap:14px;flex:1">
    ${phases.map((p,i)=>`
    <div class="card" style="background:${cardBg[i%3]};border-color:${i===2?'#6B21A8':'#e5e7eb'};display:flex;flex-direction:column;gap:8px">
      <div class="phase-tag ${colors[i%3]}">${p.phaseLabel}</div>
      <div style="font-size:19px;font-weight:900;color:${headCol[i%3]};margin-bottom:4px">${p.title}</div>
      ${p.bullets.map(b=>`<p style="font-size:11.5px;color:${textCol[i%3]};line-height:1.4">▸ ${b}</p>`).join('')}
      ${p.goal ? `<div style="border-top:1px solid ${i===2?'rgba(255,255,255,0.2)':'#e5e7eb'};margin-top:auto;padding-top:10px">
        <div class="sec-label" style="color:${i===2?'rgba(255,255,255,0.5)':'#6B21A8'};margin-bottom:4px">GOAL</div>
        <p style="font-size:11.5px;color:${textCol[i%3]};line-height:1.4;font-weight:600">${p.goal}</p>
      </div>` : ''}
    </div>`).join('')}
  </div>
  <p style="font-size:12px;color:#555;padding:12px 0">
    ${d.totalBarter ? `Total barter value delivered: <strong style="color:#6B21A8">${d.totalBarter}</strong> &nbsp;|&nbsp;` : ''}
    ${d.cashInvestment ? `Cash investment range: <strong style="color:#6B21A8">${d.cashInvestment}</strong> &nbsp;|&nbsp;` : ''}
    ${d.barterSaving ? `Barter saving: <strong style="color:#6B21A8">${d.barterSaving}</strong>` : ''}
  </p>
  ${footer([`Prepared by <strong>${d.preparedBy}</strong>`,'Traditional + Barter Media','Pan-India T1 / T2 / T3'])}
</div>`;
}

function slide_closing(d: ProposalData, slideNum: number): string {
  const totalCities = d.zones.reduce((s,z)=>s+z.cities.length,0);
  const totalSites  = d.oohSites.length;
  const steps = [
    { n:'01', t:'Strategy Alignment Call',      b:`30-minute call with ${d.clientName}'s marketing team to align Phase 1 priorities — OOH sites, and the creative brief.` },
    { n:'02', t:'Site Survey & Barter Negotiation', b:`${d.preparedBy} conducts on-ground site survey across all ${totalCities} demand cities within 10 working days. Negotiated barter rates presented within 15 days.` },
    { n:'03', t:'Creative Production',           b:`Brief the creative team for OOH visuals, print ads, FM spot, and cinema TVC. Production timeline: 3–4 weeks from brief sign-off.` },
    { n:'04', t:'Phase 1 Go-Live',               b:`Full Phase 1 media calendar with booking confirmations provided before any spend is committed. Go-live within 45 days of agreement signing.` },
  ];
  return `
<div class="slide">
  ${logo()}${deco()}
  ${slideLabel(slideNum,'NEXT STEPS — LET\'S LAUNCH')}
  <h2 class="slide-title">Let's launch.</h2>
  <div style="display:grid;grid-template-columns:1fr auto;gap:14px;flex:1">
    <div style="display:flex;flex-direction:column;gap:8px">
      ${steps.map((s,i)=>`
      <div class="${i===3?'step-row step-row-accent':'step-row'}">
        <div class="${i===3?'num-circle-light':'num-circle'}" style="${i===3?'background:rgba(255,255,255,0.2);color:#fff;':''}width:36px;height:36px;font-size:13px;flex-shrink:0">${s.n}</div>
        <div>
          <div class="${i===3?'step-title-white':'step-title'}">${s.t}</div>
          <div class="${i===3?'step-body-white':'step-body'}">${s.b}</div>
        </div>
      </div>`).join('')}
    </div>
    <div class="contact-box" style="width:260px;align-self:start">
      <div class="contact-label">CONTACT US</div>
      <div class="contact-name">${d.preparedBy}</div>
      <p style="font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:14px">Traditional + Barter Media<br/>Pan-India · Tier 1, 2 &amp; 3</p>
      <hr class="contact-divider"/>
      <div class="contact-label">EMAIL</div>
      <div class="contact-val">${d.agencyEmail}</div>
      <div class="contact-label">COMMISSION</div>
      <div class="contact-val">${d.commission}</div>
      <div class="contact-label">COVERAGE</div>
      <div class="contact-val" style="margin-bottom:14px">Pan-India T1, T2, T3</div>
      <div class="contact-label" style="margin-bottom:6px">COST ADVANTAGE</div>
      <div class="barter-badge">30–45% via Barter</div>
    </div>
  </div>
  ${footer([`${d.clientName} × ${d.preparedBy}`,`Traditional Media Partnership across ${totalCities} Cities`,`${d.agencyEmail}`,`${d.commission} Commission`,'Barter Advantage: 30–45%'])}
</div>`;
}

// ── MAIN EXPORT ────────────────────────────────────────────────────────────

export function buildProposalHtml(d: ProposalData): string {
  // Zone slides: one per zone
  let slideNum = 13;
  const zoneSlides = d.zones.map(zone => {
    const zoneSites = d.oohSites.filter(s => s.zone === zone.name);
    const html = slideZoneCluster(slideNum, zone, zoneSites, d);
    slideNum++;
    return html;
  });

  const rwaSlideNum   = slideNum;
  const rwaSlide      = slide_rwaNetwork(rwaSlideNum, d);
  if (rwaSlide) slideNum++;

  const phaseSlideNum = slideNum;
  const phaseSlide    = slide_phases(phaseSlideNum, d);
  if (phaseSlide) slideNum++;

  const closingSlideNum = slideNum;

  const slides = [
    slide01_cover(d),
    slide02_whoweare(d),
    slide03_whybarter(d),
    slide04_process(d),
    slide05_clients(),
    slide06_differentiators(d),
    slide07_brandGlance(d),
    d.includeStrategicGap ? slide08_strategicGap(d) : '',
    slide09_zoneCoverage(d),
    slide10_allCities(d),
    slide11_touchpoints(d),
    slide12_oohStrategy(d),
    ...zoneSlides,
    rwaSlide,
    phaseSlide,
    slide_closing(d, closingSlideNum),
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><style>${CSS}</style></head>
<body>${slides.join('\n')}</body>
</html>`;
}
