import { LocationSearch } from './LocationSearch';

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-gray-100 bg-white px-5 shadow-sm z-10">
      <div className="flex items-center gap-2 shrink-0">
        <div className="h-7 w-7 rounded-lg bg-[#6B21A8] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
        </div>
        <span className="text-[15px] font-bold tracking-tight text-gray-900">Atlas</span>
      </div>

      <LocationSearch />

      <div className="ml-auto">
        <div className="h-8 w-8 rounded-full bg-[#6B21A8] flex items-center justify-center text-[11px] font-bold text-white select-none shadow-sm">
          YM
        </div>
      </div>
    </header>
  );
}
