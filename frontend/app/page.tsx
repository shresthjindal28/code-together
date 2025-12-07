import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import { Hero } from "@/components/Hero";
import Navbar from "@/components/navbar";
import Pricing from "@/components/Pricing";
import ProductDemo from "@/components/ProductDemo";
import Testimonials from "@/components/Testimonials";
import ValueSection from "@/components/ValueSection";

const page = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <ValueSection />
      <FeaturesSection />
      <ProductDemo />
      <Testimonials />
      <Pricing />
      <CTA />
      <FAQ />
      <Footer />
    </div>
  )
}

export default page
