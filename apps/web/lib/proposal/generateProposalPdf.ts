import type { SavedLocation } from '@/lib/stores/savedLocationsStore';

export interface ProposalInput {
  clientName:    string;
  clientTagline: string;
  objective:     string;
  duration:      string;
  preparedBy:    string;
  cities:        string[];
  locations:     SavedLocation[];
}

function scoreColor(score: number) {
  if (score >= 75) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function tierBadge(tier: string) {
  const map: Record<string, string> = {
    High:   'background:#dcfce7;color:#15803d;',
    Medium: 'background:#fef9c3;color:#854d0e;',
    Low:    'background:#fee2e2;color:#991b1b;',
  };
  return map[tier] ?? map.Medium;
}

function fmtK(n: number) {
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1000)     return `${Math.round(n / 1000)}K`;
  return String(n);
}

// Build one full HTML document that contains all slides as A4-sized pages
export function buildProposalHtml(input: ProposalInput): string {
  const { clientName, clientTagline, objective, duration, preparedBy, cities, locations } = input;
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const coverSlide = `
<div class="slide cover-slide">
  <div class="cover-deco top-left"></div>
  <div class="cover-deco bottom-right"></div>
  <div class="cover-badge">TRADITIONAL MEDIA PITCH</div>
  <h1 class="cover-title">${clientName}</h1>
  <p class="cover-subtitle">A traditional media plan for<br/><strong>${cities.length} cities</strong> across ${cities.slice(0, 3).join(', ')}${cities.length > 3 ? ` & ${cities.length - 3} more` : ''}.</p>
  <blockquote class="cover-quote">"${clientTagline}"</blockquote>
  <div class="cover-meta">
    <span>Campaign Objective: ${objective}</span>
    <span class="dot">·</span>
    <span>Duration: ${duration}</span>
    <span class="dot">·</span>
    <span>${today}</span>
  </div>
  <div class="cover-footer">
    <span>Prepared by <strong>${preparedBy}</strong></span>
    <span class="dot">·</span>
    <span>Traditional + Barter Media</span>
    <span class="dot">·</span>
    <span>Pan-India T1 / T2 / T3</span>
    <span class="dot">·</span>
    <span>10% Transparent Commission</span>
    <span class="dot">·</span>
    <span>30–45% Lower Media Cost</span>
  </div>
</div>`;

  const summarySlide = `
<div class="slide summary-slide">
  <div class="slide-label">CAMPAIGN OVERVIEW</div>
  <h2 class="slide-title">Site Intelligence<br/>Summary.</h2>
  <div class="stats-grid">
    <div class="stat-card accent">
      <div class="stat-num">${locations.length}</div>
      <div class="stat-label">Sites Analysed</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${cities.length}</div>
      <div class="stat-label">Cities Covered</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${fmtK(locations.reduce((s, l) => s + l.analysis.catchmentRecord.estimatedPopulation, 0))}</div>
      <div class="stat-label">Total Catchment Pop.</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${Math.round(locations.reduce((s, l) => s + l.analysis.attentionResult.compositeScore, 0) / locations.length)}</div>
      <div class="stat-label">Avg Attention Score</div>
    </div>
  </div>
  <div class="section-label">SITE BREAKDOWN BY TIER</div>
  <div class="tier-bars">
    ${(['High', 'Medium', 'Low'] as const).map(tier => {
      const count = locations.filter(l => l.analysis.attentionResult.tier === tier).length;
      const pct   = Math.round((count / locations.length) * 100);
      const color = tier === 'High' ? '#10b981' : tier === 'Medium' ? '#f59e0b' : '#ef4444';
      return `
      <div class="tier-bar-row">
        <span class="tier-name">${tier} Priority</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
        <span class="tier-count">${count} sites</span>
      </div>`;
    }).join('')}
  </div>
  <div class="cities-grid">
    ${cities.map(c => `<div class="city-chip">${c}</div>`).join('')}
  </div>
</div>`;

  const locationSlides = locations.map((loc, idx) => {
    const a     = loc.analysis;
    const score = a.attentionResult.compositeScore;
    const tier  = a.attentionResult.tier;
    const pop   = a.catchmentRecord.estimatedPopulation;
    const comp  = a.competitionSummary.competitorsWithin5Km;
    const sat   = Math.round(a.competitionSummary.saturationIndex * 100);
    const road  = a.roadNetwork.connectivityScore;
    const nl    = a.knowledge?.nightlights?.economicScore ?? 0;
    const city  = a.knowledge?.location?.city ?? a.city ?? '—';
    const state = a.knowledge?.location?.state ?? '—';
    const pin   = a.pincode ?? '—';

    const r    = 38;
    const circ = 2 * Math.PI * r;
    const fill = (score / 100) * circ;
    const sc   = scoreColor(score);

    const verdict = score >= 80 ? 'Strong Buy' : score >= 65 ? 'Buy' : score >= 50 ? 'Hold' : score >= 35 ? 'Weak' : 'Avoid';
    const vColor  = score >= 80 ? '#10b981' : score >= 65 ? '#7c3aed' : score >= 50 ? '#f59e0b' : '#ef4444';

    return `
<div class="slide location-slide">
  <div class="slide-label">SITE ${String(idx + 1).padStart(2, '0')} · LOCATION INTELLIGENCE</div>
  <div class="loc-header">
    <div class="loc-title-block">
      <h2 class="loc-name">${loc.label}</h2>
      <p class="loc-sub">${city}, ${state} · PIN ${pin}</p>
    </div>
    <div class="score-ring-wrap">
      <svg width="96" height="96" viewBox="0 0 96 96" style="transform:rotate(-90deg)">
        <circle cx="48" cy="48" r="${r}" fill="none" stroke="${sc}22" stroke-width="8"/>
        <circle cx="48" cy="48" r="${r}" fill="none" stroke="${sc}" stroke-width="8"
          stroke-linecap="round" stroke-dasharray="${fill} ${circ}"/>
      </svg>
      <div class="ring-label">
        <span class="ring-score">${score}</span>
        <span class="ring-sub">/100</span>
      </div>
    </div>
  </div>

  <div class="metrics-row">
    <div class="metric-box">
      <div class="metric-val">${fmtK(pop)}</div>
      <div class="metric-key">Catchment Pop</div>
    </div>
    <div class="metric-box">
      <div class="metric-val">${comp}</div>
      <div class="metric-key">Competitors 5km</div>
    </div>
    <div class="metric-box">
      <div class="metric-val">${sat}%</div>
      <div class="metric-key">Market Saturation</div>
    </div>
    <div class="metric-box">
      <div class="metric-val">${road}</div>
      <div class="metric-key">Road Score</div>
    </div>
    ${nl ? `<div class="metric-box">
      <div class="metric-val">${nl}</div>
      <div class="metric-key">Economic Activity</div>
    </div>` : ''}
  </div>

  <div class="verdict-row">
    <div class="verdict-chip" style="background:${vColor}22;color:${vColor};border:1.5px solid ${vColor}55">
      ${verdict}
    </div>
    <div class="tier-chip" style="${tierBadge(tier)}">
      ${tier} Priority
    </div>
    <p class="verdict-text">
      ${score >= 65
        ? `High-attention site with strong catchment of ${fmtK(pop)} residents. ${comp <= 3 ? 'Low competitive clutter — ideal for brand dominance.' : 'Competitive market — differentiated creative recommended.'}`
        : score >= 50
        ? `Moderate-attention site. Suitable for frequency-based campaigns targeting local audience of ${fmtK(pop)}.`
        : `Lower-priority site. Consider supplementing with digital or high-footfall alternatives.`
      }
    </p>
  </div>

  <div class="media-formats">
    <div class="section-label" style="margin-top:12px">RECOMMENDED FORMATS</div>
    <div class="formats-grid">
      ${road >= 70 ? `<div class="format-tag">🚦 Highway Hoarding</div>` : ''}
      ${pop >= 50000 ? `<div class="format-tag">🏬 Mall Branding</div>` : ''}
      ${pop >= 20000 ? `<div class="format-tag">🏘️ RWA Lift Screens</div>` : ''}
      <div class="format-tag">📋 Poster Frame Media</div>
      ${nl >= 60 ? `<div class="format-tag">💡 LED Digital OOH</div>` : ''}
      ${comp <= 2 ? `<div class="format-tag">🎯 Sole Brand Wrap</div>` : ''}
    </div>
  </div>
</div>`;
  }).join('');

  const closingSlide = `
<div class="slide closing-slide">
  <div class="cover-deco top-left"></div>
  <h2 class="closing-title">Ready to activate<br/>across ${cities.length} cities.</h2>
  <p class="closing-sub">All ${locations.length} sites validated with live location intelligence from Atlas OOH Platform.</p>
  <div class="closing-stats">
    <div class="c-stat"><div class="c-stat-num">17+</div><div class="c-stat-label">Years Experience</div></div>
    <div class="c-stat"><div class="c-stat-num">50+</div><div class="c-stat-label">Brands Served</div></div>
    <div class="c-stat accent"><div class="c-stat-num">100%</div><div class="c-stat-label">Inventory-to-Media</div></div>
    <div class="c-stat"><div class="c-stat-num">20%</div><div class="c-stat-label">Cash Spend Required</div></div>
  </div>
  <div class="cover-footer">
    <span>Prepared by <strong>${preparedBy}</strong></span>
    <span class="dot">·</span>
    <span>yash@bizex4u.com</span>
    <span class="dot">·</span>
    <span>10% Transparent Commission</span>
    <span class="dot">·</span>
    <span>30–45% Lower Media Cost</span>
  </div>
</div>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; }

  .slide {
    width: 1122px;
    height: 794px;
    background: #F3EFF8;
    position: relative;
    overflow: hidden;
    page-break-after: always;
    padding: 56px 72px;
    display: flex;
    flex-direction: column;
  }

  /* ---- DECO ---- */
  .cover-deco {
    position: absolute;
    width: 260px; height: 260px;
    border-radius: 50%;
    border: 40px solid rgba(107,33,168,0.12);
    pointer-events: none;
  }
  .cover-deco.top-left  { top: -80px; left: -80px; }
  .cover-deco.bottom-right { bottom: -80px; right: -80px; }

  /* ---- COVER ---- */
  .cover-slide { justify-content: center; }
  .cover-badge {
    display: inline-block;
    background: #6B21A8;
    color: white;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    padding: 6px 16px;
    border-radius: 20px;
    margin-bottom: 28px;
    width: fit-content;
  }
  .cover-title {
    font-size: 72px;
    font-weight: 900;
    color: #1a1a2e;
    line-height: 1.05;
    margin-bottom: 16px;
  }
  .cover-subtitle {
    font-size: 26px;
    color: #6B21A8;
    font-weight: 500;
    line-height: 1.4;
    margin-bottom: 32px;
  }
  .cover-subtitle strong { font-weight: 800; }
  .cover-quote {
    font-style: italic;
    color: #555;
    font-size: 14px;
    margin-bottom: 20px;
    padding-left: 0;
  }
  .cover-meta {
    font-size: 13px;
    color: #444;
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: auto;
  }
  .dot { color: #bbb; }
  .cover-footer {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    background: #6B21A8;
    color: white;
    font-size: 12px;
    padding: 14px 72px;
    display: flex;
    gap: 14px;
    align-items: center;
  }
  .cover-footer strong { font-weight: 800; }

  /* ---- SLIDE COMMON ---- */
  .slide-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2.5px;
    color: #6B21A8;
    margin-bottom: 10px;
    text-transform: uppercase;
  }
  .slide-title {
    font-size: 46px;
    font-weight: 900;
    color: #1a1a2e;
    line-height: 1.1;
    margin-bottom: 32px;
  }
  .section-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #6B21A8;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  /* ---- SUMMARY SLIDE ---- */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  .stat-card {
    background: white;
    border: 1.5px solid #e5e7eb;
    border-radius: 16px;
    padding: 20px 18px;
  }
  .stat-card.accent { background: #6B21A8; border-color: #6B21A8; }
  .stat-card.accent .stat-num,
  .stat-card.accent .stat-label { color: white; }
  .stat-num  { font-size: 36px; font-weight: 900; color: #6B21A8; line-height: 1; }
  .stat-label { font-size: 11px; color: #9ca3af; font-weight: 600; margin-top: 6px; }

  .tier-bars { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
  .tier-bar-row { display: flex; align-items: center; gap: 12px; }
  .tier-name  { font-size: 11px; font-weight: 700; color: #374151; width: 100px; }
  .bar-track  { flex: 1; height: 8px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
  .bar-fill   { height: 100%; border-radius: 99px; }
  .tier-count { font-size: 11px; font-weight: 700; color: #6b7280; width: 50px; text-align: right; }

  .cities-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
  .city-chip {
    background: white;
    border: 1.5px solid #d8b4fe;
    color: #6B21A8;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 99px;
  }

  /* ---- LOCATION SLIDE ---- */
  .loc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .loc-title-block {}
  .loc-name { font-size: 38px; font-weight: 900; color: #1a1a2e; line-height: 1.1; }
  .loc-sub  { font-size: 14px; color: #6b7280; margin-top: 4px; }

  .score-ring-wrap {
    position: relative;
    width: 96px; height: 96px;
    flex-shrink: 0;
  }
  .ring-label {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .ring-score { font-size: 24px; font-weight: 900; color: #1a1a2e; line-height: 1; }
  .ring-sub   { font-size: 9px; color: #9ca3af; }

  .metrics-row {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }
  .metric-box {
    flex: 1;
    background: white;
    border: 1.5px solid #e5e7eb;
    border-radius: 14px;
    padding: 14px;
  }
  .metric-val { font-size: 22px; font-weight: 900; color: #6B21A8; }
  .metric-key { font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

  .verdict-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  .verdict-chip, .tier-chip {
    font-size: 11px; font-weight: 800;
    padding: 5px 14px;
    border-radius: 99px;
    white-space: nowrap;
  }
  .tier-chip {
    background: #f3e8ff;
    color: #6B21A8;
    border: 1.5px solid #d8b4fe;
  }
  .verdict-text { font-size: 12px; color: #374151; line-height: 1.5; }

  .formats-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .format-tag {
    background: white;
    border: 1.5px solid #e5e7eb;
    font-size: 11px;
    font-weight: 700;
    color: #374151;
    padding: 5px 12px;
    border-radius: 10px;
  }

  /* ---- CLOSING ---- */
  .closing-slide { justify-content: center; background: #6B21A8; }
  .closing-title {
    font-size: 52px;
    font-weight: 900;
    color: white;
    line-height: 1.1;
    margin-bottom: 16px;
  }
  .closing-sub { font-size: 15px; color: rgba(255,255,255,0.7); margin-bottom: 40px; }
  .closing-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 40px;
  }
  .c-stat {
    background: rgba(255,255,255,0.1);
    border: 1.5px solid rgba(255,255,255,0.2);
    border-radius: 16px;
    padding: 20px;
  }
  .c-stat.accent { background: white; }
  .c-stat-num   { font-size: 32px; font-weight: 900; color: white; line-height: 1; }
  .c-stat.accent .c-stat-num { color: #6B21A8; }
  .c-stat-label { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 6px; font-weight: 600; }
  .c-stat.accent .c-stat-label { color: #9ca3af; }
  .closing-slide .cover-footer {
    background: rgba(0,0,0,0.25);
    color: rgba(255,255,255,0.8);
  }
  .closing-slide .cover-deco.top-left {
    border-color: rgba(255,255,255,0.1);
  }
</style>
</head>
<body>
${coverSlide}
${summarySlide}
${locationSlides}
${closingSlide}
</body>
</html>`;
}
