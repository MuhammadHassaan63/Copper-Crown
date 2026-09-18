import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Facebook,
  Headphones,
  Instagram,
  Lightbulb,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  PlugZap,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useRouter } from '@/context/RouterContext';

const WHATSAPP_NUMBER = '923294942684';
const SOCIAL_LINKS = { instagram: '', facebook: '', other: '' };
const REQUEST_KEY = 'copper_crown_service_requests';
const QUOTE_KEY = 'copper_crown_quote_requests';
const MESSAGE_KEY = 'copper_crown_messages';
const CUSTOMER_KEY = 'copper_crown_customer';

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

function readStorage<T>(key: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value as T[] : [];
  } catch {
    return [];
  }
}

function writeStorage<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function scrollToSection(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

function Header({ onAccount }: { onAccount: () => void }) {
  const [open, setOpen] = useState(false);
  const links = [['About Us', 'about'], ['Services', 'services'], ['Get a Quote', 'quote'], ['Contact', 'contact']];
  const go = (id: string) => { setOpen(false); scrollToSection(id); };
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className={open ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
          <a className="active" href="#home" onClick={(e) => { e.preventDefault(); go('home'); }}>Home</a>
          {links.map(([label, id]) => <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }}>{label}</a>)}
          <button className="account-link" onClick={() => { setOpen(false); onAccount(); }}><UserRound size={16} /> My Account</button>
        </nav>
        <div className="header-actions">
          <button className="icon-button menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
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

function ServiceModal({ selected, onClose, onSubmitted }: { selected: string; onClose: () => void; onSubmitted: (request: ServiceRequest) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', whatsapp: '', email: '', service: selected, problem: '', preferredDate: '', preferredTime: '', address: '', details: '' });
  const [error, setError] = useState('');
  useEffect(() => setForm((current) => ({ ...current, service: selected })), [selected]);
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
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-panel form-modal"><button className="modal-close" onClick={onClose} aria-label="Close form"><X /></button><div className="modal-top"><span className="eyebrow">SERVICE REQUEST</span><h2>Tell us what you need.</h2><p>Share a few details and our team can understand the job before we speak.</p></div><form onSubmit={submit} className="form-grid"><Field label="Full Name" required value={form.name} onChange={(v) => update('name', v)} /><Field label="Phone Number" required value={form.phone} onChange={(v) => update('phone', v)} /><Field label="WhatsApp Number" value={form.whatsapp} onChange={(v) => update('whatsapp', v)} /><Field label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} /><Field label="Service Required" required type="select" value={form.service} onChange={(v) => update('service', v)} options={services.map((service) => service.title)} /><Field label="Preferred Date" type="date" value={form.preferredDate} onChange={(v) => update('preferredDate', v)} /><Field label="Preferred Time" type="select" value={form.preferredTime} onChange={(v) => update('preferredTime', v)} options={['Morning', 'Afternoon', 'Evening']} /><Field label="Address" required full value={form.address} onChange={(v) => update('address', v)} /><Field label="Problem / Requirement" required full type="textarea" value={form.problem} onChange={(v) => update('problem', v)} /><Field label="Additional Details" full type="textarea" value={form.details} onChange={(v) => update('details', v)} />{error && <p className="form-error full-span">{error}</p>}<div className="form-actions full-span"><button className="button button-copper" type="submit">Submit Request <ArrowRight size={16} /></button><a className="button button-whatsapp" href={whatsappUrl(message)} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Send on WhatsApp</a></div></form></div></div>;
}

function Field({ label, value, onChange, type = 'text', required = false, full = false, options = [] }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; full?: boolean; options?: string[] }) {
  const common = { value, required, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value) };
  return <label className={full ? 'field full-span' : 'field'}><span>{label}{required && <b> *</b>}</span>{type === 'textarea' ? <textarea {...common} rows={3} /> : type === 'select' ? <select {...common}><option value="">Select</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input {...common} type={type} />}</label>;
}

function QuoteForm({ onSubmitted }: { onSubmitted: (quote: QuoteRequest) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: '', description: '', requirements: '', address: '', contactMethod: 'WhatsApp' });
  const [error, setError] = useState('');
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); if (!form.name || !form.phone || !form.email || !form.description) { setError('Please complete the required fields.'); return; } const quote: QuoteRequest = { ...form, id: createId('CC-QT'), createdAt: new Date().toISOString() }; writeStorage(QUOTE_KEY, [quote, ...readStorage<QuoteRequest>(QUOTE_KEY)]); onSubmitted(quote); };
  return <form onSubmit={submit} className="quote-form"><div className="form-grid"><Field label="Name" required value={form.name} onChange={(v) => update('name', v)} /><Field label="Phone" required value={form.phone} onChange={(v) => update('phone', v)} /><Field label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} /><Field label="Service" value={form.service} onChange={(v) => update('service', v)} /><Field label="Project Description" required full type="textarea" value={form.description} onChange={(v) => update('description', v)} /><Field label="Estimated Requirements" full type="textarea" value={form.requirements} onChange={(v) => update('requirements', v)} /><Field label="Address" full value={form.address} onChange={(v) => update('address', v)} /><Field label="Preferred Contact Method" type="select" value={form.contactMethod} onChange={(v) => update('contactMethod', v)} options={['WhatsApp', 'Phone', 'Email']} />{error && <p className="form-error full-span">{error}</p>}<div className="full-span form-actions"><button className="button button-copper" type="submit">Request My Quote <ArrowRight size={16} /></button></div></div></form>;
}

function Confirmation({ title, id, onClose }: { title: string; id: string; onClose: () => void }) { return <div className="confirmation"><div className="confirmation-icon"><Check /></div><span className="eyebrow">CONFIRMED</span><h2>{title}</h2><p>Your reference ID is <strong>{id}</strong>. Keep it safe to track your request.</p><button className="button button-copper" onClick={onClose}>Back to website <ArrowRight size={16} /></button></div>; }

function Tracking({ onClose }: { onClose: () => void }) {
  const [id, setId] = useState(''); const [request, setRequest] = useState<ServiceRequest | null>(null); const [error, setError] = useState('');
  const search = (event: FormEvent) => { event.preventDefault(); const found = readStorage<ServiceRequest>(REQUEST_KEY).find((item) => item.id.toLowerCase() === id.trim().toLowerCase()); if (!found) { setError('We could not find that request ID in this browser.'); setRequest(null); } else { setError(''); setRequest(found); } };
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-panel tracking-panel"><button className="modal-close" onClick={onClose}><X /></button><span className="eyebrow">REQUEST TRACKING</span><h2>Where is your request?</h2><p>Enter the reference ID from your confirmation.</p><form className="tracking-search" onSubmit={search}><input value={id} onChange={(e) => setId(e.target.value)} placeholder="CC-SR-..." aria-label="Request ID" /><button className="button button-copper" type="submit"><Search size={16} /> Track</button></form>{error && <p className="form-error">{error}</p>}{request && <div className="tracking-result"><div className="result-row"><span>Request ID</span><strong>{request.id}</strong></div><div className="result-row"><span>Service</span><strong>{request.service}</strong></div><div className="result-row"><span>Date submitted</span><strong>{new Date(request.createdAt).toLocaleDateString()}</strong></div><div className="status-pill"><span className="status-dot" />{request.status}</div><div className="result-details"><b>{request.name}</b><span>{request.phone} · {request.email}</span><span>{request.problem}</span></div></div>}</div></div>;
}

function AccountPanel({ onClose, onTrack }: { onClose: () => void; onTrack: () => void }) {
  const customer = (() => { try { return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || 'null') as Customer | null; } catch { return null; } })();
  const requests = customer ? readStorage<ServiceRequest>(REQUEST_KEY).filter((request) => request.email === customer.email) : [];
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-panel account-panel"><button className="modal-close" onClick={onClose}><X /></button><span className="eyebrow">MY ACCOUNT · DEMO</span>{customer ? <><h2>Welcome back, {customer.name.split(' ')[0]}.</h2><p className="demo-note">This browser-only account is a demo. A secure backend is required for real customer accounts.</p><div className="account-card"><div className="avatar"><UserRound /></div><div><b>{customer.name}</b><span>{customer.email}</span><span>{customer.phone}</span></div></div><h3>Your service requests</h3>{requests.length ? requests.map((request) => <div className="mini-request" key={request.id}><b>{request.service}</b><span>{request.id} · {request.status}</span></div>) : <p>No requests saved yet.</p>}<button className="button button-outline" onClick={onTrack}>Track a request <Search size={16} /></button></> : <><h2>Keep your requests close.</h2><p>Submit a service request to create a demo customer profile in this browser.</p><button className="button button-copper" onClick={onClose}>Request a service <ArrowRight size={16} /></button></>}</div></div>;
}

function App() {
  const { path } = useRouter();
  const [serviceModal, setServiceModal] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ type: 'service' | 'quote'; id: string } | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  useEffect(() => { if (path === '/services') scrollToSection('services'); if (path === '/about') scrollToSection('about'); if (path === '/quote') scrollToSection('quote'); if (path === '/contact') scrollToSection('contact'); }, [path]);
  const social = useMemo(() => Object.entries(SOCIAL_LINKS).filter(([, url]) => Boolean(url)), []);
  const submitContact = (event: FormEvent) => { event.preventDefault(); if (!contactForm.name || !contactForm.email || !contactForm.message) return; const messages = readStorage<{ id: string; createdAt: string; name: string; email: string; message: string }>(MESSAGE_KEY); writeStorage(MESSAGE_KEY, [{ ...contactForm, id: createId('CC-MS'), createdAt: new Date().toISOString() }, ...messages]); setContactSent(true); setContactForm({ name: '', email: '', message: '' }); };
  const serviceDone = (request: ServiceRequest) => { setServiceModal(null); setConfirmation({ type: 'service', id: request.id }); };
  const quoteDone = (quote: QuoteRequest) => setConfirmation({ type: 'quote', id: quote.id });
  const generalMessage = 'Hello Copper & Crown, I would like to ask about your electrical services.';
  return <div className="app-shell"><Header onAccount={() => setAccountOpen(true)} /><main>
    <section className="hero" id="home"><div className="hero-content"><span className="eyebrow copper-eyebrow">COPPER &amp; CROWN · EST. FOR EVERYDAY NEEDS</span><h1>Electrical work,<br /><em>done with care.</em></h1><p className="hero-lead">Reliable electrical installation, repair, wiring, fans, lighting, switches, sockets, inspections, and practical solutions for your home, business, or project.</p><div className="hero-actions"><button className="button button-copper" onClick={() => scrollToSection('services')}>Our Services <ArrowRight size={16} /></button><button className="button button-ghost-light" onClick={() => setServiceModal('')}>Request a Service</button><button className="text-button" onClick={() => scrollToSection('quote')}>Get a Quote <ArrowRight size={16} /></button></div><div className="hero-meta"><span><span className="meta-dot" />Available for new requests</span><span>0329-4942684</span></div></div><ElectricalVisual /></section>
    <section className="trust-strip"><div><span>THE ROYAL STANDARD OF</span><b>ELECTRICAL CRAFTSMANSHIP</b></div><p>Thoughtful service. Clear communication. Work you can depend on.</p><div className="strip-mark"><Zap size={18} /> CC / 01</div></section>
    <section className="cream-section why-section" id="why"><div className="why-intro"><span className="eyebrow">THE CC DIFFERENCE</span><h2>Why choose<br /><em>Copper &amp; Crown?</em></h2><p>We focus on quality, reliability, and professional service to power your needs with confidence.</p><span className="copper-rule" /></div><div className="reason-grid">{reasons.map(({ title, text, icon: Icon }) => <div className="reason-card" key={title}><Icon /><h3>{title}</h3><p>{text}</p></div>)}</div></section>
    <section className="services-section" id="services"><div className="services-layout"><div className="services-copy"><SectionHeading eyebrow="OUR SERVICES" title={<>Powering every <em>possibility.</em></>} text="Professional electrical solutions for the places and people that matter." light /><div className="service-promise"><span className="promise-number">08</span><span>Ways we can help<br /><b>One standard of care.</b></span></div></div><div className="service-grid">{services.map(({ title, description, icon: Icon }, index) => <article className="service-card" key={title}><div className="service-card-top"><span className="service-number">0{index + 1}</span><Icon /></div><h3>{title}</h3><p>{description}</p><button className="service-link" onClick={() => setServiceModal(title)}>Request service <ArrowRight size={14} /></button></article>)}</div></div></section>
    <section className="about-section cream-section" id="about"><div className="about-art"><div className="art-ring" /><div className="art-bolt"><Zap size={86} /></div><span>SAFE<br />SMART<br /><b>POWER</b></span></div><div className="about-copy"><span className="eyebrow">ABOUT COPPER &amp; CROWN</span><h2>Built around the work<br /><em>that keeps life moving.</em></h2><p>Copper &amp; Crown provides electrical supplies and services with a practical, professional approach. From a single switch or fan to wiring, installation, repair, and inspection work, we listen first and help you choose the right next step.</p><p>Our goal is simple: dependable electrical work, clear expectations, and a service experience that respects your time and space.</p><button className="button button-dark" onClick={() => scrollToSection('contact')}>Talk to our team <ArrowRight size={16} /></button></div></section>
    <section className="quote-section" id="quote"><div className="quote-intro"><span className="eyebrow copper-eyebrow">START A PROJECT</span><h2>Let’s make a plan<br /><em>that makes sense.</em></h2><p>Tell us about your requirements and we’ll get back to you through your preferred channel.</p><div className="quote-note"><CalendarDays size={18} /><span>Quotes are reviewed by our team.<br /><b>No card details required.</b></span></div></div><div className="quote-card"><QuoteForm onSubmitted={quoteDone} /></div></section>
    <section className="reviews-contact" id="contact"><div className="reviews"><SectionHeading eyebrow="CUSTOMER NOTES" title={<>Kind words from<br /><em>the people we serve.</em></>} text="Demo reviews shown here are placeholders for your future customer feedback." /><div className="review-card"><div className="quote-mark">“</div><p>Professional service starts with listening. We aim to make every electrical job feel clear, considered, and well looked after.</p><div className="review-footer"><span><b>Demo review</b><small>Replace with a real customer note</small></span><span className="review-dots">● ○ ○</span></div></div></div><div className="contact-card"><SectionHeading eyebrow="GET IN TOUCH" title={<>Need a hand?<br /><em>We’re here to help.</em></>} /><div className="contact-details"><a href="tel:03294942684"><Phone size={17} /><span>0329-4942684<small>Call us directly</small></span></a><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><MessageCircle size={17} /><span>+92 329 4942684<small>Chat on WhatsApp</small></span></a><a href="mailto:coppercrown.pk@gmail.com"><Mail size={17} /><span>coppercrown.pk@gmail.com<small>Send us an email</small></span></a></div><form onSubmit={submitContact} className="contact-form"><div className="contact-form-row"><input aria-label="Your name" placeholder="Your name *" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} /><input aria-label="Your email" type="email" placeholder="Your email *" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} /></div><textarea aria-label="Your message" placeholder="Your message *" rows={3} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} />{contactSent && <p className="success-text">Your message is saved for the business team.</p>}<button className="button button-copper" type="submit">Send Message <ArrowRight size={16} /></button></form></div></section>
    <section className="track-banner"><div><span className="eyebrow">ALREADY SENT A REQUEST?</span><h2>Keep an eye on the next step.</h2></div><button className="button button-outline-light" onClick={() => setTrackingOpen(true)}>Track your request <Search size={16} /></button></section>
  </main><footer className="site-footer"><div className="footer-main"><Brand light /><p>Dependable electrical services for homes, businesses, and projects.</p><div className="footer-links"><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a><a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Services</a><a href="#quote" onClick={(e) => { e.preventDefault(); scrollToSection('quote'); }}>Get a Quote</a><a href="/admin.html">Admin demo</a></div><div className="footer-social"><span>Follow us</span>{social.length ? social.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer">{name === 'instagram' ? <Instagram size={16} /> : <Facebook size={16} />}</a>) : <small>Social links to be added</small>}</div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Copper &amp; Crown. All rights reserved.</span><span>Demo frontend · Secure backend required for production</span></div></footer>
    {serviceModal !== null && <ServiceModal selected={serviceModal} onClose={() => setServiceModal(null)} onSubmitted={serviceDone} />}
    {confirmation && <div className="modal-backdrop"><div className="modal-panel"><button className="modal-close" onClick={() => setConfirmation(null)}><X /></button><Confirmation title={confirmation.type === 'service' ? 'Your service request is in.' : 'Your quote request is in.'} id={confirmation.id} onClose={() => setConfirmation(null)} /></div></div>}
    {accountOpen && <AccountPanel onClose={() => setAccountOpen(false)} onTrack={() => { setAccountOpen(false); setTrackingOpen(true); }} />}
    {trackingOpen && <Tracking onClose={() => setTrackingOpen(false)} />}
  </div>;
}

export default App;
