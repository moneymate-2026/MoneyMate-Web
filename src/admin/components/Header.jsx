import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="h-[64px] bg-white border-b border-admin-outline-variant flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 font-[Inter]">
      <div className="flex-1 max-w-xl flex items-center gap-2 px-3 py-2 rounded-lg bg-admin-surface-container-low border border-admin-outline-variant/50 focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary/20 transition-all">
        <Search className="w-4 h-4 text-admin-on-surface-variant" />
        <input 
          type="text"
          placeholder="Search everywhere..."
          className="bg-transparent border-none outline-none text-sm w-full text-admin-on-surface placeholder:text-admin-on-surface-variant/70"
        />
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <button className="relative p-2 rounded-full text-admin-on-surface-variant hover:bg-admin-surface-container transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-admin-error border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}
