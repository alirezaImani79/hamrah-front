import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import AiFeatures from "@/components/AiFeatures";
import Benefits from "@/components/Benefits";
import Audience from "@/components/Audience";
import VolunteerNote from "@/components/VolunteerNote";
import Faq from "@/components/Faq";
import Waitlist from "@/components/Waitlist";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <main className="flex flex-col">
        <HowItWorks />
        <AiFeatures />
        <Benefits />
        <Audience />
        <VolunteerNote />
        <Faq />
        <Waitlist />
      </main>
      <Footer />
    </>
  );
}
