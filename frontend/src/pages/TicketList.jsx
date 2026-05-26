import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getTickets, getTicketStats } from '../lib/api';
import CreateTicketModal from '../components/CreateTicketModal';
import { Plus, Search, Filter, AlertCircle, Clock, CheckCircle2, Ticket } from 'lucide-react';
import clsx from 'clsx';

const priorityColors = {
  high: 'bg-rose-100 text-rose-700 border-rose-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const statusColors = {
  open: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-violet-100 text-violet-700 border-violet-200',
  resolved: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const [ticketsRes, statsRes] = await Promise.all([
        getTickets(filters),
        getTicketStats()
      ]);
      setTickets(ticketsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Header */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={Ticket} title="Total Tickets" value={stats.total} color="blue" />
          <StatCard icon={AlertCircle} title="Open" value={stats.open} color="rose" />
          <StatCard icon={Clock} title="In Progress" value={stats.inProgress} color="amber" />
          <StatCard icon={CheckCircle2} title="Resolved" value={stats.resolved} color="emerald" />
        </div>
      )}

      {/* Actions and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 transition-all"
            />
          </div>
          <select 
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer hidden sm:block"
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            value={filters.status}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Ticket className="w-12 h-12 mb-3 text-slate-300" />
            <p className="text-lg font-medium text-slate-700">No tickets found</p>
            <p className="text-sm">Try adjusting your filters or create a new one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map(ticket => (
                  <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <Link to={`/tickets/${ticket._id}`} className="font-mono text-blue-600 hover:underline">
                        #{ticket._id.slice(-6)}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/tickets/${ticket._id}`} className="block">
                        <div className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{ticket.subject}</div>
                        <div className="text-xs text-slate-500 truncate max-w-xs">{ticket.customerEmail}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx("px-2.5 py-1 text-xs font-medium rounded-full border", priorityColors[ticket.priority])}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx("px-2.5 py-1 text-xs font-medium rounded-full border", statusColors[ticket.status])}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {ticket.status !== 'resolved' && new Date(ticket.slaDueDate) < new Date() && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-md animate-pulse">
                          BREACHED
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={fetchTickets}
      />
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={clsx("p-3 rounded-xl border", colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-sm font-medium text-slate-500">{title}</div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
      </div>
    </div>
  );
}
