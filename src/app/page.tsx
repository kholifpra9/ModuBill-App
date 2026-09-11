import Navbar from '@/components/layout/navbar';
import Hero from '@/components/layout/hero';
import UseCases from '@/components/layout/usecases';
import LiveDemo from '@/components/layout/livedemo';
import Features from '@/components/layout/features';
import Footer from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <UseCases />
        <LiveDemo />
        <Features />
      </main>
      <Footer />
    </div>
  );
}