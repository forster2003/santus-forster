/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Image as ImageIcon, 
  Play, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Grid
} from "lucide-react";
import { GalleryItem } from "../types";
import { getGallery } from "../lib/db";

export default function GalleryView() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaType, setMediaType] = useState<'all' | 'image' | 'video'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function fetchGallery() {
      try {
        const data = await getGallery();
        setGallery(data);
      } catch (error) {
        console.error("Failed to fetch gallery media:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'activities', label: 'School Activities' },
    { value: 'sports', label: 'Sports' },
    { value: 'academics', label: 'Academics' },
    { value: 'graduation', label: 'Graduation' },
    { value: 'cultural', label: 'Cultural Events' },
    { value: 'projects', label: 'Projects' }
  ];

  // Filtering media
  const filteredMedia = gallery.filter((item) => {
    const matchesType = mediaType === 'all' || item.type === mediaType;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesType && matchesCategory && matchesSearch;
  });

  // Pagination slicing
  const totalItems = filteredMedia.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedMedia = filteredMedia.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle page resets
  useEffect(() => {
    setCurrentPage(1);
  }, [mediaType, categoryFilter, searchQuery]);

  // Lightbox controls
  const openLightbox = (index: number) => {
    // Find absolute position in overall filteredMedia
    const absoluteIndex = filteredMedia.findIndex(item => item.id === paginatedMedia[index].id);
    if (absoluteIndex !== -1) {
      setLightboxIndex(absoluteIndex);
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightbox = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null && filteredMedia.length > 0) {
      setLightboxIndex((prev) => (prev! + 1) % filteredMedia.length);
    }
  };

  const prevLightbox = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null && filteredMedia.length > 0) {
      setLightboxIndex((prev) => (prev! - 1 + filteredMedia.length) % filteredMedia.length);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HEADER HERO */}
      <section className="relative bg-gradient-to-r from-brand-oxblood via-brand-oxblood-hover to-black py-20 text-white text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative mx-auto max-w-4xl px-4 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-brand-yellow uppercase">
            Visual Memories
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-display">
            Multimedia School Gallery
          </h1>
          <div className="h-1.5 w-24 rounded-full bg-brand-yellow mx-auto" />
          <p className="text-slate-300 max-w-2xl mx-auto text-base">
            Glimpses into the life of Holy Ghost Academy—celebrating academic triumphs, athletic feats, cultural displays, and development.
          </p>
        </div>
      </section>

      {/* FILTER & CONTROL BAR */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-md">
          
          {/* Row 1: Sub-tabs and Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Media Type Sub-Tabs */}
            <div className="flex bg-slate-100 rounded-lg p-1 max-w-xs w-full">
              <button
                onClick={() => setMediaType('all')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${mediaType === 'all' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                All Media
              </button>
              <button
                onClick={() => setMediaType('image')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${mediaType === 'image' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                Photos
              </button>
              <button
                onClick={() => setMediaType('video')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${mediaType === 'video' ? "bg-white text-brand-green shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                Videos
              </button>
            </div>

            {/* Search Media */}
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search gallery files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent bg-slate-50/50"
              />
            </div>
          </div>

          {/* Row 2: Category Filter Horizontal List */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-50 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`px-4 py-2 text-xs font-medium rounded-full transition-colors shrink-0 ${categoryFilter === cat.value ? "bg-brand-oxblood text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* MEDIA GRID DISPLAY */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse bg-slate-100 h-64 rounded-xl border" />
            ))}
          </div>
        ) : paginatedMedia.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-md">
            <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-sm">No photos or videos matched your current filter criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedMedia.map((media, index) => (
              <div 
                key={media.id} 
                className="group relative rounded-xl bg-white border border-slate-100 shadow-md overflow-hidden aspect-[4/3] cursor-pointer shadow-slate-50 hover:shadow-2xl hover:-translate-y-1 transition duration-300"
                onClick={() => openLightbox(index)}
              >
                {/* Photo / Video thumbnail */}
                {media.type === "image" ? (
                  <img 
                    src={media.url} 
                    alt={media.title} 
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-102"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="relative h-full w-full bg-slate-900">
                    {/* YouTube thumbnail extractor */}
                    <img 
                      src={media.url.includes("embed") ? `https://img.youtube.com/vi/${media.url.split("/").pop()?.split("?")[0]}/0.jpg` : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"} 
                      alt={media.title} 
                      className="h-full w-full object-cover opacity-65"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-14 w-14 rounded-full bg-brand-oxblood text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300">
                        <Play className="h-6 w-6 ml-1" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Dark Hover Banner Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end space-y-1">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-brand-yellow font-mono">
                    {categories.find(c => c.value === media.category)?.label || media.category}
                  </span>
                  <h4 className="text-sm font-bold line-clamp-1 font-display">{media.title}</h4>
                  {media.description && <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{media.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-xs font-mono font-semibold text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </section>

      {/* FULLSCREEN LIGHTBOX MODE */}
      {lightboxIndex !== null && filteredMedia[lightboxIndex] && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between p-4 sm:p-8 select-none"
          onClick={closeLightbox}
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-brand-yellow">
                {filteredMedia[lightboxIndex].type === "image" ? "Photo Preview" : "Video Embed"}
              </span>
              <h3 className="text-sm font-bold font-display leading-tight">{filteredMedia[lightboxIndex].title}</h3>
            </div>
            <button 
              onClick={closeLightbox}
              className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Active Viewer */}
          <div className="flex-1 flex items-center justify-between gap-4 my-6">
            {/* Prev Trigger */}
            <button 
              onClick={prevLightbox}
              className="h-12 w-12 hidden sm:flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Main Stage */}
            <div 
              className="flex-1 flex items-center justify-center max-h-[60vh] md:max-h-[70vh] relative max-w-4xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {filteredMedia[lightboxIndex].type === "image" ? (
                <img 
                  src={filteredMedia[lightboxIndex].url} 
                  alt={filteredMedia[lightboxIndex].title} 
                  className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-black shadow-2xl">
                  <iframe 
                    src={filteredMedia[lightboxIndex].url} 
                    title={filteredMedia[lightboxIndex].title}
                    className="w-full h-full border-0" 
                    allowFullScreen
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            {/* Next Trigger */}
            <button 
              onClick={nextLightbox}
              className="h-12 w-12 hidden sm:flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Footer Metadata */}
          <div className="text-white text-center space-y-2 border-t border-white/10 pt-4 max-w-2xl mx-auto">
            {filteredMedia[lightboxIndex].description && (
              <p className="text-xs text-slate-300 leading-relaxed italic">{filteredMedia[lightboxIndex].description}</p>
            )}
            <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {filteredMedia[lightboxIndex].createdAt}
              </span>
              <span>•</span>
              <span className="uppercase">{filteredMedia[lightboxIndex].category} Collection</span>
              <span>•</span>
              <span>Item {lightboxIndex + 1} of {filteredMedia.length}</span>
            </div>
            
            {/* Small mobile swiper triggers */}
            <div className="flex sm:hidden items-center justify-center gap-6 pt-2">
              <button 
                onClick={prevLightbox} 
                className="px-4 py-2 bg-white/5 rounded text-xs font-semibold"
              >
                Previous
              </button>
              <button 
                onClick={nextLightbox} 
                className="px-4 py-2 bg-white/5 rounded text-xs font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
