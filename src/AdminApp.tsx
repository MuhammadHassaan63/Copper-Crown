import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  MessageCircle,
  Phone,
  Search,
  Trash2,
  X,
} from 'lucide-react';

const WHATSAPP_NUMBER = '923294942684';
const REQUEST_KEY = 'copper_crown_service_requests';
const QUOTE_KEY = 'copper_crown_quote_requests';
const MESSAGE_KEY = 'copper_crown_messages';

type Status = 'Request Received' | 'Under Review' | 'Confirmed' | 'Technician Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

type ServiceRequest = {
  id: string; createdAt: string; status: Status; name: string; phone: string; whatsapp: string;
  email: string; service: string; problem: string; preferredDate: string; preferredTime: string;
  address: string; details: string;
};

type QuoteRequest = {
  id: string; createdAt: string; name: string; phone: string; email: string; service: string;
  description: string; requirements: string; address: string; contactMethod: string;
};

type Message = { id: string; createdAt: string; name: string; email: string; message: string };

const ALL_STATUSES: Status[] = ['Request Received', 'Under Review', 'Confirmed', 'Technician Assigned', 'In Progress', 'Completed', 'Cancelled'];

function readStorage<T>(key: string): T[] {
  try { const v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v as T[] : []; } catch { return []; }
}
function writeStorage<T>(key: string, value: T[]): void { localStorage.setItem(key, JSON.stringify(value)); }
function whatsappUrl(message: string): string { return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`; }

function AdminApp() {
  const [tab, setTab] = useState<'service' | 'quote' | 'message'>('service');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<ServiceRequest | QuoteRequest | null>(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    setRequests(readStorage<ServiceRequest>(REQUEST_KEY));
    setQuotes(readStorage<QuoteRequest>(QUOTE_KEY));
    setMessages(readStorage<Message>(MESSAGE_KEY));
  }, []);

  const filteredRequests = useMemo(() => requests.filter((r) => {
    const ms = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.service.toLowerCase().includes(search.toLowerCase());
    return ms && (statusFilter === 'All' || r.status === statusFilter);
  }), [requests, search, statusFilter]);

  const filteredQuotes = useMemo(() => quotes.filter((q) => !search || q.name.toLowerCase().includes(search.toLowerCase()) || q.id.toLowerCase().includes(search.toLowerCase()) || q.service.toLowerCase().includes(search.toLowerCase())), [quotes, search]);
  const filteredMessages = useMemo(() => messages.filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())), [messages, search]);

  const updateStatus = (id: string, status: Status) => {
    const updated = requests.map((r) => (r.id === id ? { ...r, status } : r));
    writeStorage(REQUEST_KEY, updated); setRequests(updated);
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  };
  const deleteRequest = (id: string) => { const u = requests.filter((r) => r.id !== id); writeStorage(REQUEST_KEY, u); setRequests(u); setSelected(null); };
  const deleteQuote = (id: string) => { const u = quotes.filter((q) => q.id !== id); writeStorage(QUOTE_KEY, u); setQuotes(u); setSelected(null); };
  const deleteMessage = (id: string) => { const u = messages.filter((m) => m.id !== id); writeStorage(MESSAGE_KEY, u); setMessages(u); };

  const copyText = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(''), 1500); };
  const openWhatsApp = (phone: string, name: string, service: string, id: string) => { window.open(whatsappUrl(`Hello ${name}, this is Copper & Crown regarding your request ${id} for ${service}.`), '_blank'); };

  const counts = { service: requests.length, quote: quotes.length, message: messages.length };
  const newRequests = requests.filter((r) => r.status === 'Request Received').length;

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <img src="/images/image.png" alt="Copper & Crown logo" />
            <div>
              <strong>COPPER <b>&amp;</b> CROWN</strong>
              <small>ADMIN OPERATIONS PORTAL · DEMO</small>
            </div>
          </div>
          <a href="/" className="admin-back"><ArrowLeft size={15} /> Back to website</a>
        </div>
      </header>

      <div className="admin-body">
        <div className="admin-stats">
          <div className="admin-stat-card"><span>NEW REQUESTS</span><b>{newRequests}</b></div>
          <div className="admin-stat-card"><span>QUOTES</span><b>{counts.quote}</b></div>
          <div className="admin-stat-card"><span>MESSAGES</span><b>{counts.message}</b></div>
        </div>

        <div className="admin-tabs">
          <button className={tab === 'service' ? 'active' : ''} onClick={() => setTab('service')}>Service Requests <span className="tab-count">{counts.service}</span></button>
          <button className={tab === 'quote' ? 'active' : ''} onClick={() => setTab('quote')}>Quote Requests <span className="tab-count">{counts.quote}</span></button>
          <button className={tab === 'message' ? 'active' : ''} onClick={() => setTab('message')}>Messages <span className="tab-count">{counts.message}</span></button>
        </div>

        <div className="admin-toolbar">
          <div className="admin-search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, ID, or service..." /></div>
          {tab === 'service' && <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="All">All statuses</option>{ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>}
        </div>

        <div className="admin-demo-note">This is a demo dashboard using browser storage. A secure backend with authentication is required for production use.</div>

        {tab === 'service' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Request ID</th><th>Customer</th><th>Service</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredRequests.length === 0 ? <tr><td colSpan={6} className="empty-row">No service requests found.</td></tr>
                : filteredRequests.map((r) => (
                  <tr key={r.id}>
                    <td className="mono">{r.id}</td><td>{r.name}</td><td>{r.service}</td>
                    <td><span className={`status-badge status-${r.status.replace(/\s+/g, '-').toLowerCase()}`}>{r.status}</span></td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="action-cell">
                      <button className="row-action" onClick={() => setSelected(r)} title="View details"><Check size={14} /></button>
                      <button className="row-action" onClick={() => openWhatsApp(r.whatsapp || r.phone, r.name, r.service, r.id)} title="Open WhatsApp"><MessageCircle size={14} /></button>
                      <button className="row-action danger" onClick={() => deleteRequest(r.id)} title="Delete"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'quote' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Quote ID</th><th>Customer</th><th>Service</th><th>Contact Method</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredQuotes.length === 0 ? <tr><td colSpan={6} className="empty-row">No quote requests found.</td></tr>
                : filteredQuotes.map((q) => (
                  <tr key={q.id}>
                    <td className="mono">{q.id}</td><td>{q.name}</td><td>{q.service || '—'}</td><td>{q.contactMethod}</td>
                    <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                    <td className="action-cell">
                      <button className="row-action" onClick={() => setSelected(q)} title="View details"><Check size={14} /></button>
                      <button className="row-action" onClick={() => openWhatsApp(q.phone, q.name, q.service || 'quote', q.id)} title="Open WhatsApp"><MessageCircle size={14} /></button>
                      <button className="row-action danger" onClick={() => deleteQuote(q.id)} title="Delete"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'message' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Message ID</th><th>Name</th><th>Email</th><th>Message</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredMessages.length === 0 ? <tr><td colSpan={6} className="empty-row">No messages found.</td></tr>
                : filteredMessages.map((m) => (
                  <tr key={m.id}>
                    <td className="mono">{m.id}</td><td>{m.name}</td><td>{m.email}</td><td className="message-cell">{m.message}</td>
                    <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td className="action-cell"><button className="row-action danger" onClick={() => deleteMessage(m.id)} title="Delete"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="admin-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="admin-modal">
            <button className="admin-modal-close" onClick={() => setSelected(null)}><X size={18} /></button>
            <h2>{('status' in selected) ? 'Service Request' : 'Quote Request'}</h2>
            <p className="admin-modal-id">Reference: <strong>{selected.id}</strong></p>
            <div className="detail-grid">
              <div className="detail-item"><span>Name</span><b>{selected.name}</b></div>
              <div className="detail-item"><span>Phone</span><b>{selected.phone}</b></div>
              <div className="detail-item"><span>Email</span><b>{selected.email}</b></div>
              {'service' in selected && <div className="detail-item"><span>Service</span><b>{selected.service}</b></div>}
              {'contactMethod' in selected && <div className="detail-item"><span>Preferred contact</span><b>{selected.contactMethod}</b></div>}
              {'problem' in selected && <div className="detail-item full"><span>Problem / Requirement</span><b>{selected.problem}</b></div>}
              {'description' in selected && <div className="detail-item full"><span>Project description</span><b>{selected.description}</b></div>}
              {'address' in selected && <div className="detail-item full"><span>Address</span><b>{selected.address || '—'}</b></div>}
              {'details' in selected && selected.details && <div className="detail-item full"><span>Additional details</span><b>{selected.details}</b></div>}
              {'requirements' in selected && selected.requirements && <div className="detail-item full"><span>Estimated requirements</span><b>{selected.requirements}</b></div>}
              {'preferredDate' in selected && <div className="detail-item"><span>Preferred date</span><b>{selected.preferredDate || '—'}</b></div>}
              {'preferredTime' in selected && <div className="detail-item"><span>Preferred time</span><b>{selected.preferredTime || '—'}</b></div>}
            </div>
            {'status' in selected && (
              <div className="status-control">
                <label>Status</label>
                <select value={(selected as ServiceRequest).status} onChange={(e) => updateStatus(selected.id, e.target.value as Status)}>
                  {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div className="modal-actions">
              <button className="button button-outline" onClick={() => copyText(selected.phone, selected.id)}><Copy size={15} /> {copied === selected.id ? 'Copied!' : 'Copy phone'}</button>
              <button className="button button-outline" onClick={() => window.open(`tel:${selected.phone}`)}><Phone size={15} /> Call customer</button>
              <a className="button button-whatsapp" href={whatsappUrl(`Hello ${selected.name}, this is Copper & Crown regarding your request ${selected.id}.`)} target="_blank" rel="noreferrer"><MessageCircle size={15} /> Open WhatsApp</a>
              {'status' in selected && <button className="button button-danger" onClick={() => deleteRequest(selected.id)}><Trash2 size={15} /> Delete</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminApp;
