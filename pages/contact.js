import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required.';
    if (!form.subject.trim()) e.subject = 'Please enter a subject.';
    if (!form.message.trim() || form.message.length < 10) e.message = 'Message must be at least 10 characters.';
    return e;
  }

  function handle(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: undefined }));
  }

  function submit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSent(true);
  }

  return (
    <>
      <Head>
        <title>Contact Us — Josephdeliverycompany</title>
        <meta name="description" content="Contact Josephdeliverycompany by phone, email, or our online form. We respond within 2 business hours." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <section style={{ backgroundColor: '#0a1f3c', padding: '72px 24px 64px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={eyebrow}>Get in Touch</p>
          <h1 style={{ fontSize: 'clamp(30px,5vw,50px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 16, lineHeight: 1.08 }}>Contact Us</h1>
          <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 480 }}>
            Questions about a shipment, pricing, or partnership? Send us a message and we'll get back to you within 2 hours.
          </p>
        </div>
      </section>

      <main style={{ backgroundColor: '#f4f5f7', padding: '56px 24px 80px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }} className="contact-grid">

          {/* Form */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 12, padding: 'clamp(24px,5vw,40px)' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <i className="fa-solid fa-check" style={{ color: '#fff', fontSize: 24 }} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0a1f3c', marginBottom: 10 }}>Message Sent!</h2>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                  Thanks for reaching out. We'll reply to <strong>{form.email}</strong> within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0a1f3c', marginBottom: 24 }}>Send a Message</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <Field label="Full Name" name="name" value={form.name} onChange={handle} error={errors.name} placeholder="John Doe" />
                  <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={handle} placeholder="+1 (305) 555-0100" />
                </div>
                <Field label="Email" name="email" type="email" value={form.email} onChange={handle} error={errors.email} placeholder="john@example.com" mb={16} />
                <Field label="Subject" name="subject" value={form.subject} onChange={handle} error={errors.subject} placeholder="Re: Tracking number JDC-2026-00127" mb={16} />
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Message</label>
                  <textarea name="message" value={form.message} onChange={handle} rows={5} placeholder="Tell us how we can help…"
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', borderColor: errors.message ? '#c0392b' : '#d1d5db' }} />
                  {errors.message && <p style={errStyle}>{errors.message}</p>}
                </div>
                <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.4px' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#a93226'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#c0392b'}>
                  SEND MESSAGE
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: 'fa-solid fa-phone', title: 'Phone', lines: ['+1 (305) 555-0192', '24/7 for urgent issues'] },
              { icon: 'fa-solid fa-envelope', title: 'Email', lines: ['info@josephdeliverycompany.com', 'support@josephdeliverycompany.com'] },
              { icon: 'fa-solid fa-location-dot', title: 'Head Office', lines: ['14 Marina Street', 'Lagos Island, Lagos, Nigeria'] },
              { icon: 'fa-regular fa-clock', title: 'Office Hours', lines: ['Mon–Fri: 7am – 9pm', 'Sat: 8am – 6pm · Sun: 10am – 4pm'] },
            ].map(item => (
              <div key={item.title} style={{ backgroundColor: '#fff', border: '1px solid #e2e6ea', borderRadius: 10, padding: '20px 22px', display: 'flex', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff5f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={item.icon} style={{ fontSize: 16, color: '#c0392b' }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>{item.title}</p>
                  {item.lines.map(l => <p key={l} style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{l}</p>)}
                </div>
              </div>
            ))}
            <Link href="/support" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', backgroundColor: '#0a1f3c', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', borderRadius: 8, justifyContent: 'center' }}>
              <i className="fa-solid fa-headset" /> View All Support Options
            </Link>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @media(max-width:768px){
          .contact-grid{grid-template-columns:1fr !important}
        }
      `}</style>
      <Footer />
    </>
  );
}

function Field({ label, name, type = 'text', value, onChange, error, placeholder, mb = 0 }) {
  return (
    <div style={{ marginBottom: mb }}>
      <label style={labelStyle}>{label}</label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ ...inputStyle, borderColor: error ? '#c0392b' : '#d1d5db' }}
        onFocus={e => e.currentTarget.style.borderColor = '#0a1f3c'}
        onBlur={e => e.currentTarget.style.borderColor = error ? '#c0392b' : '#d1d5db'} />
      {error && <p style={errStyle}>{error}</p>}
    </div>
  );
}

const eyebrow = { fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#c0392b', marginBottom: 12 };
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' };
const inputStyle = { display: 'block', width: '100%', padding: '11px 14px', fontSize: 14, color: '#1a1a2e', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: 6, outline: 'none', boxSizing: 'border-box' };
const errStyle = { fontSize: 12, color: '#c0392b', marginTop: 4 };
