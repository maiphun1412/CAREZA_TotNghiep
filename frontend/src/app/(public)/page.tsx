"use client";

import { useEffect } from "react";
import HeroSection from "@/features/public/home/HeroSection";
import StatsSection from "@/features/public/home/StatsSection";
import StrategicPartners from "@/features/public/home/StrategicPartners";
import JobCategories from "@/features/public/home/JobCategories";
import FeaturedJobs from "@/features/public/home/FeaturedJobs";
import AICareerSection from "@/features/public/home/AICareerSection";
import RecruiterCTA from "@/features/public/home/RecruiterCTA";
import CareerBlog from "@/features/public/home/CareerBlog";
import FinalCTA from "@/features/public/home/FinalCTA";

export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-12");
          }
        });
      },
      { threshold: 0.05 }
    );

    const revealSections = document.querySelectorAll(".reveal-section");
    revealSections.forEach((section) => {
      section.classList.add("transition-all", "duration-[1000ms]", "opacity-0", "translate-y-12");
      observer.observe(section);
    });

    return () => {
      revealSections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div className="reveal-section">
        <HeroSection />
      </div>
      <div className="reveal-section">
        <StatsSection />
      </div>
      <div className="reveal-section">
        <StrategicPartners />
      </div>
      <div className="reveal-section">
        <FeaturedJobs />
      </div>
      <div className="reveal-section">
        <JobCategories />
      </div>
      <div className="reveal-section">
        <AICareerSection />
      </div>
      <div className="reveal-section">
        <CareerBlog />
      </div>
      <div className="reveal-section">
        <RecruiterCTA />
      </div>
    </div>
  );
}
