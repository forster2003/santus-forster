/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Lightbulb, 
  HeartHandshake, 
  Award, 
  BookMarked,
  Sparkles,
  Users,
  Compass
} from "lucide-react";
import { motion } from "motion/react";
import { StaffMember } from "../types";
import { getStaff } from "../lib/db";

export default function AboutView() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStaff()
      .then(data => {
        setStaff(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching staff:", err);
        setLoading(false);
      });
  }, []);

  const coreValues = [
    {
      title: "Excellence",
      desc: "Striving for the highest levels of scholastic, practical, and moral achievements in all circumstances.",
      icon: Award,
      color: "bg-brand-green/10 text-brand-green border-brand-green/20"
    },
    {
      title: "Integrity",
      desc: "Upholding complete honesty, moral strength, and transparent accountability in actions and speech.",
      icon: ShieldAlert,
      color: "bg-brand-oxblood/10 text-brand-oxblood border-brand-oxblood/20"
    },
    {
      title: "Discipline",
      desc: "Cultivating self-control, promptness, structured habits, and profound respect for order and guidance.",
      icon: Compass,
      color: "bg-brand-yellow/10 text-brand-oxblood border-brand-yellow/30"
    },
    {
      title: "Service",
      desc: "Selflessly contributing talents and efforts to enrich the local community, nation, and global society.",
      icon: HeartHandshake,
      color: "bg-brand-green/10 text-brand-green border-brand-green/20"
    },
    {
      title: "Leadership",
      desc: "Inspiring others by showing standard discipline, visionary foresight, humility, and moral responsibility.",
      icon: Sparkles,
      color: "bg-brand-oxblood/10 text-brand-oxblood border-brand-oxblood/20"
    }
  ];

  const managementTeam = [
    {
      name: "Engr. ThankGod Ndibe",
      role: "Manager",
      qual: "B.Engr, M.Engr.",
      photo: "https://i.ibb.co/pj9SBTbc/cccg.jpg",
      bio: "A visionary academic leader and engineering professional dedicated to fostering technical, moral, and scholastic excellence."
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* HEADER HERO */}
      <section className="relative bg-gradient-to-r from-brand-oxblood via-brand-oxblood-hover to-black py-20 text-white text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative mx-auto max-w-4xl px-4 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-brand-yellow uppercase">
            Learn Our Story
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-display">
            About Holy Ghost Academy
          </h1>
          <div className="h-1.5 w-24 rounded-full bg-brand-yellow mx-auto" />
          <p className="text-slate-300 max-w-2xl mx-auto text-base">
            Holy Ghost Academy Awka is a premium Pentecostal secondary institution focused on standard academics, character formation, and technological innovation.
          </p>
        </div>
      </section>

      {/* HISTORY & PHILOSOPHY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-green">
              Our Foundations
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-brand-oxblood font-display">
              Our Noble History
            </h2>
          </div>
          <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
            <p>
              Holy Ghost Academy Secondary School, Kamali Homes Awka was founded in September 2001 as a premier Pentecostal institution. It was established out of a deep collective yearning for an elite educational institution that would restore the premium standards of old missionary education—combining outstanding scholastic pursuit with unflinching character rectitude and strong faith in God.
            </p>
            <p>
              Nestled inside the serene, elite environment of Kamali Homes within Ngozika Housing Estate, Awka, the school grew rapidly from an initial cohort of just 50 students into a leading multi-house campus accommodating over 800 day and boarding boys and girls today.
            </p>
            <p>
              Over the past two decades, our school has consistently graduated leaders who excel globally. We continue to upgrade our systems, computer rooms, and laboratories to match modern learning demands, keeping our founders' vision alive.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green">
            <BookMarked className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-900 font-display">Educational Philosophy</h3>
            <div className="h-1 w-16 bg-brand-yellow" />
            <p className="text-sm text-slate-600 leading-relaxed">
              We operate on the fundamental philosophy of "Integral Education"—the complete development of the human persona. We believe that true education does not simply feed the intellect; it must cultivate the soul, inspire positive morals, and train the physical body. 
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every student is created unique by God. Our teaching strategies are designed to uncover and polish these individual talents within a secure, supportive, and disciplined environment.
            </p>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="bg-slate-100 py-16 shadow-inner">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest text-brand-green uppercase">
              How We Behave
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-brand-oxblood font-display">
              Our Five Core Values
            </h2>
            <div className="h-1 w-20 bg-brand-yellow mx-auto" />
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              These pillars form the moral compass of every administrator, teacher, and student at Holy Ghost Academy.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {coreValues.map((val, idx) => (
              <div 
                key={idx} 
                className="rounded-xl bg-white border border-slate-100 p-6 shadow-md hover:shadow-xl transition duration-300 space-y-4 flex flex-col items-center text-center justify-between"
              >
                <div className={`p-4 rounded-full border ${val.color}`}>
                  <val.icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 font-display">{val.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MANAGEMENT TEAM */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-green">
            Institutional Leadership
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-brand-oxblood font-display">
            The School Management Team
          </h2>
          <div className="h-1 w-20 bg-brand-yellow mx-auto" />
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Meet the experienced educators leading Holy Ghost Academy's administrative and spiritual vision.
          </p>
        </div>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {managementTeam.map((member, idx) => (
            <div key={idx} className="group overflow-hidden rounded-xl bg-white border border-slate-100 shadow-lg hover:shadow-2xl transition duration-300">
              <div className="relative h-64 bg-slate-50 overflow-hidden">
                <img 
                  src={member.photo} 
                  alt={member.name} 
                  className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end text-white">
                  <p className="text-xs italic leading-relaxed text-slate-200">{member.bio}</p>
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-display line-clamp-1">{member.name}</h3>
                <p className="text-xs font-semibold text-brand-green uppercase tracking-wider">{member.role}</p>
                <p className="text-[10px] font-mono text-slate-400 border-t border-slate-50 pt-2">{member.qual}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EXCELLENT STAFF & EDUCATORS */}
      {staff.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 pt-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-green">
              Our Professional Faculty
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-brand-oxblood font-display">
              Meet Our Elite Staff & Instructors
            </h2>
            <div className="h-1 w-20 bg-brand-yellow mx-auto" />
            <p className="text-slate-500 max-w-md mx-auto text-sm">
              The dedicated minds crafting future global leaders through standard tutoring and guidance.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {staff.map((member) => (
              <div 
                key={member.id} 
                className="group relative bg-white border border-slate-100 p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center justify-between"
              >
                {/* Photo container */}
                <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-slate-100 shadow-inner mb-4 bg-slate-50 shrink-0">
                  {member.imageUrl ? (
                    <img 
                      src={member.imageUrl} 
                      alt={member.name} 
                      className="h-full w-full object-cover transition duration-350 group-hover:scale-105" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-brand-green/5 text-brand-green">
                      <Users className="h-12 w-12 opacity-30" />
                    </div>
                  )}
                </div>

                {/* Info details */}
                <div className="space-y-1.5 w-full">
                  <h3 className="text-sm font-bold text-slate-900 font-display line-clamp-1">{member.name}</h3>
                  <p className="text-xs font-semibold text-brand-green tracking-wide line-clamp-1">{member.role}</p>
                  <span className="inline-block text-[9px] font-mono font-extrabold uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full mt-2">
                    {member.department || "General"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
