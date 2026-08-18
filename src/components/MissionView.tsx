/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Eye, 
  Compass, 
  Quote, 
  ShieldCheck, 
  Sparkles,
  Award,
  GraduationCap
} from "lucide-react";
import { motion } from "motion/react";

export default function MissionView() {
  const animations = {
    card: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HEADER HERO */}
      <section className="relative bg-gradient-to-r from-brand-oxblood via-brand-oxblood-hover to-black py-20 text-white text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative mx-auto max-w-4xl px-4 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-brand-yellow uppercase">
            Our Purpose & Destiny
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-display">
            Mission & Vision
          </h1>
          <div className="h-1.5 w-24 rounded-full bg-brand-yellow mx-auto" />
          <p className="text-slate-300 max-w-2xl mx-auto text-base">
            Guiding students on path of discipline, standard academics, and active faith to become shining lights in global society.
          </p>
        </div>
      </section>

      {/* MISSION, VISION, & MOTTO PANELS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Dual Grid */}
        <div className="grid gap-12 md:grid-cols-2">
          {/* Mission Card */}
          <motion.div 
            initial={animations.card.initial}
            animate={animations.card.animate}
            transition={animations.card.transition}
            className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl space-y-6"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green">
              <Compass className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-slate-900 font-display">Our Mission</h2>
              <div className="h-1 w-16 bg-brand-yellow" />
              <p className="text-base text-slate-600 leading-relaxed pt-2">
                Provide quality education that develops intellectual, moral, spiritual, and social excellence.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                By investing in high-fidelity tutoring, physical assets, and moral mentoring, we ensure our students graduate with standard capacities ready to conquer modern tertiary programs.
              </p>
            </div>
          </motion.div>

          {/* Vision Card */}
          <motion.div 
            initial={animations.card.initial}
            animate={animations.card.animate}
            transition={{ ...animations.card.transition, delay: 0.1 }}
            className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl space-y-6"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-oxblood/15 text-brand-oxblood">
              <Eye className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-slate-900 font-display">Our Vision</h2>
              <div className="h-1 w-16 bg-brand-yellow" />
              <p className="text-base text-slate-600 leading-relaxed pt-2">
                To become a leading secondary school recognized for academic excellence, innovation, and character formation.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                We aspire to set the golden standard for secondary education in West Africa, integrating digital curriculum assets with deeply respected traditional morality and leadership training.
              </p>
            </div>
          </motion.div>
        </div>

        {/* MOTTO PANEL PROMINENT */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl bg-gradient-to-br from-brand-oxblood to-brand-oxblood-hover p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl border border-white/10"
        >
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 text-white/5 pointer-events-none">
            <Quote className="h-64 w-64" />
          </div>
          
          <div className="relative max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-yellow">
              The Guiding Light
            </span>
            <p className="text-3xl font-extrabold md:text-4xl lg:text-5xl tracking-tight leading-tight font-display text-white">
              "Moral and Academics(MALU CHUKWU, MALU AKWUKO)"
            </p>
            <div className="h-1 w-20 bg-brand-yellow mx-auto" />
            <p className="text-sm text-slate-300 font-mono tracking-wider uppercase">
              The official school motto of Holy Ghost Academy
            </p>
            <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
              This statement is woven into our daily prayers, uniform badges, assembly messages, and educational operations. It acts as our promise to our parents and our country.
            </p>
          </div>
        </motion.div>
      </section>

      {/* CORE PHILOSOPHICAL CARD STACKS */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 font-display">The Trinity of Formation</h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Our Educational Approach</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-md space-y-3">
              <div className="h-10 w-10 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center font-bold font-mono">1</div>
              <h4 className="text-lg font-bold text-slate-950 font-display">Intellectual Rigor</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fostered through a robust syllabus, expert faculty, homework tracking, physical examinations, and periodic state science championships.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-md space-y-3">
              <div className="h-10 w-10 rounded-lg bg-brand-oxblood/10 text-brand-oxblood flex items-center justify-center font-bold font-mono">2</div>
              <h4 className="text-lg font-bold text-slate-950 font-display">Moral Rectitude</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nurtured inside structured dormitories, guided by Pentecostal counselors, assembly announcements, and self-restraint drills.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-md space-y-3">
              <div className="h-10 w-10 rounded-lg bg-brand-yellow/15 text-brand-oxblood flex items-center justify-center font-bold font-mono">3</div>
              <h4 className="text-lg font-bold text-slate-950 font-display">Active Faith</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cultivated through daily devotion, church service, spiritual mentorship, community assistance projects, and scriptural meditations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
