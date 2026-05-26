"use client";

import { useState, useRef } from "react";
import Map, { Source, Layer, MapRef, Marker } from "react-map-gl/mapbox";
import { Bus, Train, Car, Navigation, LocateFixed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const MAP_TABS = [
  { id: "ttc", label: "TTC", icon: Bus },
  { id: "subway", label: "Subway", icon: Train },
  { id: "train", label: "Train", icon: Train },
  { id: "rides", label: "Rides", icon: Car },
];

export function HeroMap() {
  const [activeTab, setActiveTab] = useState("ttc");
  const [isExpanded, setIsExpanded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<MapRef>(null);

  const handleMapInteraction = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    
    if (!userLocation && !isLocating) {
      setIsLocating(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            mapRef.current?.flyTo({
              center: [pos.coords.longitude, pos.coords.latitude],
              zoom: 15,
              pitch: 60,
              duration: 2000
            });
            setIsLocating(false);
          },
          (err) => {
            console.error(err);
            setIsLocating(false);
          }
        );
      }
    }
  };

  const collapseMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  return (
    <motion.section 
      animate={{ height: isExpanded ? 550 : 320 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`mx-6 mb-8 relative rounded-[24px] overflow-hidden shadow-[0_16px_32px_rgba(229,57,53,0.08)] bg-[#FFF9F2] flex flex-col justify-between ${isExpanded ? 'z-50 ring-4 ring-white shadow-2xl mt-4' : ''}`}
    >
      
      {/* Absolute Map Layer */}
      <div className="absolute inset-0 z-0">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            longitude: -79.3832,
            latitude: 43.6532,
            zoom: 12,
            pitch: 45,
            bearing: -17.6,
          }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          interactive={true}
          dragPan={true}
          dragRotate={true}
          onClick={handleMapInteraction}
        >
          {userLocation && (
            <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 bg-blue-500/20 rounded-full animate-ping" />
                <div className="w-5 h-5 bg-[#4285F4] rounded-full border-[3px] border-white shadow-md relative z-10" />
              </div>
            </Marker>
          )}
        </Map>
      </div>

      {/* Floating Action Button for Location */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleMapInteraction();
        }}
        className="absolute right-4 top-16 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[var(--color-text-dark)] hover:bg-gray-50 transition-colors"
      >
        <LocateFixed size={18} className={isLocating ? "animate-spin text-blue-500" : (userLocation ? "text-blue-500" : "")} />
      </button>

      {/* Collapse button (only visible when expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={collapseMap}
            className="absolute left-4 top-16 z-20 bg-white/90 backdrop-blur-md px-3 py-2 rounded-full text-[12px] font-bold shadow-lg"
          >
            Collapse Map
          </motion.button>
        )}
      </AnimatePresence>

      {/* Toggles (Z-index above map) */}
      <div className="relative z-10 flex gap-2 p-3 bg-gradient-to-b from-white/90 to-transparent overflow-x-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        {MAP_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-colors ${
                isActive ? "text-white" : "bg-white/80 text-[var(--color-text-gray)]"
              }`}
              animate={{
                background: isActive ? "linear-gradient(135deg, #E53935, #FF5722)" : "rgba(255,255,255,0.8)",
                scale: isActive ? 1.02 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Icon size={16} />
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="ml-1 overflow-hidden"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Bottom Sheet (Z-index above map) */}
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        className="relative z-10 bg-white/90 backdrop-blur-md m-3 rounded-[20px] p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-8 h-1 bg-black/10 rounded-full mx-auto mb-3" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (userLocation ? "-located" : "")}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "ttc" && (
              <>
                <h4 className="text-[11px] text-[var(--color-text-gray)] mb-1 uppercase tracking-wider">
                  {userLocation ? "Closest Stop to Your Location" : "Closest Stop to you"}
                </h4>
                <p className="text-[16px] font-bold text-[var(--color-text-dark)] mb-2">
                  {userLocation ? "Spadina Ave at Queen St W" : "Keele St at York Blvd"}
                </p>
                <div className="flex gap-2 text-[12px] font-semibold">
                  <span className="bg-white px-2 py-1 rounded-lg shadow-sm">
                    {userLocation ? "1 min away" : "4 min away"}
                  </span>
                  <span className="bg-[var(--color-soft-red)] text-[var(--color-primary-red)] px-2 py-1 rounded-lg">
                    {userLocation ? "Next streetcar: Now" : "Next bus: 2 min"}
                  </span>
                </div>
              </>
            )}

            {activeTab === "subway" && (
              <>
                <h4 className="text-[11px] text-[var(--color-text-gray)] mb-1 uppercase tracking-wider">Fastest Route to York Univ</h4>
                <p className="text-[16px] font-bold text-[var(--color-text-dark)] mb-2">TTC Subway (Line 1)</p>
                <div className="flex gap-2 text-[12px] font-semibold">
                  <span className="bg-white px-2 py-1 rounded-lg shadow-sm">
                    {userLocation ? "45 min" : "37 min"}
                  </span>
                  <span className="bg-[var(--color-soft-red)] text-[var(--color-primary-red)] px-2 py-1 rounded-lg">$3.30</span>
                </div>
              </>
            )}

            {activeTab === "train" && (
              <>
                <h4 className="text-[11px] text-[var(--color-text-gray)] mb-1 uppercase tracking-wider">GO Transit Departure</h4>
                <p className="text-[16px] font-bold text-[var(--color-text-dark)] mb-2">Union Station → Barrie</p>
                <div className="flex gap-2 text-[12px] font-semibold">
                  <span className="bg-white px-2 py-1 rounded-lg shadow-sm">Platform 3</span>
                  <span className="bg-[var(--color-soft-red)] text-[var(--color-primary-red)] px-2 py-1 rounded-lg">Departs 4:15 PM</span>
                </div>
              </>
            )}

            {activeTab === "rides" && (
              <>
                <h4 className="text-[11px] text-[var(--color-text-gray)] mb-1 uppercase tracking-wider">Ride Estimates</h4>
                <p className="text-[16px] font-bold text-[var(--color-text-dark)] mb-2">To Pearson Airport</p>
                <div className="flex gap-2 mt-2">
                  <div className="flex-1 bg-white border border-black/5 p-2 rounded-xl flex flex-col items-center gap-1 shadow-sm cursor-pointer hover:scale-95 transition-transform">
                    <Car size={18} />
                    <span className="text-[11px] font-bold">UberX</span>
                    <span className="text-[10px] text-[var(--color-primary-red)]">
                      {userLocation ? "$32 • 2m" : "$42 • 5m"}
                    </span>
                  </div>
                  <div className="flex-1 bg-white border border-black/5 p-2 rounded-xl flex flex-col items-center gap-1 shadow-sm cursor-pointer hover:scale-95 transition-transform">
                    <Car size={18} />
                    <span className="text-[11px] font-bold">Lyft</span>
                    <span className="text-[10px] text-[var(--color-primary-red)]">
                      {userLocation ? "$29 • 4m" : "$39 • 7m"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}
