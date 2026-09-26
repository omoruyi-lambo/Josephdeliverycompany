import ServicePageTemplate from '../../components/ServicePageTemplate';

export default function ExpressPage() {
  return (
    <ServicePageTemplate
      title="Express Delivery"
      eyebrowLabel="Express Service"
      heroDesc="Next-business-day door-to-door delivery for parcels up to 30 kg. Guaranteed pickup before noon, delivered by close of business the following day."
      imgSrc="https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=1400&q=80"
      imgAlt="Courier handling a parcel for express delivery"
      price="From $35"
      deliveryTime="Next Business Day"
      metaDesc="Express next-day delivery across Nigeria. Door-to-door pickup with real-time tracking, SMS alerts, and proof of delivery."
      features={[
        { icon: 'fa-solid fa-bolt', title: 'Next-Day Delivery', desc: 'Pickup today, delivered by close of business tomorrow anywhere in Nigeria.' },
        { icon: 'fa-solid fa-location-dot', title: 'Real-Time GPS Tracking', desc: 'Follow your parcel at every stage from pickup to final delivery.' },
        { icon: 'fa-solid fa-bell', title: 'SMS & Email Alerts', desc: 'Automatic notifications when your parcel is picked up, in transit, and delivered.' },
        { icon: 'fa-solid fa-signature', title: 'Signature Confirmation', desc: 'Proof-of-delivery signature captured and stored digitally.' },
        { icon: 'fa-solid fa-shield-halved', title: 'Included Insurance', desc: 'Basic coverage up to $500 included. Extended cover available.' },
        { icon: 'fa-solid fa-headset', title: '24/7 Priority Support', desc: 'Express customers get priority access to our logistics team any time.' },
      ]}
      steps={[
        { n: '01', title: 'Book Before Noon', desc: 'Place your booking online or by phone before 12:00 PM for same-day pickup.' },
        { n: '02', title: 'Courier Collects', desc: 'A dedicated courier arrives at your address within the confirmed pickup window.' },
        { n: '03', title: 'Delivered Tomorrow', desc: 'Your parcel is delivered to the recipient by the close of the next business day.' },
      ]}
      faqs={[
        { q: 'What is the weight limit for express delivery?', a: 'Express delivery handles parcels up to 30 kg. For heavier shipments please see our Freight & Cargo service.' },
        { q: 'What happens if no one is home to receive the parcel?', a: 'Our courier will attempt delivery twice. If unsuccessful, the parcel is held at your nearest Josephdeliverycompany depot for 5 business days.' },
        { q: 'Is express available on weekends and public holidays?', a: 'Weekend delivery is available in Lagos, Abuja, and Port Harcourt at a surcharge. Public holiday deliveries are arranged on request.' },
        { q: 'Can I change the delivery address after booking?', a: 'Address changes are accepted up to 2 hours after booking is confirmed, subject to a $5 amendment fee.' },
      ]}
    />
  );
}
