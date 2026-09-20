import ServicePageTemplate from '../../components/ServicePageTemplate';

export default function FreightPage() {
  return (
    <ServicePageTemplate
      title="Freight & Cargo"
      eyebrowLabel="Heavy & Bulk Shipments"
      heroDesc="Full truckload, part-load, and air freight solutions for industrial cargo, palletised goods, and high-volume commercial shipments across Nigeria and beyond."
      imgSrc="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1400&q=80"
      imgAlt="Shipping containers at a freight port"
      price="Custom Quote"
      deliveryTime="Flexible — Based on Route"
      metaDesc="Freight and cargo shipping for heavy, palletised, and bulk shipments. Road and air freight across Nigeria and internationally."
      features={[
        { icon: 'fa-solid fa-truck-ramp-box', title: 'Full & Part Truckload', desc: 'Dedicated FTL or shared LTL capacity based on your volume requirements.' },
        { icon: 'fa-solid fa-plane-departure', title: 'Air Freight', desc: 'Time-sensitive cargo flown on scheduled and charter services to domestic and international destinations.' },
        { icon: 'fa-solid fa-pallet', title: 'Pallet & Container', desc: 'ISO container and standard EUR-pallet handling for structured loading and safe transit.' },
        { icon: 'fa-solid fa-user-tie', title: 'Dedicated Account Manager', desc: 'A named contact manages your freight movements from booking to proof of delivery.' },
        { icon: 'fa-solid fa-warehouse', title: 'Warehousing', desc: 'Short and long-term storage with inventory management and order fulfilment available.' },
        { icon: 'fa-solid fa-file-invoice', title: 'Full Customs Clearance', desc: 'Import and export documentation, SON, NAFDAC, and other regulatory compliance managed for you.' },
      ]}
      steps={[
        { n: '01', title: 'Request a Quote', desc: 'Provide cargo dimensions, weight, origin, and destination for a tailored rate.' },
        { n: '02', title: 'Confirm Booking', desc: 'Your account manager confirms the schedule, vehicle type, and documentation requirements.' },
        { n: '03', title: 'Collection & Loading', desc: 'We dispatch the appropriate vehicle to your premises for loading and departure.' },
        { n: '04', title: 'Delivery & POD', desc: 'Cargo delivered to the consignee with a signed proof of delivery and condition report.' },
      ]}
      faqs={[
        { q: 'Is there a minimum weight or size for freight?', a: 'Our freight service is designed for shipments above 70 kg or that require pallet/container handling. For lighter parcels, see our Standard or Express services.' },
        { q: 'Can you handle hazardous or temperature-sensitive cargo?', a: 'Yes, with prior arrangement. Hazardous materials require ADR/IMDG documentation. Temperature-controlled vehicles are available for pharmaceutical and perishable cargo.' },
        { q: 'How long does a domestic freight delivery take?', a: 'Domestic road freight typically takes 1–3 days depending on route. Cross-country routes are usually overnight.' },
        { q: 'Do you offer warehousing alongside freight?', a: 'Yes. We can hold your cargo at our Lagos, Abuja, or Port Harcourt depots and release on your instruction, with daily inventory reports available.' },
      ]}
    />
  );
}
