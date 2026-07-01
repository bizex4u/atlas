'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatusBar } from '@/components/layout/StatusBar';
import { MapLoader } from '@/components/map/MapLoader';
import { UploadModal } from '@/components/dealers/UploadModal';
import { LocationPanel } from '@/components/intelligence/LocationPanel';
import { ResizeHandle }  from '@/components/intelligence/ResizeHandle';
import { SavedLocationsDrawer } from '@/components/dashboard/SavedLocationsDrawer';
import { ProposalModal } from '@/components/proposal/ProposalModal';
import { InventoryDrawer } from '@/components/inventory/InventoryDrawer';
import { BarterDrawer } from '@/components/barter/BarterDrawer';
import { AccountsDrawer } from '@/components/accounts/AccountsDrawer';
import type { OOHSite } from '@/types/inventory';
import { attentionIndexEngine } from '@/lib/AttentionIndexEngine';
import { usePanelStore } from '@/lib/stores/panelStore';
import { useProcessingStore } from '@/lib/stores/processingStore';
import { geocodingEngine } from '@/lib/geocoder/GeocodingEngine';
import type { Dealer, ScoredDealer } from '@/types/dealer';

export function AtlasShell() {
  const [dealers, setDealers]       = useState<ScoredDealer[]>([]);
  const [uploadOpen,    setUploadOpen]    = useState(false);
  const [savedOpen,     setSavedOpen]     = useState(false);
  const [proposalOpen,  setProposalOpen]  = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [barterOpen,    setBarterOpen]    = useState(false);
  const [accountsOpen,  setAccountsOpen]  = useState(false);

  function handleInventorySiteClick(site: OOHSite) {
    if (site.lat !== null && site.lng !== null) {
      usePanelStore.getState().analyzeLocation({ lng: site.lng, lat: site.lat });
      setInventoryOpen(false);
    }
  }

  const panelWidth      = usePanelStore((s) => s.panelWidth);
  const pipeline        = useProcessingStore();

  // Auto-close upload modal when pipeline reaches ready
  useEffect(() => {
    if (pipeline.stage === 'ready' && uploadOpen) {
      const t = setTimeout(() => setUploadOpen(false), 600);
      return () => clearTimeout(t);
    }
  }, [pipeline.stage, uploadOpen]);

  async function handleImport(incoming: Dealer[]) {
    const store = useProcessingStore.getState();

    // VALIDATING → scoring
    store.parseDone(
      incoming.length + (store.dealerSkipped ?? 0),
      incoming.length,
      store.dealerSkipped ?? 0,
    );

    const scored: ScoredDealer[] = incoming.map((d) => ({
      ...d,
      attention: attentionIndexEngine.compute(d),
    }));

    // PLOTTING
    store.startPlotting();
    setDealers((prev) => [...prev, ...scored]);
    store.plotDone();

    // GEOCODING (background — non-blocking)
    const needsGeocode = scored.filter((d) => d.geoResolution !== 'exact');
    if (needsGeocode.length > 0) {
      store.startGeocoding(needsGeocode.length);
      let resolved = 0;
      let failed   = 0;

      geocodingEngine.resolve(needsGeocode, (id, lat, lng, resolution) => {
        setDealers((prev) =>
          prev.map((d) => {
            if (d.id !== id) return d;
            // On failure keep existing PIN centroid coords — never overwrite with null/0,0
            if (resolution === 'failed' || lat == null || lng == null) {
              return { ...d, geoResolution: 'failed' as const };
            }
            return { ...d, lat, lng, geoResolution: resolution };
          }),
        );
        if (resolution === 'geocoded') resolved++; else failed++;
        store.geocodeProgress(resolved, failed);

        if (resolved + failed >= needsGeocode.length) {
          store.geocodeDone();
        }
      });
    } else {
      // No geocoding needed — mark geocoding done immediately
      store.startGeocoding(0);
      store.geocodeDone();
    }

    // HEATMAP (sync — just a MapLibre layer, instant)
    store.startHeatmap();
    store.heatmapDone();

    // KNOWLEDGE INDEX (pincode + catchment data — sync/local)
    store.startKnowledge();
    store.knowledgeDone();

    // READY
    store.setReady();
  }

  function handleUploadStart(file: File) {
    const store = useProcessingStore.getState();
    store.startUpload();
    store.addEvent(`File selected: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`);
    store.startParsing();
  }

  return (
    <>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#1a0d2e] text-white">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            onUploadClick={() => setUploadOpen(true)}
            onSavedClick={() => setSavedOpen((v) => !v)}
            savedDrawerOpen={savedOpen}
            onProposalClick={() => setProposalOpen(true)}
            onInventoryClick={() => setInventoryOpen((v) => !v)}
            inventoryDrawerOpen={inventoryOpen}
            onBarterClick={() => setBarterOpen((v) => !v)}
            barterDrawerOpen={barterOpen}
            onAccountsClick={() => setAccountsOpen((v) => !v)}
            accountsDrawerOpen={accountsOpen}
          />

          <main className="flex-1 overflow-hidden">
            <MapLoader dealers={dealers} />
          </main>

          <ResizeHandle />

          <div
            className="flex flex-col shrink-0 overflow-hidden border-l border-zinc-800"
            style={{ width: panelWidth }}
          >
            <LocationPanel />
          </div>
        </div>
        <StatusBar dealerCount={dealers.length} />
      </div>
      <SavedLocationsDrawer open={savedOpen} onClose={() => setSavedOpen(false)} onProposalClick={() => setProposalOpen(true)} />
      <ProposalModal open={proposalOpen} onClose={() => setProposalOpen(false)} />
      <InventoryDrawer
        open={inventoryOpen}
        onClose={() => setInventoryOpen(false)}
        onSiteClick={handleInventorySiteClick}
      />
      <BarterDrawer open={barterOpen} onClose={() => setBarterOpen(false)} />
      <AccountsDrawer open={accountsOpen} onClose={() => setAccountsOpen(false)} />
      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onImport={handleImport}
        onFileSelected={handleUploadStart}
      />
    </>
  );
}
