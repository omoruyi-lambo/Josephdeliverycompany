import Head from 'next/head';
import Header from '../components/Header';
import Hero from '../components/Hero';
import TrackingForm from '../components/TrackingForm';
import QuickActions from '../components/QuickActions';
import Services from '../components/Services';
import HowItWorks from '../components/HowItWorks';
import BusinessSection from '../components/BusinessSection';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>Josephdeliverycompany — Delivering What Matters</title>
        <meta
          name="description"
          content="Reliable shipping and delivery solutions for individuals and businesses. Express, domestic, international, and freight services."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main>
        <Hero />
        <TrackingForm />
        <QuickActions />
        <Services />
        <HowItWorks />
        <BusinessSection />
        <CTA />
      </main>

      <Footer />
    </>
  );
}
