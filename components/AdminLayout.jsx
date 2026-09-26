import Link from 'next/link';

const navigation = [
  { label: 'Dashboard', href: '/admin', icon: 'fa-solid fa-grid-2' },
  { label: 'Shipments', href: '/admin/shipments', icon: 'fa-solid fa-box' },
  { label: 'Create shipment', href: '/admin/shipments/new', icon: 'fa-solid fa-plus' },
  { label: 'Quote requests', href: '/admin/quotes', icon: 'fa-solid fa-file-invoice' },
  { label: 'Messages', href: '/admin/messages', icon: 'fa-solid fa-inbox' },
  { label: 'Locations', href: '/admin/locations', icon: 'fa-solid fa-location-dot' },
];

export default function AdminLayout({ title, description, children }) {
  return <main className="admin-app"><aside className="admin-sidebar"><Link href="/admin" className="admin-brand" aria-label="Joseph Delivery admin dashboard"><img src="/images/logo.png" alt="Joseph Delivery Company" /></Link><div className="admin-sidebar-label">Workspace</div><nav className="admin-sidebar-nav">{navigation.map(item => <Link key={item.href} href={item.href} className="admin-sidebar-link"><i className={item.icon} /><span>{item.label}</span></Link>)}</nav><div className="admin-sidebar-bottom"><Link href="/admin/settings" className="admin-sidebar-link"><i className="fa-solid fa-sliders" /><span>Settings</span></Link><Link href="/" className="admin-sidebar-link"><i className="fa-solid fa-arrow-up-right-from-square" /><span>View website</span></Link></div></aside><section className="admin-workspace"><header className="admin-topbar"><Link href="/admin" className="admin-mobile-brand" aria-label="Joseph Delivery admin dashboard"><img src="/images/logo.png" alt="Joseph Delivery Company" /></Link><div className="admin-topbar-right"><span className="admin-live"><i /> Live operations</span><Link href="/admin/settings" className="admin-avatar" aria-label="Open admin settings">JD</Link></div></header><div className="admin-content"><div className="admin-page-heading"><div><p className="admin-breadcrumb">Operations <span>/</span> {title}</p><h1>{title}</h1>{description && <p>{description}</p>}</div>{title !== 'Admin dashboard' && <Link href="/admin" className="admin-heading-link"><i className="fa-solid fa-arrow-left" /> Dashboard</Link>}</div>{children}</div></section></main>;
}
