import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Facebook,
  Headphones,
  Instagram,
  Lightbulb,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Phone,
  PlugZap,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  UserRound,
  Wrench,
  X,
  Zap,
} from 'lucide-react';

const WHATSAPP_NUMBER = '923294942684';
const SOCIAL_LINKS = { instagram: '', facebook: '', tiktok: '' };
const REQUEST_KEY = 'copper_crown_service_requests';
const QUOTE_KEY = 'copper_crown_quote_requests';
const MESSAGE_KEY = 'copper_crown_messages';
const CUSTOMER_KEY = 'copper_crown_customer';
const CART_KEY = 'copper_crown_cart';
const THEME_KEY = 'copper_crown_theme';
const LANG_KEY = 'copper_crown_lang';

type Status = 'Request Received' | 'Under Review' | 'Confirmed' | 'Technician Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

type ServiceRequest = {
  id: string;
  createdAt: string;
  status: Status;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  service: string;
  problem: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  details: string;
};

type QuoteRequest = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  description: string;
  requirements: string;
  address: string;
  contactMethod: string;
};

type Customer = { name: string; email: string; phone: string };

type CartItem = { id: string; name: string; price: number; qty: number };

type Lang = 'en' | 'ur';

const services = [
  { title: 'Electrical Installation', description: 'Safe, precise installation for homes, offices, and projects.', icon: PlugZap },
  { title: 'Electrical Repair', description: 'Quick, careful fault finding and reliable repair support.', icon: Wrench },
  { title: 'Fan Installation / Repair', description: 'Keep every room cool, quiet, and comfortable.', icon: Sparkles },
  { title: 'Wiring Work', description: 'Neat wiring work built for dependable everyday use.', icon: Zap },
  { title: 'Switch / Socket Work', description: 'Upgrade or repair switches, sockets, and connections.', icon: BadgeCheck },
  { title: 'Lighting Installation / Repair', description: 'Brighten your space with practical lighting solutions.', icon: Lightbulb },
  { title: 'Electrical Inspection', description: 'Identify concerns early with a focused inspection.', icon: ShieldCheck },
  { title: 'Other Electrical Services', description: 'Tell us what you need and we will help find a solution.', icon: Headphones },
];

const reasons = [
  { title: 'Reliable Service', text: 'Professional and dependable electrical support.', icon: ShieldCheck },
  { title: 'Skilled Professionals', text: 'Experienced and careful electrical workmanship.', icon: Wrench },
  { title: 'Wide Range of Solutions', text: 'Installation, wiring, fans, lighting, repairs, and more.', icon: Zap },
  { title: 'Customer Focused', text: 'Clear communication shaped around your requirements.', icon: Headphones },
];

const pricing = [
  { name: 'Basic Repair', price: 'Rs. 500', unit: 'per visit', features: ['Fault diagnosis', 'Minor repair work', 'Safety check', 'Same-day response'], popular: false },
  { name: 'Installation Package', price: 'Rs. 1,500', unit: 'per project', features: ['Fan or light install', 'Switch/socket fitting', 'Wiring adjustment', '1-month service warranty'], popular: true },
  { name: 'Full Inspection', price: 'Rs. 2,000', unit: 'per inspection', features: ['Complete wiring check', 'Load assessment', 'Safety report', 'Recommendation summary'], popular: false },
];

const products = [
  { id: 'p1', name: 'LED Ceiling Light', price: 1200 },
  { id: 'p2', name: 'Decorative Fan', price: 4500 },
  { id: 'p3', name: 'Premium Switch Set', price: 800 },
  { id: 'p4', name: 'Copper Wiring Roll', price: 2200 },
];

const testimonials = [
  { name: 'Demo Customer', text: 'Professional service starts with listening. We aim to make every electrical job feel clear, considered, and well looked after.', stars: 5 },
  { name: 'Demo Reviewer', text: 'A placeholder review — replace with real customer feedback once your clients share their experience.', stars: 4 },
  { name: 'Demo Note', text: 'Another demo review slot ready for a genuine customer testimonial.', stars: 5 },
];

const galleryItems = [
  { label: 'Residential Wiring', query: 'electrical wiring installation home' },
  { label: 'Commercial Panel', query: 'electrical panel commercial building' },
  { label: 'Lighting Setup', query: 'modern lighting installation ceiling' },
  { label: 'Fan Installation', query: 'ceiling fan installation' },
  { label: 'Switch & Socket', query: 'electrical switches sockets wall' },
  { label: 'Industrial Work', query: 'industrial electrical wiring' },
];

const galleryImages: Record<string, string> = {};

const t = {
  en: {
    home: 'Home', about: 'About Us', services: 'Services', pricing: 'Pricing', gallery: 'Gallery', quote: 'Get a Quote', contact: 'Contact',
    account: 'My Account', track: 'Track Status', cart: 'Cart', shop: 'Shop Products', requestService: 'Request a Service', getQuote: 'Get a Quote',
    contactUs: 'Contact Us', whyChoose: 'Why choose', ourServices: 'Our Services', servicePricing: 'Service Pricing & Packages',
    galleryTitle: 'Completed Work Gallery', aboutTitle: 'About Copper & Crown', testimonials: 'What Our Customers Say',
    getInTouch: 'Get in Touch', sendMessage: 'Send Us a Message', yourName: 'Your name', yourEmail: 'Your email', yourMessage: 'Your message',
    send: 'Send Message', bookNow: 'Book Now', customQuote: 'Get Custom Quote', learnMore: 'Learn More', follow: 'Follow us',
    socialLinks: 'Social links to be added', adminDemo: 'Admin demo', available: 'Available for new requests', tagline: 'THE ROYAL STANDARD OF ELECTRICAL CRAFTSMANSHIP',
  },
  ur: {
    home: 'ہوم', about: 'ہمارے بارے میں', services: 'خدمات', pricing: 'قیمتیں', gallery: 'گیلری', quote: 'قیمت حاصل کریں', contact: 'رابطہ',
    account: 'میرا اکاؤنٹ', track: 'حالت دیکھیں', cart: 'کارٹ', shop: 'پروڈکٹس', requestService: 'سروس کی درخواست', getQuote: 'قیمت حاصل کریں',
    contactUs: 'رابطہ کریں', whyChoose: 'کوپر اینڈ کراون کیوں', ourServices: 'ہماری خدمات', servicePricing: 'سروس قیمتیں اور پیکیجز',
    galleryTitle: 'مکمل شدہ کام گیلری', aboutTitle: 'کوپر اینڈ کراون کے بارے میں', testimonials: 'ہمارے گاہک کیا کہتے ہیں',
    getInTouch: 'رابطہ میں رہیں', sendMessage: 'ہمیں پیغام بھیجیں', yourName: 'آپ کا نام', yourEmail: 'آپ کا ای میل', yourMessage: 'آپ کا پیغام',
    send: 'پیغام بھیجیں', bookNow: 'ابھی بک کریں', customQuote: 'کسٹام قیمت', learnMore: 'مزید جانیں', follow: 'فالو کریں',
    socialLinks: 'سوشل لنکس شامل کیے جائیں گے', adminDemo: 'ایڈمن ڈیمو', available: 'نئی درخواستوں کے لیے دستیاب', tagline: 'برقی دستکاری کا شاہی معیار',
  },
};

function useLang(): [Lang, (l: Lang) => void, typeof t['en']] {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem(LANG_KEY) as Lang) || 'en');
  const change = (l: Lang) => { setLang(l); localStorage.setItem(LANG_KEY, l); document.documentElement.dir = l === 'ur' ? 'rtl' : 'ltr'; };
  useEffect(() => { document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr'; }, [lang]);
  return [lang, change, t[lang]];
}

function useTheme(): [boolean, () => void] {
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) !== 'light');
  const toggle = () => { const next = !dark; setDark(next); localStorage.setItem(THEME_KEY, next ? 'dark' : 'light'); document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light'); };
  useEffect(() => { document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light'); }, [dark]);
  return [dark, toggle];
}

function readStorage<T>(key: string): T[] {
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value as T[] : []; } catch { return []; }
}
function writeStorage<T>(key: string, value: T[]): void { localStorage.setItem(key, JSON.stringify(value)); }
function createId(prefix: string): string { return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; }
function whatsappUrl(message: string): string { return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`; }
function scrollToSection(id: string): void { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

let toastFn: ((msg: string) => void) | null = null;
function Toast() {
  const [msg, setMsg] = useState('');
  useEffect(() => { toastFn = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); }; return () => { toastFn = null; }; }, []);
  if (!msg) return null;
  return <div className="toast"><Check size={16} /> {msg}</div>;
}
function toast(msg: string): void { toastFn?.(msg); }

function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => readStorage<CartItem>(CART_KEY));
  const total = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  useEffect(() => writeStorage(CART_KEY, items), [items]);
  const add = (item: Omit<CartItem, 'qty'>) => { setItems((prev) => { const ex = prev.find((i) => i.id === item.id); if (ex) return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i); return [...prev, { ...item, qty: 1 }]; }); toast('Added to cart'); };
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const changeQty = (id: string, delta: number) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  return { items, total, add, remove, changeQty };
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a href="#home" className="brand" onClick={(event) => { event.preventDefault(); scrollToSection('home'); }}>
      <img src="/images/image.png" alt="Copper & Crown logo" />
      <span>
        <strong className={light ? 'light' : ''}>COPPER <b>&amp;</b> CROWN</strong>
        <small className={light ? 'light-muted' : ''}>THE ROYAL STANDARD OF ELECTRICAL CRAFTSMANSHIP</small>
      </span>
    </a>
  );
}

function Header({ dark, onToggleTheme, lang, onLangChange, tr, onAccount, onTrack, onCartOpen, cartCount, onBook, onQuote }: {
  dark: boolean; onToggleTheme: () => void; lang: Lang; onLangChange: (l: Lang) => void; tr: typeof t['en'];
  onAccount: () => void; onTrack: () => void; onCartOpen: () => void; cartCount: number; onBook: () => void; onQuote: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const links: [string, string][] = [[tr.about, 'about'], [tr.services, 'services'], [tr.pricing, 'pricing'], [tr.gallery, 'gallery'], [tr.quote, 'quote'], [tr.contact, 'contact']];
  const go = (id: string) => { setOpen(false); scrollToSection(id); };
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className={open ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
          <a className="active" href="#home" onClick={(e) => { e.preventDefault(); go('home'); }}>{tr.home}</a>
          {links.map(([label, id]) => <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }}>{label}</a>)}
        </nav>
        <div className="header-actions-bar">
          <button className="header-util" onClick={onTrack} title={tr.track}><Search size={16} /><span className="util-label">{tr.track}</span></button>
          <button className="header-util" onClick={onAccount} title={tr.account}><UserRound size={16} /><span className="util-label">{tr.account}</span></button>
          <button className="header-util cart-btn" onClick={onCartOpen} title={tr.cart}><ShoppingBag size={16} />{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</button>
          <button className="header-util" onClick={onToggleTheme} title="Toggle theme">{dark ? <Lightbulb size={16} /> : <Zap size={16} />}</button>
          <div className="lang-dropdown">
            <button className="header-util" onClick={() => setLangOpen(!langOpen)}><span>{lang.toUpperCase()}</span><ChevronDown size={14} /></button>
            {langOpen && <div className="lang-menu"><button onClick={() => { onLangChange('en'); setLangOpen(false); }}>English</button><button onClick={() => { onLangChange('ur'); setLangOpen(false); }}>اردو</button></div>}
          </div>
          <button className="header-util menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
  );
}

function ElectricalVisual() {
  return (
    <div className="electrical-visual" aria-label="Illustration of a glowing electrical bulb and copper wiring" role="img">
      <div className="visual-grid" />
      <div className="wire wire-one" /><div className="wire wire-two" /><div className="wire wire-three" />
      <div className="bulb-glow" /><div className="bulb"><div className="bulb-filament" /><div className="bulb-base" /></div>
      <div className="spark spark-one">+</div><div className="spark spark-two">×</div><div className="spark spark-three">+</div>
      <div className="visual-label"><span>CC / 01</span><b>POWERING<br />WHAT MATTERS</b></div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text, light = false }: { eyebrow: string; title: ReactNode; text?: string; light?: boolean }) {
  return <div className={`section-heading ${light ? 'light-heading' : ''}`}><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

function Field({ label, value, onChange, type = 'text', required = false, full = false, options = [] }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; full?: boolean; options?: string[] }) {
  const common = { value, required, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value) };
  return <label className={full ? 'field full-span' : 'field'}><span>{label}{required && <b> *</b>}</span>{type === 'textarea' ? <textarea {...common} rows={3} /> : type === 'select' ? <select {...common}><option value="">Select</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input {...common} type={type} />}</label>;
}

function BookingModal({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: (request: ServiceRequest) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', whatsapp: '', email: '', service: '', problem: '', preferredDate: '', preferredTime: '', address: '', details: '' });
  const [error, setError] = useState('');
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.service || !form.problem || !form.address) { setError('Please complete all required fields.'); return; }
    const request: ServiceRequest = { ...form, id: createId('CC-SR'), createdAt: new Date().toISOString(), status: 'Request Received' };
    writeStorage(REQUEST_KEY, [request, ...readStorage<ServiceRequest>(REQUEST_KEY)]);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name: form.name, email: form.email, phone: form.phone } satisfies Customer));
    onSubmitted(request);
  };
  const message = `Hello Copper & Crown, I would like to request an electrical service.\n\nName: ${form.name}\nService: ${form.service}\nRequirement: ${form.problem}`;
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-panel form-modal"><button className="modal-close" onClick={onClose} aria-label="Close form"><X /></button><div className="modal-top"><span className="eyebrow">BOOK A SERVICE</span><h2>Schedule your appointment.</h2><p>Share a few details and our team can understand the job before we speak.</p></div><form onSubmit={submit} className="form-grid"><Field label="Full Name" required value={form.name} onChange={(v) => update('name', v)} /><Field label="Phone Number" required value={form.phone} onChange={(v) => update('phone', v)} /><Field label="WhatsApp Number" value={form.whatsapp} onChange={(v) => update('whatsapp', v)} /><Field label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} /><Field label="Service Required" required type="select" value={form.service} onChange={(v) => update('service', v)} options={services.map((service) => service.title)} /><Field label="Preferred Date" type="date" value={form.preferredDate} onChange={(v) => update('preferredDate', v)} /><Field label="Preferred Time" type="select" value={form.preferredTime} onChange={(v) => update('preferredTime', v)} options={['Morning', 'Afternoon', 'Evening']} /><Field label="Address" required full value={form.address} onChange={(v) => update('address', v)} /><Field label="Problem / Requirement" required full type="textarea" value={form.problem} onChange={(v) => update('problem', v)} /><Field label="Additional Details" full type="textarea" value={form.details} onChange={(v) => update('details', v)} />{error && <p className="form-error full-span">{error}</p>}<div className="form-actions full-span"><button className="button button-copper" type="submit">Submit Request <ArrowRight size={16} /></button><a className="button button-whatsapp" href={whatsappUrl(message)} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Send on WhatsApp</a></div></form></div></div>;
}

function QuoteModal({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: (quote: QuoteRequest) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: '', description: '', requirements: '', address: '', contactMethod: 'WhatsApp' });
  const [error, setError] = useState('');
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); if (!form.name || !form.phone || !form.email || !form.description) { setError('Please complete the required fields.'); return; } const quote: QuoteRequest = { ...form, id: createId('CC-QT'), createdAt: new Date().toISOString() }; writeStorage(QUOTE_KEY, [quote, ...readStorage<QuoteRequest>(QUOTE_KEY)]); onSubmitted(quote); };
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-panel form-modal"><button className="modal-close" onClick={onClose}><X /></button><div className="modal-top"><span className="eyebrow">QUOTE REQUEST</span><h2>Get a custom quote.</h2><p>Tell us about your project and we'll get back to you through your preferred channel.</p></div><form onSubmit={submit} className="form-grid"><Field label="Name" required value={form.name} onChange={(v) => update('name', v)} /><Field label="Phone" required value={form.phone} onChange={(v) => update('phone', v)} /><Field label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} /><Field label="Service" value={form.service} onChange={(v) => update('service', v)} /><Field label="Project Description" required full type="textarea" value={form.description} onChange={(v) => update('description', v)} /><Field label="Estimated Requirements" full type="textarea" value={form.requirements} onChange={(v) => update('requirements', v)} /><Field label="Address" full value={form.address} onChange={(v) => update('address', v)} /><Field label="Preferred Contact Method" type="select" value={form.contactMethod} onChange={(v) => update('contactMethod', v)} options={['WhatsApp', 'Phone', 'Email']} />{error && <p className="form-error full-span">{error}</p>}<div className="full-span form-actions"><button className="button button-copper" type="submit">Request My Quote <ArrowRight size={16} /></button><a className="button button-whatsapp" href={whatsappUrl(`Hello Copper & Crown, I would like a quote.\n\nName: ${form.name}\nService: ${form.service}`)} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Send on WhatsApp</a></div></form></div></div>;
}

function Confirmation({ title, id, onClose }: { title: string; id: string; onClose: () => void }) { return <div className="confirmation"><div className="confirmation-icon"><Check /></div><span className="eyebrow">CONFIRMED</span><h2>{title}</h2><p>Your reference ID is <strong>{id}</strong>. Keep it safe to track your request.</p><button className="button button-copper" onClick={onClose}>Back to website <ArrowRight size={16} /></button></div>; }

function TrackingModal({ onClose }: { onClose: () => void }) {
  const [id, setId] = useState(''); const [request, setRequest] = useState<ServiceRequest | null>(null); const [error, setError] = useState('');
  const search = (event: FormEvent) => { event.preventDefault(); const found = readStorage<ServiceRequest>(REQUEST_KEY).find((item) => item.id.toLowerCase() === id.trim().toLowerCase()); if (!found) { setError('We could not find that request ID in this browser.'); setRequest(null); } else { setError(''); setRequest(found); } };
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-panel tracking-panel"><button className="modal-close" onClick={onClose}><X /></button><span className="eyebrow">REQUEST TRACKING</span><h2>Where is your request?</h2><p>Enter the reference ID from your confirmation.</p><form className="tracking-search" onSubmit={search}><input value={id} onChange={(e) => setId(e.target.value)} placeholder="CC-SR-..." aria-label="Request ID" /><button className="button button-copper" type="submit"><Search size={16} /> Track</button></form>{error && <p className="form-error">{error}</p>}{request && <div className="tracking-result"><div className="result-row"><span>Request ID</span><strong>{request.id}</strong></div><div className="result-row"><span>Service</span><strong>{request.service}</strong></div><div className="result-row"><span>Date submitted</span><strong>{new Date(request.createdAt).toLocaleDateString()}</strong></div><div className="status-pill"><span className="status-dot" />{request.status}</div><div className="result-details"><b>{request.name}</b><span>{request.phone} · {request.email}</span><span>{request.problem}</span></div></div>}</div></div>;
}

function LoginModal({ onClose, onAccount }: { onClose: () => void; onAccount: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.email || !form.password) { setError('Please enter email and password.'); return; }
    if (mode === 'signup' && !form.name) { setError('Please enter your name.'); return; }
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name: form.name || form.email.split('@')[0], email: form.email, phone: '' } satisfies Customer));
    toast(mode === 'signup' ? 'Account created (demo)' : 'Signed in (demo)');
    onAccount();
  };
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-panel"><button className="modal-close" onClick={onClose}><X /></button><span className="eyebrow">{mode === 'login' ? 'CUSTOMER LOGIN' : 'CREATE ACCOUNT'}</span><h2>{mode === 'login' ? 'Welcome back.' : 'Join Copper & Crown.'}</h2><p className="demo-note">Demo authentication using browser storage. A secure backend is required for real accounts.</p><form onSubmit={submit} className="login-form">{mode === 'signup' && <Field label="Full Name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />}<Field label="Email" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} /><Field label="Password" type="password" required value={form.password} onChange={(v) => setForm({ ...form, password: v })} />{error && <p className="form-error">{error}</p>}<button className="button button-copper" type="submit">{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></button></form><p className="toggle-mode">{mode === 'login' ? "Don't have an account? " : 'Already have an account? '}<button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>{mode === 'login' ? 'Sign up' : 'Sign in'}</button></p></div></div>;
}

function AccountPanel({ onClose, onTrack }: { onClose: () => void; onTrack: () => void }) {
  const customer = (() => { try { return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || 'null') as Customer | null; } catch { return null; } })();
  const requests = customer ? readStorage<ServiceRequest>(REQUEST_KEY).filter((request) => request.email === customer.email) : [];
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-panel account-panel"><button className="modal-close" onClick={onClose}><X /></button><span className="eyebrow">MY ACCOUNT · DEMO</span>{customer ? <><h2>Welcome back, {customer.name.split(' ')[0]}.</h2><p className="demo-note">This browser-only account is a demo. A secure backend is required for real customer accounts.</p><div className="account-card"><div className="avatar"><UserRound /></div><div><b>{customer.name}</b><span>{customer.email}</span>{customer.phone && <span>{customer.phone}</span>}</div></div><h3>Your service requests</h3>{requests.length ? requests.map((request) => <div className="mini-request" key={request.id}><b>{request.service}</b><span>{request.id} · {request.status}</span></div>) : <p>No requests saved yet.</p>}<button className="button button-outline" onClick={onTrack}>Track a request <Search size={16} /></button></> : <><h2>Keep your requests close.</h2><p>Sign in or submit a service request to create a demo customer profile in this browser.</p><button className="button button-copper" onClick={onClose}>Request a service <ArrowRight size={16} /></button></>}</div></div>;
}

function CartDrawer({ items, onClose, onRemove, onQty }: { items: CartItem[]; onClose: () => void; onRemove: (id: string) => void; onQty: (id: string, delta: number) => void }) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  return <div className="modal-backdrop cart-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="cart-drawer"><button className="modal-close" onClick={onClose}><X /></button><span className="eyebrow">YOUR CART</span><h2>Shopping Cart</h2>{items.length ? <><div className="cart-items">{items.map((item) => <div className="cart-item" key={item.id}><div><b>{item.name}</b><span>Rs. {item.price.toLocaleString()}</span></div><div className="cart-qty"><button onClick={() => onQty(item.id, -1)}><Minus size={14} /></button><span>{item.qty}</span><button onClick={() => onQty(item.id, 1)}><Plus size={14} /></button><button className="cart-remove" onClick={() => onRemove(item.id)}><Trash2 size={14} /></button></div></div>)}</div><div className="cart-total"><span>Total</span><b>Rs. {total.toLocaleString()}</b></div><p className="demo-note">Checkout requires a payment gateway integration. This is a demo cart.</p></> : <p className="cart-empty">Your cart is empty.</p>}</div></div>;
}

function GalleryGrid() {
  return <div className="gallery-grid">{galleryItems.map((item) => <div className="gallery-card" key={item.label}><div className="gallery-placeholder"><Zap size={32} /></div><span>{item.label}</span></div>)}</div>;
}

function TestimonialSlider() {
  const [index, setIndex] = useState(0);
  const next = () => setIndex((index + 1) % testimonials.length);
  const prev = () => setIndex((index - 1 + testimonials.length) % testimonials.length);
  const item = testimonials[index];
  return <div className="testimonial-slider"><button className="slider-arrow" onClick={prev} aria-label="Previous"><ChevronLeft /></button><div className="review-card"><div className="quote-mark">"</div><div className="review-stars">{Array.from({ length: item.stars }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div><p>{item.text}</p><div className="review-footer"><span><b>{item.name}</b><small>Demo review — replace with real feedback</small></span><span className="review-dots">{'●'.repeat(index + 1)}{'○'.repeat(testimonials.length - index - 1)}</span></div></div><button className="slider-arrow" onClick={next} aria-label="Next"><ChevronRight /></button></div>;
}

function WhatsAppFloat() {
  return <a className="whatsapp-float" href={whatsappUrl('Hello Copper & Crown, I would like to ask about your electrical services.')} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><MessageCircle size={26} /></a>;
}

function App() {
  const [dark, toggleTheme] = useTheme();
  const [lang, setLang, tr] = useLang();
  const cart = useCart();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<{ type: 'service' | 'quote'; id: string } | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  const social = useMemo(() => Object.entries(SOCIAL_LINKS).filter(([, url]) => Boolean(url)), []);

  const submitContact = (event: FormEvent) => {
    event.preventDefault(); if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    const messages = readStorage<{ id: string; createdAt: string; name: string; email: string; message: string }>(MESSAGE_KEY);
    writeStorage(MESSAGE_KEY, [{ ...contactForm, id: createId('CC-MS'), createdAt: new Date().toISOString() }, ...messages]);
    setContactSent(true); toast('Message sent'); setContactForm({ name: '', email: '', message: '' });
  };
  const serviceDone = (request: ServiceRequest) => { setBookingOpen(false); setConfirmation({ type: 'service', id: request.id }); };
  const quoteDone = (quote: QuoteRequest) => { setQuoteOpen(false); setConfirmation({ type: 'quote', id: quote.id }); };

  return <div className="app-shell">
    <Header dark={dark} onToggleTheme={toggleTheme} lang={lang} onLangChange={setLang} tr={tr} onAccount={() => setAccountOpen(true)} onTrack={() => setTrackingOpen(true)} onCartOpen={() => setCartOpen(true)} cartCount={cart.total} onBook={() => setBookingOpen(true)} onQuote={() => setQuoteOpen(true)} />
    <main>
      <section className="hero" id="home">
        <div className="hero-content">
          <span className="eyebrow copper-eyebrow">COPPER &amp; CROWN · {tr.tagline}</span>
          <h1>Electrical work,<br /><em>done with care.</em></h1>
          <p className="hero-lead">Reliable electrical installation, repair, wiring, fans, lighting, switches, sockets, inspections, and practical solutions for your home, business, or project.</p>
          <div className="hero-actions">
            <button className="button button-copper" onClick={() => scrollToSection('shop')}>{tr.shop} <ArrowRight size={16} /></button>
            <button className="button button-ghost-light" onClick={() => setBookingOpen(true)}>{tr.requestService}</button>
            <button className="button button-ghost-light" onClick={() => setQuoteOpen(true)}>{tr.getQuote}</button>
            <button className="text-button" onClick={() => scrollToSection('contact')}>{tr.contactUs} <ArrowRight size={16} /></button>
          </div>
          <div className="hero-meta"><span><span className="meta-dot" />{tr.available}</span><span>0329-4942684</span></div>
        </div>
        <ElectricalVisual />
      </section>

      <section className="trust-strip"><div><span>THE ROYAL STANDARD OF</span><b>ELECTRICAL CRAFTSMANSHIP</b></div><p>Thoughtful service. Clear communication. Work you can depend on.</p><div className="strip-mark"><Zap size={18} /> CC / 01</div></section>

      <section className="cream-section why-section" id="why"><div className="why-intro"><span className="eyebrow">THE CC DIFFERENCE</span><h2>{tr.whyChoose}<br /><em>Copper &amp; Crown?</em></h2><p>We focus on quality, reliability, and professional service to power your needs with confidence.</p><span className="copper-rule" /></div><div className="reason-grid">{reasons.map(({ title, text, icon: Icon }) => <div className="reason-card" key={title}><Icon /><h3>{title}</h3><p>{text}</p></div>)}</div></section>

      <section className="services-section" id="services"><div className="services-layout"><div className="services-copy"><SectionHeading eyebrow={tr.ourServices.toUpperCase()} title={<>Powering every <em>possibility.</em></>} text="Professional electrical solutions for the places and people that matter." light /><div className="service-promise"><span className="promise-number">08</span><span>Ways we can help<br /><b>One standard of care.</b></span></div></div><div className="service-grid">{services.map(({ title, description, icon: Icon }, index) => <article className="service-card" key={title}><div className="service-card-top"><span className="service-number">0{index + 1}</span><Icon /></div><h3>{title}</h3><p>{description}</p><button className="service-link" onClick={() => setBookingOpen(true)}>Request service <ArrowRight size={14} /></button></article>)}</div></div></section>

      <section className="cream-section pricing-section" id="pricing"><SectionHeading eyebrow="PRICING & PACKAGES" title={<>Service <em>pricing.</em></>} text="Transparent rates for common electrical work. Custom quotes available for larger projects." /><div className="pricing-grid">{pricing.map((plan) => <div className={`pricing-card ${plan.popular ? 'popular' : ''}`} key={plan.name}>{plan.popular && <span className="popular-tag">Most Popular</span>}<h3>{plan.name}</h3><div className="price-display"><b>{plan.price}</b><span>{plan.unit}</span></div><ul>{plan.features.map((feature) => <li key={feature}><Check size={14} /> {feature}</li>)}</ul><button className="button button-copper" onClick={() => setBookingOpen(true)}>{tr.bookNow} <ArrowRight size={16} /></button><button className="button button-outline" onClick={() => setQuoteOpen(true)}>{tr.customQuote}</button></div>)}</div></section>

      <section className="gallery-section" id="gallery"><SectionHeading eyebrow={tr.galleryTitle.toUpperCase()} title={<>Work we're <em>proud of.</em></>} text="A selection of residential, commercial, and industrial electrical projects." light /><GalleryGrid /></section>

      <section className="about-section cream-section" id="about"><div className="about-art"><div className="art-ring" /><div className="art-bolt"><Zap size={86} /></div><span>SAFE<br />SMART<br /><b>POWER</b></span></div><div className="about-copy"><span className="eyebrow">{tr.aboutTitle.toUpperCase()}</span><h2>Built around the work<br /><em>that keeps life moving.</em></h2><p>Copper &amp; Crown provides electrical supplies and services with a practical, professional approach. From a single switch or fan to wiring, installation, repair, and inspection work, we listen first and help you choose the right next step.</p><p>Our goal is simple: dependable electrical work, clear expectations, and a service experience that respects your time and space.</p><button className="button button-dark" onClick={() => scrollToSection('contact')}>{tr.learnMore} <ArrowRight size={16} /></button></div></section>

      <section className="cream-section shop-section" id="shop"><SectionHeading eyebrow="SHOP PRODUCTS" title={<>Quality <em>supplies.</em></>} text="Essential electrical products available for direct purchase. Add items to your cart and request checkout." /><div className="product-grid">{products.map((product) => <div className="product-card" key={product.id}><div className="product-icon"><PlugZap size={28} /></div><h3>{product.name}</h3><b>Rs. {product.price.toLocaleString()}</b><button className="button button-copper" onClick={() => cart.add({ id: product.id, name: product.name, price: product.price })}>Add to Cart <ShoppingBag size={15} /></button></div>)}</div></section>

      <section className="quote-section" id="quote"><div className="quote-intro"><span className="eyebrow copper-eyebrow">START A PROJECT</span><h2>Let's make a plan<br /><em>that makes sense.</em></h2><p>Tell us about your requirements and we'll get back to you through your preferred channel.</p><div className="quote-note"><CalendarDays size={18} /><span>Quotes are reviewed by our team.<br /><b>No card details required.</b></span></div></div><div className="quote-card"><QuoteFormInline onSubmitted={quoteDone} /></div></section>

      <section className="reviews-contact" id="contact">
        <div className="reviews"><SectionHeading eyebrow={tr.testimonials.toUpperCase()} title={<>Kind words from<br /><em>the people we serve.</em></>} /><TestimonialSlider /></div>
        <div className="contact-card">
          <SectionHeading eyebrow={tr.getInTouch.toUpperCase()} title={<>Need a hand?<br /><em>We're here to help.</em></>} />
          <div className="contact-details">
            <a href="tel:03294942684"><Phone size={17} /><span>0329-4942684<small>Call us directly</small></span></a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><MessageCircle size={17} /><span>+92 329 4942684<small>Chat on WhatsApp</small></span></a>
            <a href="mailto:coppercrown.pk@gmail.com"><Mail size={17} /><span>coppercrown.pk@gmail.com<small>Send us an email</small></span></a>
          </div>
          <div className="map-block"><MapPin size={22} /><span>Google Maps embed area<br /><small>Replace with your business location embed</small></span></div>
          <h3>{tr.sendMessage}</h3>
          <form onSubmit={submitContact} className="contact-form"><div className="contact-form-row"><input aria-label={tr.yourName} placeholder={`${tr.yourName} *`} value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} /><input aria-label={tr.yourEmail} type="email" placeholder={`${tr.yourEmail} *`} value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} /></div><textarea aria-label={tr.yourMessage} placeholder={`${tr.yourMessage} *`} rows={3} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} />{contactSent && <p className="success-text">Your message is saved for the business team.</p>}<button className="button button-copper" type="submit">{tr.send} <ArrowRight size={16} /></button></form>
        </div>
      </section>

      <section className="track-banner"><div><span className="eyebrow">ALREADY SENT A REQUEST?</span><h2>Keep an eye on the next step.</h2></div><button className="button button-outline-light" onClick={() => setTrackingOpen(true)}>Track your request <Search size={16} /></button></section>
    </main>

    <footer className="site-footer"><div className="footer-main">
      <Brand light />
      <p>Dependable electrical services for homes, businesses, and projects.</p>
      <div className="footer-links">
        <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>{tr.about}</a>
        <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>{tr.services}</a>
        <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>{tr.pricing}</a>
        <a href="#gallery" onClick={(e) => { e.preventDefault(); scrollToSection('gallery'); }}>{tr.gallery}</a>
        <a href="#quote" onClick={(e) => { e.preventDefault(); scrollToSection('quote'); }}>{tr.quote}</a>
        <a href="/admin.html">{tr.adminDemo}</a>
      </div>
      <div className="footer-social"><span>{tr.follow}</span>
        {social.length ? social.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer">{name === 'instagram' ? <Instagram size={16} /> : name === 'facebook' ? <Facebook size={16} /> : <MessageCircle size={16} />}</a>) : <small>{tr.socialLinks}</small>}
      </div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Copper &amp; Crown. All rights reserved.</span><span>Demo frontend · Secure backend required for production</span></div></footer>

    {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} onSubmitted={serviceDone} />}
    {quoteOpen && <QuoteModal onClose={() => setQuoteOpen(false)} onSubmitted={quoteDone} />}
    {confirmation && <div className="modal-backdrop"><div className="modal-panel"><button className="modal-close" onClick={() => setConfirmation(null)}><X /></button><Confirmation title={confirmation.type === 'service' ? 'Your service request is in.' : 'Your quote request is in.'} id={confirmation.id} onClose={() => setConfirmation(null)} /></div></div>}
    {accountOpen && <AccountPanel onClose={() => setAccountOpen(false)} onTrack={() => { setAccountOpen(false); setTrackingOpen(true); }} />}
    {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onAccount={() => { setLoginOpen(false); setAccountOpen(true); }} />}
    {trackingOpen && <TrackingModal onClose={() => setTrackingOpen(false)} />}
    {cartOpen && <CartDrawer items={cart.items} onClose={() => setCartOpen(false)} onRemove={cart.remove} onQty={cart.changeQty} />}
    <WhatsAppFloat />
    <Toast />
  </div>;
}

function QuoteFormInline({ onSubmitted }: { onSubmitted: (quote: QuoteRequest) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: '', description: '', requirements: '', address: '', contactMethod: 'WhatsApp' });
  const [error, setError] = useState('');
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); if (!form.name || !form.phone || !form.email || !form.description) { setError('Please complete the required fields.'); return; } const quote: QuoteRequest = { ...form, id: createId('CC-QT'), createdAt: new Date().toISOString() }; writeStorage(QUOTE_KEY, [quote, ...readStorage<QuoteRequest>(QUOTE_KEY)]); onSubmitted(quote); };
  return <form onSubmit={submit} className="quote-form"><div className="form-grid"><Field label="Name" required value={form.name} onChange={(v) => update('name', v)} /><Field label="Phone" required value={form.phone} onChange={(v) => update('phone', v)} /><Field label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} /><Field label="Service" value={form.service} onChange={(v) => update('service', v)} /><Field label="Project Description" required full type="textarea" value={form.description} onChange={(v) => update('description', v)} /><Field label="Estimated Requirements" full type="textarea" value={form.requirements} onChange={(v) => update('requirements', v)} /><Field label="Address" full value={form.address} onChange={(v) => update('address', v)} /><Field label="Preferred Contact Method" type="select" value={form.contactMethod} onChange={(v) => update('contactMethod', v)} options={['WhatsApp', 'Phone', 'Email']} />{error && <p className="form-error full-span">{error}</p>}<div className="full-span form-actions"><button className="button button-copper" type="submit">Request My Quote <ArrowRight size={16} /></button></div></div></form>;
}

export default App;
