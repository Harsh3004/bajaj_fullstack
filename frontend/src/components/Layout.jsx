import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Ticket } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-slate-200/50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-md group-hover:scale-105 transition-transform">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              DeskFlow
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Tickets
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
