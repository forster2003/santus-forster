/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  GraduationCap, 
  Award, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  ChevronRight, 
  Volume2,
  ShieldCheck,
  FlameKindling,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NewsPost, ProjectItem, GalleryItem } from "../types";
import { getNews, getProjects, getGallery, getSchoolStats } from "../lib/db";

interface HomeViewProps {
  onNavigate: (page: string) => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [schoolStats, setSchoolStats] = useState({
    enrolledStudents: "850+",
    expertEducators: "45+",
    alumniGraduates: "2,400+",
    nationalAwards: "18+"
  });
  const [loading, setLoading] = useState(true);

  // Fallback slider images if API is empty
  const defaultSlides = [
    {
      url: "https://i.ibb.co/Fkw6xsct/hga-hs001.jpg",
      title: "Nurturing Leaders of Tomorrow",
      subtitle: "Moral and Academics (MALU CHUKWU, MALU AKWUKO)"
    },
    {
      url: "https://i.ibb.co/p5PJNbK/hga005.jpg",
      title: "State-of-the-Art Science Laboratories",
      subtitle: "Empowering Students through Practical Scientific Enquiry"
    },
    {
      url: "https://i.ibb.co/9kHqyL5C/hga003.jpg",
      title: "Innovation & Digital Literacy",
      subtitle: "Leading the Way in ICT & Computer Programming Education"
    },
    {
      url: "https://i.ibb.co/cSwL02br/hga002.jpg",
      title: "Premium Facilities & Serene Environment",
      subtitle: "A Conducive and Secure Atmosphere for Boarding & Day Scholars"
    },
    {
      url: "https://i.ibb.co/S7KjD67V/hga001.jpg",
      title: "Character Rectitude & Moral Standing",
      subtitle: "Fostering robust spiritual reflections and disciplined habits"
    }
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const [newsList, projectsList, galleryList, statsData] = await Promise.all([
          getNews(),
          getProjects(),
          getGallery(),
          getSchoolStats()
        ]);
        setNews(newsList.slice(0, 3));
        setProjects(projectsList.slice(0, 3));
        setGallery(galleryList);
        setSchoolStats(statsData);
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Slide rotation logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % defaultSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Animated counters statistics data
  const stats = [
    { label: "Enrolled Students", value: schoolStats.enrolledStudents || "850+", icon: Users, color: "text-brand-green" },
    { label: "Expert Educators", value: schoolStats.expertEducators || "45+", icon: GraduationCap, color: "text-brand-oxblood" },
    { label: "Alumni Graduates", value: schoolStats.alumniGraduates || "2,400+", icon: BookOpen, color: "text-brand-yellow" },
    { label: "National Awards", value: schoolStats.nationalAwards || "18+", icon: Award, color: "text-brand-green" }
  ];

  // Filter admin-uploaded gallery images for slider if available
  const sliderImages = gallery.filter(item => item.type === "image" && item.category !== "projects").slice(0, 3);
  const slidesToUse = sliderImages.length > 0 
    ? sliderImages.map(item => ({ url: item.url, title: item.title, subtitle: item.description || "Holy Ghost Academy Secondary School" }))
    : defaultSlides;

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION WITH IMAGE SLIDER */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-black text-white">
        {/* Background Slides */}
        <div className="absolute inset-0 h-full w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.75)), url(${slidesToUse[currentSlide]?.url})` }}
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
        </div>

        {/* Floating Accent Crest / School Identity */}
        <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 md:px-16 lg:px-24">
          <div className="max-w-4xl space-y-6">
            {/* School Crest Emblem */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md border border-white/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green border-2 border-brand-yellow overflow-hidden">
                <img 
                  src="https://i.ibb.co/HTP5dHHD/Whats-App-Image-2026-06-30-at-10-02-49-AM.jpg" 
                  alt="Holy Ghost Academy Logo" 
                  className="h-full w-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-yellow font-mono">
                Holy Ghost Academy, Kamali Homes Awka
              </span>
            </motion.div>

            {/* School Logo & Title */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                HOLY GHOST ACADEMY
              </h1>
              <p className="text-xl font-medium tracking-wide text-brand-yellow sm:text-2xl md:text-3xl font-display">
                SECONDARY SCHOOL, KAMALI HOMES AWKA
              </p>
            </motion.div>

            {/* Active Slogan Slider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="min-h-[60px]"
            >
              <h2 className="text-lg font-light text-slate-200 sm:text-xl md:text-2xl max-w-2xl leading-relaxed">
                {slidesToUse[currentSlide]?.title}: <span className="font-semibold text-white">{slidesToUse[currentSlide]?.subtitle}</span>
              </h2>
            </motion.div>

            {/* Slogan */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-mono text-xs sm:text-sm text-slate-300 tracking-widest uppercase flex items-center gap-2 border-l-2 border-brand-green pl-3"
            >
              <Sparkles className="h-4 w-4 text-brand-yellow animate-pulse" />
              School Motto: "Moral and Academics(MALU CHUKWU, MALU AKWUKO)"
            </motion.p>

            {/* CTA Action Controls */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <button
                onClick={() => onNavigate("result-sheet")}
                id="hero-resultsheet-btn"
                className="rounded-lg bg-brand-oxblood border-2 border-brand-yellow px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-brand-oxblood-hover hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>Check Result Sheet</span>
                <ChevronRight className="h-4 w-4 text-brand-yellow" />
              </button>
              <button
                onClick={() => window.open("https://wa.me/2349054145339?text=Hello%20Holy%20Ghost%20Academy%20Awka,%20I%20am%20interested%20in%20enrolling%20a%20student%20into%20your%20school.", "_blank")}
                id="hero-enroll-btn"
                className="group flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-green/30 transition-all duration-300 hover:bg-[#128C7E] hover:scale-105 active:scale-95"
              >
                Enroll Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => onNavigate("gallery")}
                id="hero-gallery-btn"
                className="rounded-lg border-2 border-white bg-white/5 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-brand-oxblood hover:scale-105 active:scale-95"
              >
                View Gallery
              </button>
              <button
                onClick={() => onNavigate("about")}
                id="hero-about-btn"
                className="rounded-lg border border-white/20 bg-black/40 px-6 py-3.5 text-base font-semibold text-slate-200 transition-all duration-300 hover:bg-black/60 hover:text-white"
              >
                Learn More
              </button>
            </motion.div>
          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3 z-10">
          {slidesToUse.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-500 ${currentSlide === idx ? "w-8 bg-brand-yellow" : "w-2.5 bg-white/40 hover:bg-white/70"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* FOUNDER'S VISIONARY MESSAGE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Vision / Welcome Text on Left */}
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-green flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-yellow animate-ping" />
                The Desk of the Founder
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-brand-oxblood sm:text-4xl font-display">
                Raising Academically Sound & Spiritually Vibrant Leaders
              </h2>
              <div className="h-1.5 w-24 rounded-full bg-brand-yellow" />
            </div>

            <div className="space-y-4 text-base leading-relaxed text-slate-600 font-sans">
              <p className="font-semibold text-slate-800">
                "Our mission is to establish a supreme sanctuary of learning, where academic brilliance and deep moral values coalesce to raise global champions."
              </p>
              <p>
                Holy Ghost Academy was founded on a vision inspired by God to bridge the gap between rigorous scholastic achievement and solid Christian values. We believe that true education does not stop at mental illumination; it must encompass spiritual rectitude and character training. This is why our guiding motto remains <strong>"Moral and Academics" (Malu Chukwu, Malu Akwuko)</strong>.
              </p>
              <p>
                As the Founder of the Holy Ghost Academy Group of Schools, my joy is to see our graduates stand out as beacons of light in various professional, scientific, and leadership arenas both in Nigeria and globally. We invite you to entrust your children and wards to us, and partner with us in shaping a magnificent future.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-mono tracking-widest text-slate-400 uppercase">Founder's Blessing</p>
                <p className="text-sm font-semibold text-brand-green">"May the light of God guide your child's learning journey."</p>
              </div>
              <div className="shrink-0 font-mono text-[11px] bg-brand-green/5 border border-brand-green/10 text-brand-green px-3.5 py-1.5 rounded-full uppercase tracking-wider font-semibold">
                ★ Spiritus Sanctus
              </div>
            </div>
          </div>

          {/* Founder Image Framed elegantly on Right */}
          <div className="lg:col-span-5 relative group order-1 lg:order-2">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-brand-green to-brand-yellow opacity-35 blur-lg transition duration-1000 group-hover:opacity-50" />
            <div className="relative overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 shadow-xl">
              <img
                src="https://i.ibb.co/DPkn77Md/hg16.jpg"
                alt="Late Archbishop Dr. Ephraim Ndife"
                className="h-[480px] w-full object-cover object-center transition duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 text-white text-center">
                <p className="text-xl font-bold font-display text-brand-yellow">Late Archbishop Dr. Ephraim Ndife</p>
                <p className="text-xs font-mono tracking-widest text-slate-300 uppercase mt-1">Founder / President</p>
                <p className="text-xs text-slate-400 font-sans italic mt-0.5">Holy Ghost Academy Group of Schools</p>
              </div>
            </div>
            {/* Stamp of Vision */}
            <div className="absolute -top-4 -right-4 lg:-right-4 bg-brand-yellow text-brand-oxblood h-16 w-16 rounded-full flex flex-col items-center justify-center font-bold text-[10px] font-mono shadow-lg border border-white transform -rotate-12 uppercase z-10">
              <span>VISION</span>
              <span>BUILDER</span>
            </div>
          </div>
        </div>
      </section>

      {/* MANAGER'S WELCOME */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Manager Image Framed elegantly */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-brand-oxblood to-brand-green opacity-30 blur-lg transition duration-1000 group-hover:opacity-45" />
            <div className="relative overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 shadow-xl">
              <img
                src="https://i.ibb.co/pj9SBTbc/cccg.jpg"
                alt="School Manager"
                className="h-[450px] w-full object-cover object-top transition duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 text-white text-center">
                <p className="text-xl font-bold font-display text-brand-yellow">Engr. ThankGod Ndibe</p>
                <p className="text-xs font-mono tracking-widest text-slate-300 uppercase mt-1">Manager</p>
                <p className="text-xs text-slate-400 font-sans italic mt-0.5">B.Engr, M.Engr.</p>
              </div>
            </div>
            {/* Visual credential stamp */}
            <div className="absolute -top-4 -right-4 bg-brand-yellow text-brand-oxblood h-16 w-16 rounded-full flex flex-col items-center justify-center font-bold text-[10px] font-mono shadow-lg border border-white transform rotate-12 uppercase">
              <span>HGASS</span>
              <span>EST. 2001</span>
            </div>
          </div>

          {/* Letter / Welcome Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-green">
                Welcome Message
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-brand-oxblood sm:text-4xl font-display">
                Fostering Excellence, Character, and Faith
              </h2>
              <div className="h-1.5 w-24 rounded-full bg-brand-yellow" />
            </div>

            <div className="space-y-4 text-base leading-relaxed text-slate-600 font-sans">
              <p className="font-semibold text-slate-800">
                On behalf of the staff, trustees, and students, I warmly welcome you to the official digital portal of Holy Ghost Academy Secondary School, Kamali Homes Awka.
              </p>
              <p>
                As a premium faith-based institution located in the heart of Ngozika Housing Estate, Awka, Anambra State, we are committed to providing an education that balances intellect, ethics, and spirituality. We do not just teach sciences, arts, and humanities; we mould characters, guide morals, and spark positive creative innovations.
              </p>
              <p>
                At Holy Ghost Academy, academic discipline sits comfortably alongside creative freedom. Our laboratories are state-of-the-art, our sporting activities teach discipline and fair play, and our environment provides a secure sanctuary where future national and global leaders are formed. We invite you to explore our website to check our offerings and join our community of excellence.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <div className="flex -space-x-2">
                <div className="h-10 w-10 rounded-full bg-brand-green text-white flex items-center justify-center font-bold border-2 border-white text-sm">A</div>
                <div className="h-10 w-10 rounded-full bg-brand-oxblood text-white flex items-center justify-center font-bold border-2 border-white text-sm">E</div>
                <div className="h-10 w-10 rounded-full bg-brand-yellow text-brand-oxblood flex items-center justify-center font-bold border-2 border-white text-sm">F</div>
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Trusted by 2,000+ Nigerian Families
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US - ADVANTAGES */}
      <section className="bg-gradient-to-br from-brand-oxblood via-brand-oxblood-hover to-black py-16 text-white shadow-inner">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest text-brand-yellow uppercase">
              Our Core Pillars
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl font-display text-white">
              Why Choose Holy Ghost Academy?
            </h2>
            <div className="h-1 w-24 rounded-full bg-brand-yellow mx-auto" />
            <p className="text-slate-300 max-w-2xl mx-auto text-sm">
              We provide a balanced, world-class secondary education designed to prepare young minds for international universities and leadership.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Pillar 1 */}
            <div className="flex gap-4 rounded-xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-green text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-display">Academic Excellence</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Rigorous Nigerian national curriculum enriched with global STEM standards. Standard tutoring by top scholars.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex gap-4 rounded-xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-yellow text-brand-oxblood">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-display">Strict Moral Discipline</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Firm structure emphasizing integrity, respectful behavior, character building, responsibility, and civic duty.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex gap-4 rounded-xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-green text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-display">Modern Infrastructure</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Advanced Science Labs, premium digital ICT centre, electronic libraries, and comfortable, safe boarding facilities.
                </p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="flex gap-4 rounded-xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-yellow text-brand-oxblood">
                <Users className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-display">Qualified Educators</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Caring teachers with certified degrees, trained periodically in modern collaborative pedagogies.
                </p>
              </div>
            </div>

            {/* Pillar 5 */}
            <div className="flex gap-4 rounded-xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-green text-white">
                <FlameKindling className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-display">Faith-Based Education</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Nurturing spiritual roots, active Pentecostal moral framework, prayers, and deep Christian counseling guidelines.
                </p>
              </div>
            </div>

            {/* Pillar 6 */}
            <div className="flex gap-4 rounded-xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-yellow text-brand-oxblood">
                <Award className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-display">Sports & Culture</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Vibrant athletic programs, football clubs, visual arts, music classes, and cultural heritage festivals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS COUNT OVERVIEW */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-8 border border-slate-100 shadow-xl grid gap-8 grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center p-4 first:pt-0 last:pb-0 md:first:pt-4 md:last:pb-4">
              <div className={`mb-3 rounded-full bg-slate-50 p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-3xl font-extrabold text-slate-900 md:text-4xl font-display">{stat.value}</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* LATEST NEWS SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-green">
              Announcements & Updates
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-oxblood font-display">
              Latest News & Events
            </h2>
          </div>
          <button
            onClick={() => onNavigate("gallery")}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:text-brand-green-hover transition-colors group"
          >
            Explore Galleries
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse space-y-4 rounded-xl bg-slate-100 h-96" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <p className="text-slate-500">No news updates available. Admin updates will display here.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <article key={item.id} className="group overflow-hidden rounded-xl bg-white border border-slate-100 shadow-md transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-4 left-4 rounded bg-brand-oxblood px-2.5 py-1 text-xs font-semibold text-white tracking-wider font-mono">
                    {item.category}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{item.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-2 group-hover:text-brand-green transition-colors font-display">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                  <div className="pt-2">
                    <button 
                      onClick={() => onNavigate("about")}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-green group-hover:text-brand-green-hover"
                    >
                      Read full article
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* FEATURED ONGOING PROJECTS */}
      <section className="bg-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest text-brand-green uppercase">
              Physical & Resource Expansion
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-oxblood sm:text-4xl font-display">
              Featured Development Projects
            </h2>
            <div className="h-1 w-24 rounded-full bg-brand-yellow mx-auto" />
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              Holy Ghost Academy is committed to non-stop structural improvement. Here are our current community-funded initiatives.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-8 md:grid-cols-2">
              {[1, 2].map(n => <div key={n} className="animate-pulse bg-white h-48 rounded-xl" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No project listings available.</div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((proj) => (
                <div key={proj.id} className="rounded-xl bg-white border border-slate-100 shadow-md p-6 space-y-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="relative h-40 rounded-lg overflow-hidden bg-slate-50">
                      <img 
                        src={proj.imageUrl || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800"} 
                        alt={proj.title} 
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 font-display line-clamp-1">{proj.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{proj.description}</p>
                  </div>
                  
                  <div className="space-y-4 pt-3 border-t border-slate-100">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono font-semibold">
                        <span className="text-slate-500">Project Budget:</span>
                        <span className="text-brand-green">{proj.budget}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Target Completion:</span>
                        <span className="text-slate-600 font-medium">{proj.completionDate}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Progress Tracker</span>
                        <span className="text-brand-oxblood">{proj.progressPercentage}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-brand-green to-brand-yellow"
                          style={{ width: `${proj.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => onNavigate("projects")}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-oxblood px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-oxblood-hover transition-colors"
            >
              View All Ongoing Projects
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-green">
            Community Voice
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-oxblood font-display">
            What Parents and Alumni Say
          </h2>
          <div className="h-1.5 w-24 rounded-full bg-brand-yellow mx-auto" />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white border border-slate-100 p-6 shadow-md space-y-4">
            <p className="text-sm italic text-slate-500 leading-relaxed">
              "Sending our two sons to Holy Ghost Academy Awka was the best decision we made. The academic rigor prepared our oldest for engineering at University of Ibadan, and the strict moral environment kept them grounded."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-green text-white font-bold flex items-center justify-center text-xs">CO</div>
              <div>
                <p className="text-sm font-bold text-slate-800">Chief Dr. Chidi Okoye</p>
                <p className="text-xs text-slate-400">Parent (SS3 and Alumnus)</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-100 p-6 shadow-md space-y-4">
            <p className="text-sm italic text-slate-500 leading-relaxed">
              "Holy Ghost Academy taught me that brilliance is nothing without discipline. The coding projects we did at the upgraded computer labs inspired me to study Computer Science, and I now work as a software engineer."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-oxblood text-white font-bold flex items-center justify-center text-xs">CI</div>
              <div>
                <p className="text-sm font-bold text-slate-800">Engr. Chioma Ibe, MSc</p>
                <p className="text-xs text-slate-400">Alumnus (Class of 2018)</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-100 p-6 shadow-md space-y-4">
            <p className="text-sm italic text-slate-500 leading-relaxed">
              "The level of pastoral care at the boarding house is extraordinary. Rev. Fathers and staff are highly supportive. My daughter's grades improved dramatically due to the mandatory supervised evening prep classes."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-yellow text-brand-oxblood font-bold flex items-center justify-center text-xs">MA</div>
              <div>
                <p className="text-sm font-bold text-slate-800">Mrs. Mary Anarado</p>
                <p className="text-xs text-slate-400">Parent (JSS2 Student)</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
