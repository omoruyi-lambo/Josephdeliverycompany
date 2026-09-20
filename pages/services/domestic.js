import ServicePageTemplate from '../../components/ServicePageTemplate';

export default function DomesticPage() {
  return (
    <ServicePageTemplate
      title="Domestic Shipping"
      eyebrowLabel="Within Nigeria"
      heroDesc="Reliable, cost-effective delivery across all 36 states and the FCT. Ideal for individuals, small businesses, and e-commerce sellers."
      imgSrc="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1400&q=80"
      imgAlt="Delivery van on a road for domestic shipping across Nigeria"
      price="From ₦1,800"
      deliveryTime="3–5 Business Days"
      metaDesc="Affordable domestic shipping across all of Nigeria. Tracked parcels, proof of delivery, up to 70 kg. Perfect for e-commerce and personal shipments."
      features={[
        { icon: 'fa-solid fa-map-location-dot', title: 'Nationwide Coverage', desc: 'Every local government area in all 36 states and the FCT.' },
        { icon: 'fa-solid fa-magnifying-glass-location', title: 'Online Tracking', desc: 'Track your parcel's journey at every checkpoint in real time.' },
        { icon: 'fa-solid fa-file-signature', title: 'Proof of Delivery', desc: 'Digital confirmation with recipient signature stored on your account.' },
        { icon: 'fa-solid fa-weight-scale', title: 'Up to 70 kg', desc: 'Standard domestic service handles parcels up to 70 kg per shipment.' },
        { icon: 'fa-solid fa-boxes-stacked', title: 'Bulk Discounts', desc: 'Volume pricing available for businesses shipping more than 20 parcels per week.' },
        { icon: 'fa-solid fa-rotate-right', title: 'Returns Handling', desc: 'Simple returns label generation for e-commerce businesses.' },
      ]}
      steps={[
        { n: '01', title: 'Book & Pack', desc: 'Place your order online and pack your item securely. We send a booking confirmation instantly.' },
        { n: '02', title: 'We Collect', desc: 'A Josephdeliverycompany courier collects from your door or you drop off at a depot.' },
        { n: '03', title: 'In Transit', desc: 'Your parcel moves through our hub network with live tracking updates.' },
        { n: '04', title: 'Delivered', desc: 'Recipient receives the parcel with a digital proof-of-delivery confirmation.' },
      ]}
      faqs={[
        { q: 'How long does domestic shipping take?', a: 'Standard domestic delivery takes 3–5 business days depending on origin and destination. Remote areas may take up to 7 days.' },
        { q: 'Are there items I cannot ship domestically?', a: 'Prohibited items include hazardous materials, perishable goods without prior arrangement, and live animals. Contact us for a full restricted items list.' },
        { q: 'Can I ship multiple parcels in one booking?', a: 'Yes. You can add up to 10 parcels to a single booking. Each parcel is tracked individually.' },
        { q: 'What packaging do I need?', a: 'Use a sturdy cardboard box with adequate padding. Items must be sealed and labelled with sender and recipient details. We sell packaging materials at all depots.' },
      ]}
    />
  );
}
