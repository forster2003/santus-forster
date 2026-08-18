/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, 
  BookOpen, 
  Binary, 
  Atom, 
  FlaskConical, 
  Activity, 
  HeartHandshake, 
  Laptop, 
  Globe2, 
  Landmark, 
  TrendingUp, 
  CalendarDays,
  Coins
} from "lucide-react";

export default function SubjectsView() {
  const [activeTab, setActiveTab] = useState<'jss' | 'ss'>('jss');
  const [searchQuery, setSearchQuery] = useState('');

  // JSS1 - JSS3 subjects data
  const jssSubjects = [
    {
      name: "Mathematics",
      desc: "Laying solid arithmetic, algebraic, and geometric foundations. Crucial for logic building.",
      icon: Binary,
      category: "Core STEM"
    },
    {
      name: "English Language",
      desc: "Developing flawless reading, grammar, creative writing, and spoken English communication.",
      icon: BookOpen,
      category: "Languages"
    },
    {
      name: "Christian Religious Studies (CRS)",
      desc: "Imparting biblical histories, spiritual moral lessons, and character guidance based on Christian principles.",
      icon: HeartHandshake,
      category: "Moral/Religious"
    },
    {
      name: "Civic Education",
      desc: "Teaching national symbols, constitutional rights, civic responsibilities, and values of patriotic citizenship.",
      icon: Landmark,
      category: "Arts/Social"
    },
    {
      name: "Agricultural Science",
      desc: "Introduction to food crop production, soil science, forestry, and modern animal husbandry practices.",
      icon: Globe2,
      category: "Vocation"
    },
    {
      name: "Physical & Health Education (PHE)",
      desc: "Promoting physical fitness, soccer sports safety, personal health hygiene, and first-aid logic.",
      icon: Activity,
      category: "Health/Sports"
    },
    {
      name: "Cultural & Creative Arts (CCA)",
      desc: "Encouraging artistic expression, Nigerian traditional music, fine arts illustration, and theatre crafting.",
      icon: Sparkles,
      category: "Creative Arts"
    },
    {
      name: "Basic Technology",
      desc: "Introduction to technical drawing, wood/metal work, building technology, and engineering principles.",
      icon: Atom,
      category: "Core STEM"
    },
    {
      name: "Basic Science",
      desc: "Exploring biology fundamentals, energy concepts, environmental conservation, and basic physics properties.",
      icon: FlaskConical,
      category: "Core STEM"
    },
    {
      name: "Business Studies",
      desc: "Fundamental introduction to bookkeeping, marketing principles, office practice, and keyboarding skills.",
      icon: Coins,
      category: "Commercial"
    },
    {
      name: "Computer Science",
      desc: "Basic computing theory, keyboard mastery, internet search ethics, and introduction to word processors.",
      icon: Laptop,
      category: "Core STEM"
    }
  ];

  // SS1 - SS3 subjects data
  const ssSubjects = [
    {
      name: "Mathematics",
      desc: "Rigorous high-school mathematics covering advanced algebra, trigonometry, statistics, and calculus.",
      icon: Binary,
      category: "Core STEM"
    },
    {
      name: "Physics",
      desc: "Mathematical inquiry into mechanics, heat transfer, optics, waves, and electromagnetism theory.",
      icon: Atom,
      category: "Core STEM"
    },
    {
      name: "Chemistry",
      desc: "Quantitative study of organic reactions, chemical properties, kinetic theory, and laboratory titrations.",
      icon: FlaskConical,
      category: "Core STEM"
    },
    {
      name: "Biology",
      desc: "Comprehensive examination of living organisms, ecology, genetics, physiology, and plant systems.",
      icon: Activity,
      category: "Core STEM"
    },
    {
      name: "Agricultural Science",
      desc: "Advanced agricultural economics, mechanized cropping, soil science, and commercial veterinary farm systems.",
      icon: Globe2,
      category: "Vocation"
    },
    {
      name: "Computer Science",
      desc: "Hands-on coding, algorithms, web development basics, database design, and computer hardware maintenance.",
      icon: Laptop,
      category: "Core STEM"
    },
    {
      name: "Literature in English",
      desc: "Critical analysis of classic prose, drama, African poetry, and deep creative literary evaluation.",
      icon: BookOpen,
      category: "Arts/Social"
    },
    {
      name: "Government",
      desc: "Fostering awareness of political structures, international relations, constitution histories, and civil service.",
      icon: Landmark,
      category: "Arts/Social"
    },
    {
      name: "Christian Religious Studies (CRS)",
      desc: "Comprehensive exploration of old/new testament scriptures, theology, and ethical moral philosophy.",
      icon: HeartHandshake,
      category: "Moral/Religious"
    },
    {
      name: "History",
      desc: "Deep dive into ancient West African kingdoms, colonial timelines, post-independence Nigeria, and global wars.",
      icon: CalendarDays,
      category: "Arts/Social"
    },
    {
      name: "Civic Education",
      desc: "Advanced citizenship concepts, civil advocacy, law enforcement, and human rights empowerment.",
      icon: Landmark,
      category: "Arts/Social"
    },
    {
      name: "Economics",
      desc: "Comprehensive study of microeconomics, inflation curves, financial markets, and national budget math.",
      icon: TrendingUp,
      category: "Commercial"
    },
    {
      name: "Commerce",
      desc: "Focusing on warehousing, transport pathways, marketing psychology, retail chains, and international trade.",
      icon: Coins,
      category: "Commercial"
    }
  ];

  const IconMap: Record<string, React.ComponentType<any>> = {
    Binary,
    BookOpen,
    HeartHandshake,
    Landmark,
    Globe2,
    Activity,
    Sparkles,
    Atom,
    FlaskConical,
    Coins,
    Laptop,
    CalendarDays,
    TrendingUp,
  };

  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch("/api/school-subjects")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSubjects(data);
        }
      })
      .catch(err => console.error("Failed to fetch subjects:", err))
      .finally(() => setLoading(false));
  }, []);

  // Pick dataset
  const currentDataset = subjects.length > 0
    ? subjects.filter(item => item.level === activeTab)
    : (activeTab === 'jss' ? jssSubjects : ssSubjects);

  // Search filter
  const filteredSubjects = currentDataset.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-16 pb-16">
      {/* HEADER HERO */}
      <section className="relative bg-gradient-to-r from-brand-oxblood via-brand-oxblood-hover to-black py-20 text-white text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative mx-auto max-w-4xl px-4 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-brand-yellow uppercase">
            Scholastic Structure
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-display">
            Academic Subjects Offered
          </h1>
          <div className="h-1.5 w-24 rounded-full bg-brand-yellow mx-auto" />
          <p className="text-slate-300 max-w-2xl mx-auto text-base">
            We offer a comprehensive curriculum designed to comply with WAEC and NECO guidelines, preparing students for premium tertiary applications.
          </p>
        </div>
      </section>

      {/* FILTER PANEL AND TABS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-md">
          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => { setActiveTab('jss'); setSearchQuery(''); }}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'jss' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              Junior Secondary (JSS1 - JSS3)
            </button>
            <button
              onClick={() => { setActiveTab('ss'); setSearchQuery(''); }}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'ss' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              Senior Secondary (SS1 - SS3)
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search academic subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent bg-slate-50/50"
            />
          </div>
        </div>

        {/* LISTINGS */}
        {filteredSubjects.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500 text-sm">No subjects matched your query "{searchQuery}". Please try another search term.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((subject, idx) => {
              let Icon = BookOpen;
              if (subject.icon) {
                if (typeof subject.icon === "string") {
                  Icon = IconMap[subject.icon] || BookOpen;
                } else {
                  Icon = subject.icon;
                }
              }
              return (
                <div 
                  key={idx} 
                  className="rounded-xl bg-white border border-slate-100 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-slate-100 text-slate-600">
                        {subject.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 font-display">{subject.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{subject.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-50 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <span>Approved Academic Syllabus:</span>
                    <span className="font-semibold text-brand-oxblood">WAEC/NECO Standard</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CURRICULUM HIGHLIGHT BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-tr from-brand-green to-brand-green-hover p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <h3 className="text-2xl font-bold font-display">Looking to register?</h3>
            <p className="text-sm text-slate-100 leading-relaxed">
              Our comprehensive subject array prepares candidates for the unified Nigerian basic education certificate (BECE), national examinations (NECO), senior WAEC, and tertiary UTME/JAMB exams with standard preparatory tracks.
            </p>
          </div>
          <button 
            onClick={() => {
              const el = document.getElementById("root");
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="rounded-lg bg-brand-yellow text-brand-oxblood px-6 py-3 text-sm font-semibold hover:bg-brand-yellow-hover shadow-md transition-colors shrink-0"
          >
            Contact Admissions
          </button>
        </div>
      </section>
    </div>
  );
}

// Sparkle utility icon fallback
function Sparkles(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
    </svg>
  );
}
