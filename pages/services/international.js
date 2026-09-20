import ServicePageTemplate from '../../components/ServicePageTemplate';

export default function InternationalPage() {
  return (
    <ServicePageTemplate
      title="International Shipping"
      eyebrowLabel="Cross-Border Delivery"
      heroDesc="Send parcels, documents, and commercial cargo to over 180 countries. We handle customs documentation, duties, and clearance so you don't have to."
      imgSrc="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=80"
      imgAlt="Commercial aircraft on tarmac representing international air freight"
      price="From ₦18,000"
      deliveryTime="5–14 Business Days"
      metaDesc="International shipping from Nigeria to 180+ countries. Full customs support, door-to-door delivery, and real-time tracking."
      features={[
        { icon: 'fa-solid fa-earth-africa', title: '180+ Countries', desc: 'Delivery to every major destination across Africa, Europe, the Americas, Asia, and beyond.' },
        { icon: 'fa-solid fa-file-contract', title: 'Customs Documentation', desc: 'We prepare and manage all export and import documentation including commercial invoices and CN22/CN23 forms.' },
        { icon: 'fa-solid fa-shield-halved', title: 'Comprehensive Insurance', desc: 'Full declared-value insurance available for all international shipments.' },
        { icon: 'fa-solid fa-location-dot', title: 'End-to-End Tracking', desc: 'Track your shipment from Lagos to its final international destination.' },
        { icon: 'fa-solid fa-door-open', title: 'Door-to-Door', desc: "Pickup from your address in Nigeria, delivered to the recipient's door internationally." },
        { icon: 'fa-solid fa-plane-up', title: 'Air & Sea Freight', desc: 'Choose express air freight or economical sea freight depending on your timeline and budget.' },
      ]}
      steps={[
        { n: '01', title: 'Get a Quote', desc: 'Enter your destination country, dimensions, and weight for an instant price.' },
        { n: '02', title: 'Book & Prepare Docs', desc: 'We guide you through required customs forms and commercial declarations.' },
        { n: '03', title: 'Pickup & Export', desc: 'Your parcel is collected, cleared through Nigerian customs, and dispatched.' },
        { n: '04', title: 'International Delivery', desc: "Our partner network delivers to the recipient's door with full tracking." },
      ]}
      faqs={[
        { q: 'Which countries do you ship to?', a: 'We deliver to 180+ countries including the UK, USA, Canada, Germany, France, China, UAE, South Africa, Kenya, and Ghana. Get a quote to check your specific destination.' },
        { q: 'Who pays customs duties and taxes?', a: 'Import duties are the responsibility of the recipient in most cases. We can advise on DDP (Delivered Duty Paid) arrangements for business shipments.' },
        { q: 'How long does international delivery take?', a: 'Air express takes 5–7 business days; standard air 7–10 days; economy/sea freight 21–35 days. Times vary by destination.' },
        { q: 'What items are prohibited internationally?', a: 'Prohibited items include currency, narcotics, weapons, counterfeit goods, and certain food products. Check the destination country\'s import restrictions before booking.' },
      ]}
    />
  );
}
