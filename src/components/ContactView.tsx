/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  CheckCircle2,
  AlertCircle,
  MessageCircle
} from "lucide-react";
import { SchoolSocials } from "../types";
import { getSchoolSocials, addMessage } from "../lib/db";

export default function ContactView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [socials, setSocials] = useState<SchoolSocials>({
    facebook: "#",
    twitter: "#",
    instagram: "#",
    linkedin: "#",
    whatsapp: ""
  });

  useEffect(() => {
    getSchoolSocials()
      .then(data => setSocials(data))
      .catch(err => console.error("Error loading school socials:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setErrorMsg("Please fill in all required fields (Name, Email, Message).");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await addMessage({ 
        name, 
        email, 
        phone, 
        message,
        createdAt: new Date().toISOString()
      });
      setSuccessMsg("Thank you! Your message has been sent successfully.");
      
      // Open local email client to drop the message to school email holyghostacademy@gmail.com
      const mailtoUrl = `mailto:holyghostacademy@gmail.com?subject=Contact from ${encodeURIComponent(name)}&body=Name: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0APhone: ${encodeURIComponent(phone || "N/A")}%0A%0AMessage:%0A${encodeURIComponent(message)}`;
      window.location.href = mailtoUrl;

      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      setErrorMsg("Network error. Please verify your connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      title: "School Address",
      desc: ["Holy Ghost Academy Secondary School,", "Kamali Homes, Ngozika Housing Estate,", "Awka, Anambra State, Nigeria."],
      icon: MapPin,
      color: "text-brand-green"
    },
    {
      title: "Phone Contacts",
      desc: ["+234 (0) 905 414 5339", "+234 (0) 706 898 6865"],
      icon: Phone,
      color: "text-brand-oxblood"
    },
    {
      title: "Support Emails",
      desc: ["holyghostacademy@gmail.com"],
      icon: Mail,
      color: "text-brand-yellow"
    },
    {
      title: "Visiting Hours",
      desc: ["Monday – Friday: 8:00 AM – 4:00 PM", "Saturday: 9:00 AM – 1:00 PM (PTA/Admissions)"],
      icon: Clock,
      color: "text-brand-green"
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* HEADER HERO */}
      <section className="relative bg-gradient-to-r from-brand-oxblood via-brand-oxblood-hover to-black py-20 text-white text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative mx-auto max-w-4xl px-4 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-brand-yellow uppercase">
            Get In Touch
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-display">
            Contact Our School
          </h1>
          <div className="h-1.5 w-24 rounded-full bg-brand-yellow mx-auto" />
          <p className="text-slate-300 max-w-2xl mx-auto text-base">
            Have questions about admissions, academic modules, fees, boarding logistics, or activities? Our desk is always ready to assist you.
          </p>
        </div>
      </section>

      {/* CORE CONTACT LAYOUT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-12">
        
        {/* Contact Info and Details (5/12 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-green">
              Direct Communication
            </span>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Administrative Contacts</h2>
            <div className="h-1 w-16 bg-brand-yellow" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {contactInfo.map((info, idx) => (
              <div key={idx} className="flex gap-4 rounded-xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md transition duration-300">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 ${info.color}`}>
                  <info.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 font-display">{info.title}</h3>
                  {info.desc.map((line, lIdx) => (
                    <p key={lIdx} className="text-xs text-slate-500 font-display leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Social connections */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">Connect on Social Media</h4>
            <div className="flex gap-3">
              {socials.facebook && socials.facebook !== "#" && (
                <a 
                  href={socials.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="Facebook"
                  className="h-9 w-9 rounded-lg border border-slate-200 hover:border-brand-green hover:text-brand-green text-slate-500 flex items-center justify-center transition-all bg-white shadow-sm"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {socials.twitter && socials.twitter !== "#" && (
                <a 
                  href={socials.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="Twitter"
                  className="h-9 w-9 rounded-lg border border-slate-200 hover:border-brand-green hover:text-brand-green text-slate-500 flex items-center justify-center transition-all bg-white shadow-sm"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {socials.instagram && socials.instagram !== "#" && (
                <a 
                  href={socials.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="Instagram"
                  className="h-9 w-9 rounded-lg border border-slate-200 hover:border-brand-green hover:text-brand-green text-slate-500 flex items-center justify-center transition-all bg-white shadow-sm"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {socials.linkedin && socials.linkedin !== "#" && (
                <a 
                  href={socials.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="LinkedIn"
                  className="h-9 w-9 rounded-lg border border-slate-200 hover:border-brand-green hover:text-brand-green text-slate-500 flex items-center justify-center transition-all bg-white shadow-sm"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {socials.whatsapp && (
                <a 
                  href={socials.whatsapp.startsWith("http") ? socials.whatsapp : `https://wa.me/${socials.whatsapp.replace(/\D/g, "")}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="WhatsApp"
                  className="h-9 w-9 rounded-lg border border-slate-200 hover:border-[#25D366] hover:text-[#25D366] text-slate-500 flex items-center justify-center transition-all bg-white shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Contact Message Form (7/12 cols) */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 font-display">Send Us A Message</h3>
            <p className="text-xs text-slate-400">Fill in the form fields below and we'll reply within 24 working hours.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Forster Anarado"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green bg-slate-50/50"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. contact@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green bg-slate-50/50"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="e.g. +234 803 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green bg-slate-50/50"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Message / Enquiry *</label>
              <textarea
                rows={5}
                placeholder="How can we assist you with admissions or administrative reports?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green bg-slate-50/50 resize-y"
                required
              />
            </div>

            {/* FEEDBACK TRIGGERS */}
            {successMsg && (
              <div className="rounded-lg border border-green-100 bg-green-50 p-3.5 flex items-start gap-2.5 text-xs text-green-800">
                <CheckCircle2 className="h-4.5 w-4.5 text-green-600 shrink-0 mt-0.5" />
                <p>{successMsg}</p>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3.5 flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Submit Control */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-green py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md hover:bg-brand-green-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Delivering enquiry..." : "Send Message"}
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      {/* GOOGLE MAPS INTEGRATION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl h-[400px] bg-slate-100 relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15858.948259620023!2d7.065546944520979!3d6.232499933519198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m3!1d2000!2d7.0700000!3d6.2300000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng"
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            title="Holy Ghost Academy Awka Map Location"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
}
