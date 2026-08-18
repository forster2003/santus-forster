/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Wrench, 
  CalendarDays, 
  Coins, 
  CheckCircle2, 
  Hourglass,
  ArrowUpRight
} from "lucide-react";
import { ProjectItem } from "../types";
import { getProjects } from "../lib/db";

export default function ProjectsView() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects list:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* HEADER HERO */}
      <section className="relative bg-gradient-to-r from-brand-oxblood via-brand-oxblood-hover to-black py-20 text-white text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative mx-auto max-w-4xl px-4 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-brand-yellow uppercase">
            School Advancements
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-display">
            Ongoing Campus Projects
          </h1>
          <div className="h-1.5 w-24 rounded-full bg-brand-yellow mx-auto" />
          <p className="text-slate-300 max-w-2xl mx-auto text-base">
            Holy Ghost Academy Awka continually modernizes its learning setups to maintain gold standard laboratories, learning resources, and sports arenas.
          </p>
        </div>
      </section>

      {/* PROJECTS GRID LIST */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="animate-pulse bg-white h-72 rounded-2xl border border-slate-100" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200">
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-sm">No ongoing campus development projects registered at this time. Check back later.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {projects.map((proj) => {
              const isCompleted = proj.progressPercentage >= 100;
              return (
                <div 
                  key={proj.id} 
                  className="rounded-2xl bg-white border border-slate-100 shadow-md overflow-hidden flex flex-col md:flex-row shadow-slate-100 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Photo Cover */}
                  <div className="md:w-2/5 relative min-h-[220px] bg-slate-100">
                    <img 
                      src={proj.imageUrl || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800"} 
                      alt={proj.title} 
                      className="h-full w-full object-cover absolute inset-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white ${isCompleted ? "bg-brand-green shadow-md shadow-brand-green/20" : "bg-brand-yellow text-brand-oxblood shadow-md"}`}>
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Hourglass className="h-3 w-3 animate-spin" />
                            Active Progress
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className="md:w-3/5 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 font-display line-clamp-2">{proj.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{proj.description}</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-50">
                      {/* Budget / Dates info row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Funding Budget</span>
                          <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                            <Coins className="h-4 w-4 text-brand-green" />
                            <span>{proj.budget}</span>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Target Date</span>
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs">
                            <CalendarDays className="h-4 w-4 text-brand-oxblood" />
                            <span>{proj.completionDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Milestone Completed</span>
                          <span className={isCompleted ? "text-brand-green font-bold" : "text-brand-oxblood"}>{proj.progressPercentage}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${isCompleted ? "from-brand-green to-brand-green" : "from-brand-green via-brand-yellow to-brand-oxblood"}`}
                            style={{ width: `${proj.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* DONATION INSPIRATIONAL SECTION */}
      <section className="mx-auto max-w-5xl px-4">
        <div className="rounded-2xl border border-brand-yellow/30 bg-brand-yellow/5 p-8 text-center space-y-4 shadow-md max-w-4xl mx-auto">
          <Wrench className="h-10 w-10 text-brand-yellow mx-auto" />
          <h3 className="text-2xl font-bold text-brand-oxblood font-display">Alumni & PTA Project Sponsorship</h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            These campus upgrades are collectively championed by the Holy Ghost Academy Parent-Teacher Association (PTA) alongside our distinguished Alumni network. For partnerships, sponsorships, or direct fund verification reports, kindly contact the school's bursary.
          </p>
        </div>
      </section>
    </div>
  );
}
