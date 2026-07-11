'use client';

import { useState, useEffect } from 'react';
import { MapPin, Users, Car, Building2, TrendingUp, Target, RefreshCw, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/stores';
import { useInventoryStore } from '@/lib/stores/inventoryStore';
import { useBarterStore } from '@/lib/stores/barterStore';
import { intelligenceEngine } from '@/lib/intelligence/engine';
import { runResearch } from '@/lib/research/orchestrator';
import { formatNumber } from '@/lib/utils';
import type { LocationAnalysis, SiteFormat } from '@/types';
import type { ResearchBrief } from '@/lib/research/types';

export default function IntelligencePanel() {
  const { drawerData, isAnalyzing, setIsAnalyzing, lastAnalysisPoint } = useAppStore();
  const sites = useInventoryStore((s) => s.sites);
  const deals = useBarterStore((s) => s.deals);
  const [analysis, setAnalysis] = useState<LocationAnalysis | null>(null);
  const [brief, setBrief] = useState<ResearchBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(2);

  const lat = (drawerData?.lat as number) || lastAnalysisPoint?.lat || 26.8467;
  const lng = (drawerData?.lng as number) || lastAnalysisPoint?.lng || 80.9462;

  useEffect(() => {
    if (lat && lng) {
      runAnalysis();
    }
  }, [lat, lng]);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setIsAnalyzing(true);

    try {
      const result = await intelligenceEngine.analyzeLocation(lat, lng, radius);
      setAnalysis(result);

      const activeDeals = deals.filter((d) => d.status === 'active');
      const research = await runResearch({
        query: {
          lat,
          lng,
          radiusKm: radius,
          city: result.city,
        },
        sites: sites.map((s) => ({
          id: s.id,
          siteCode: s.siteCode,
          name: s.name,
          city: s.city,
          state: s.state,
          format: s.format,
          status: s.status,
          monthlyRentInr: s.monthlyRentInr,
          lat: s.lat,
          lng: s.lng,
        })),
        barter: {
          activeDealCount: activeDeals.length,
          partnerNames: [...new Set(activeDeals.map((d) => d.partnerName))],
          openBalanceInr: activeDeals.reduce((sum, d) => sum + d.balanceInr, 0),
        },
      });
      setBrief(research);
    } catch (err) {
      setError('Failed to analyze location. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-error';
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'bg-success';
    if (score >= 50) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="space-y-4">
      <div className="card bg-dark-100/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin size={14} />
            <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="btn btn-ghost px-2 py-1"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="select text-sm flex-1"
            disabled={loading}
          >
            <option value="1">1 km radius</option>
            <option value="2">2 km radius</option>
            <option value="3">3 km radius</option>
            <option value="5">5 km radius</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-primary-500 mb-3" />
          <div className="text-sm text-gray-400">Analyzing location...</div>
          <div className="text-xs text-gray-500 mt-1">Fetching demographics, POIs & traffic data</div>
        </div>
      )}

      {error && (
        <div className="card bg-error/10 border-error/30 text-center">
          <div className="text-error">{error}</div>
          <button onClick={runAnalysis} className="btn btn-secondary mt-3">
            Try Again
          </button>
        </div>
      )}

      {analysis && !loading && (
        <>
          <div className="card bg-gradient-to-br from-primary-800/30 to-dark-100/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Overall Score</div>
                <div className={`text-3xl font-bold ${getScoreColor(analysis.scores.overall)}`}>
                  {analysis.scores.overall}/100
                </div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-dark-100 flex items-center justify-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.scores.overall)}`}>
                  {analysis.scores.overall >= 75 ? 'A' : analysis.scores.overall >= 50 ? 'B' : 'C'}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-300">{analysis.recommendation}</div>
            {brief && (
              <div className="mt-3 pt-3 border-t border-dark-100 space-y-2">
                <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                  <span>
                    Confidence{' '}
                    <span className="text-white font-medium">
                      {Math.round(brief.overallConfidence * 100)}%
                    </span>
                  </span>
                  <span>
                    Freshness{' '}
                    <span className="text-white font-medium">
                      {brief.recommendations[0]?.freshness ?? 'unknown'}
                    </span>
                  </span>
                  <span>
                    Sources{' '}
                    <span className="text-white font-medium">{brief.evidence.length}</span>
                  </span>
                </div>
                <div className="text-xs text-gray-400">{brief.summary}</div>
                {brief.recommendations[0]?.siteCode && (
                  <div className="text-xs text-primary-300">
                    Top pick: {brief.recommendations[0].title} — {brief.recommendations[0].rationale}
                  </div>
                )}
                {brief.missingData.length > 0 && (
                  <div className="text-xs text-amber-400/90">
                    Missing: {brief.missingData.slice(0, 3).map((m) => m.field).join(', ')}
                    {brief.missingData.length > 3 ? ` (+${brief.missingData.length - 3})` : ''}
                  </div>
                )}
                <ul className="text-xs text-gray-500 space-y-1">
                  {brief.evidence.slice(0, 4).map((e) => (
                    <li key={e.source.id}>
                      {e.source.label}: {e.source.summary}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-primary-400" />
                <span className="text-xs text-gray-400">Visibility</span>
              </div>
              <div className="text-lg font-semibold text-white">{analysis.scores.visibility}</div>
              <div className="progress-bar mt-2">
                <div
                  className={`progress-fill ${getScoreBg(analysis.scores.visibility)}`}
                  style={{ width: `${analysis.scores.visibility}%` }}
                />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <Car size={14} className="text-primary-400" />
                <span className="text-xs text-gray-400">Traffic</span>
              </div>
              <div className="text-lg font-semibold text-white">{analysis.scores.traffic}</div>
              <div className="progress-bar mt-2">
                <div
                  className={`progress-fill ${getScoreBg(analysis.scores.traffic)}`}
                  style={{ width: `${analysis.scores.traffic}%` }}
                />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-primary-400" />
                <span className="text-xs text-gray-400">Affluence</span>
              </div>
              <div className="text-lg font-semibold text-white">{analysis.scores.affluence}</div>
              <div className="progress-bar mt-2">
                <div
                  className={`progress-fill ${getScoreBg(analysis.scores.affluence)}`}
                  style={{ width: `${analysis.scores.affluence}%` }}
                />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={14} className="text-primary-400" />
                <span className="text-xs text-gray-400">Competition</span>
              </div>
              <div className="text-lg font-semibold text-white">{analysis.scores.competition}</div>
              <div className="progress-bar mt-2">
                <div
                  className={`progress-fill ${getScoreBg(analysis.scores.competition)}`}
                  style={{ width: `${analysis.scores.competition}%` }}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Demographics</h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div>
                <div className="text-gray-500">Population</div>
                <div className="text-white font-medium">{formatNumber(analysis.demographics.population)}</div>
              </div>
              <div>
                <div className="text-gray-500">Households</div>
                <div className="text-white font-medium">{formatNumber(analysis.demographics.households)}</div>
              </div>
              <div>
                <div className="text-gray-500">Working Pop.</div>
                <div className="text-white font-medium">{formatNumber(analysis.demographics.workingPopulation)}</div>
              </div>
              <div>
                <div className="text-gray-500">Income Level</div>
                <div className="text-white font-medium capitalize">{analysis.demographics.incomeLevel}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Catchment Area</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Residential</span>
                <span className="text-white">{formatNumber(analysis.catchment.residentialPopulation)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Floating</span>
                <span className="text-white">{formatNumber(analysis.catchment.floatingPopulation)}</span>
              </div>
              <div className="h-px bg-dark-100" />
              <div className="text-sm">
                <div className="text-gray-500">Primary Audience</div>
                <div className="text-white">{analysis.catchment.primaryAudience}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Traffic Data</h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div>
                <div className="text-gray-500">Daily Vehicles</div>
                <div className="text-white font-medium">{formatNumber(analysis.traffic.avgDailyVehicles)}</div>
              </div>
              <div>
                <div className="text-gray-500">Road Type</div>
                <div className="text-white font-medium">{analysis.traffic.roadType}</div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-500 mb-2">Vehicle Split</div>
                <div className="flex gap-1">
                  <div className="flex-1 text-center">
                    <div className="progress-bar h-3 mb-1">
                      <div className="progress-fill bg-blue-500" style={{ width: `${analysis.traffic.vehicleSplit.two_wheeler}%` }} />
                    </div>
                    <div className="text-xs text-gray-500">{analysis.traffic.vehicleSplit.two_wheeler}%</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="progress-bar h-3 mb-1">
                      <div className="progress-fill bg-green-500" style={{ width: `${analysis.traffic.vehicleSplit.car}%` }} />
                    </div>
                    <div className="text-xs text-gray-500">{analysis.traffic.vehicleSplit.car}%</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="progress-bar h-3 mb-1">
                      <div className="progress-fill bg-yellow-500" style={{ width: `${analysis.traffic.vehicleSplit.commercial}%` }} />
                    </div>
                    <div className="text-xs text-gray-500">{analysis.traffic.vehicleSplit.commercial}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {analysis.competitors.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Nearby Competitors</h3>
              <div className="space-y-2">
                {analysis.competitors.map((comp, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="text-white">{comp.name}</div>
                      <div className="text-gray-500 text-xs">{comp.format}</div>
                    </div>
                    <div className="text-gray-400">{comp.distance.toFixed(1)} km</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Estimated Revenue Potential</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['HRD', 'UNI', 'GAN', 'SHL'] as SiteFormat[]).map(format => {
                const revenue = intelligenceEngine.estimateSiteRevenue(analysis.scores, format);
                return (
                  <div key={format} className="bg-dark-100/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500">{format}</div>
                    <div className="text-sm font-medium text-white">₹{formatNumber(revenue)}/mo</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-dark-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Est. Occupancy Rate</span>
                <span className="text-white font-medium">{intelligenceEngine.estimateOccupancy(analysis.scores)}%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
