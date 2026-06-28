import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { MapPlaceholder } from "@/components/map/MapPlaceholder";

export default function Page() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <MapPlaceholder />
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
