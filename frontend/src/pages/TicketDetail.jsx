import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getTickets, updateTicketStatus, deleteTicket } from '../lib/api';
import { ArrowLeft, Clock, Activity, User, AlertTriangle, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import clsx from 'clsx';

const statusColors = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-violet-100 text-violet-700',
  resolved: 'bg-slate-100 text-slate-700',
};

const priorityColors = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-emerald-100 text-emerald-700',
};

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await getTickets();
      const found = res.data.find(t => t._id === id);
      if (found) {
        setTicket(found);
      } else {
        setError('Ticket not found');
      }
    } catch (err) {
      setError('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setError(null);
    try {
      await updateTicketStatus(id, newStatus);
      await fetchTicket();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await deleteTicket(id);
      navigate('/');
    } catch (err) {
      setError('Failed to delete ticket');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Loading...</div>;
  if (!ticket) return <div className="p-12 text-center text-red-500">{error}</div>;

  const isBreached = ticket.status !== 'resolved' && new Date(ticket.slaDueDate) < new Date();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to tickets
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{ticket.subject}</h1>
              <div className="flex items-center gap-2">
                <span className={clsx("px-3 py-1 rounded-full text-sm font-medium", priorityColors[ticket.priority])}>
                  {ticket.priority.toUpperCase()}
                </span>
                <span className={clsx("px-3 py-1 rounded-full text-sm font-medium", statusColors[ticket.status])}>
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="prose prose-slate max-w-none text-slate-600 mb-8 whitespace-pre-wrap">
              {ticket.description}
            </div>

            <div className="flex flex-wrap items-center gap-6 py-4 border-t border-slate-100 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" /> {ticket.customerEmail}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Created {format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Status Timeline
            </h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {ticket.statusTimeline.map((item, index) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-slate-800 capitalize">{item.status.replace('_', ' ')}</div>
                      <time className="text-xs text-slate-500">{format(new Date(item.timestamp), 'MMM d, h:mm a')}</time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Actions</h3>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Update Status</label>
                <div className="flex gap-2">
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updating || ticket.status === 'resolved'}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-50"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  {updating && <Loader2 className="w-5 h-5 text-blue-500 animate-spin self-center" />}
                </div>
                {ticket.status === 'resolved' && (
                  <p className="text-xs text-amber-600 mt-1">Resolved tickets cannot be changed.</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Ticket
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">SLA Details</h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Due Date</div>
                <div className={clsx("font-medium", isBreached ? "text-red-600" : "text-slate-800")}>
                  {format(new Date(ticket.slaDueDate), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
              {isBreached && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> SLA Breached
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
