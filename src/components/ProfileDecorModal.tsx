import { useState, useMemo } from "react";
import { X, Sparkles, Wand2, Star, Plus, Check, Save } from "lucide-react";
import { UserProfile } from "../types";
import { getProfileBorderStyle, BORDERS_LIST } from "./ProfileModal";
import { supabase } from "../lib/supabase";

export const EFFECTS_LIST = [
  { id: "none", label: "None ❌", cost: 0, type: 'coins' },
  { id: "blueprint", label: "Developer Blueprint 📐", cost: 0, type: 'rubies' },
  { id: "sepia", label: "Vintage Sepia 📸", cost: 0, type: 'coins' },
  { id: "flames", label: "Inferno Flames 🔥", cost: 0, type: 'rubies' },
  { id: "rain", label: "Rainy Day ☔", cost: 0, type: 'coins' },
  { id: "smoke", label: "Mystic Smoke 💨", cost: 0, type: 'coins' },
  { id: "bubbles", label: "Floating Bubbles 🫧", cost: 0, type: 'coins' },
  { id: "hearts", label: "Raining Hearts 💖", cost: 0, type: 'rubies' },
  { id: "snow", label: "Winter Snow ❄️", cost: 0, type: 'coins' },
  { id: "matrix", label: "Matrix Code 💻", cost: 0, type: 'rubies' },
  { id: "glitch", label: "System Glitch 👾", cost: 0, type: 'rubies' },
  { id: "cyberpunk", label: "Cyber City 🌆", cost: 0, type: 'rubies' },
  { id: "stars", label: "Starry Night ⭐", cost: 0, type: 'coins' },
  { id: "clouds", label: "Drifting Clouds ☁️", cost: 0, type: 'coins' },
  { id: "ocean", label: "Deep Ocean 🌊", cost: 0, type: 'coins' },
  { id: "lava", label: "Volcanic Lava 🌋", cost: 0, type: 'rubies' },
  { id: "thunder", label: "Thunderstorm ⛈️", cost: 0, type: 'coins' },
  { id: "fireflies", label: "Fireflies ✨", cost: 0, type: 'rubies' },
  { id: "confetti", label: "Party Confetti 🎉", cost: 0, type: 'coins' },
  { id: "butterflies", label: "Butterflies 🦋", cost: 0, type: 'rubies' },
  { id: "bats", label: "Spooky Bats 🦇", cost: 0, type: 'rubies' },
  { id: "ghosts", label: "Haunted Ghosts 👻", cost: 0, type: 'rubies' },
  { id: "leaves", label: "Autumn Leaves 🍂", cost: 0, type: 'coins' },
  { id: "sakura", label: "Sakura Petals 🌸", cost: 0, type: 'rubies' },
  { id: "sparks", label: "Electric Sparks ⚡", cost: 0, type: 'coins' },
  { id: "hologram", label: "Sci-Fi Hologram 🛰️", cost: 0, type: 'rubies' },
  { id: "vhs", label: "Retro VHS 📼", cost: 0, type: 'coins' },
  { id: "crt", label: "Old CRT TV 📺", cost: 0, type: 'coins' },
  { id: "neon-pulse", label: "Neon Pulse 💡", cost: 0, type: 'rubies' },
  { id: "void", label: "The Void 🌌", cost: 0, type: 'rubies' },
  { id: "aurora", label: "Aurora Lights 🌠", cost: 0, type: 'rubies' },
  { id: "strobe", label: "Strobe Lights 🔦", cost: 0, type: 'coins' },
  { id: "disco", label: "Disco Floor 🪩", cost: 0, type: 'coins' },
  { id: "gold-dust", label: "Golden Dust 🪙", cost: 0, type: 'rubies' },
  { id: "blood-moon", label: "Blood Moon 🩸", cost: 0, type: 'coins' },
  { id: "underwater", label: "Deep Sea 🦑", cost: 0, type: 'coins' },
  { id: "toxic", label: "Toxic Spill ☣️", cost: 0, type: 'rubies' },
  { id: "radioactive", label: "Radioactive ☢️", cost: 0, type: 'rubies' },
  { id: "shatter", label: "Shattered Glass 🔨", cost: 0, type: 'coins' },
  { id: "mirror", label: "Mirror House 🪞", cost: 0, type: 'coins' },
  { id: "ink", label: "Ink Spill 🖋️", cost: 0, type: 'coins' },
  { id: "paper", label: "Torn Paper 📄", cost: 0, type: 'coins' },
  { id: "wood", label: "Wood Cabin 🪵", cost: 0, type: 'coins' },
  { id: "metal", label: "Brushed Metal ⚙️", cost: 0, type: 'coins' },
  { id: "leather", label: "Dark Leather 🧳", cost: 0, type: 'coins' },
  { id: "hacker", label: "Hacker Terminal ⌨️", cost: 0, type: 'rubies' },
  { id: "rainbow-swirl", label: "Rainbow Swirl 🌀", cost: 0, type: 'rubies' },
  { id: "diamond", label: "Diamond Crystal 💎", cost: 0, type: 'rubies' },
];

export default function ProfileDecorModal({ user, onClose, onUserUpdate, onPurchase }: { user: UserProfile, onClose: () => void, onUserUpdate: (u: Partial<UserProfile>) => void, onPurchase?: () => void }) {
  const [activeTab, setActiveTab] = useState<"borders" | "effects" | "glow">("borders");
  
  const [selectedBorder, setSelectedBorder] = useState(user.border || "none");
  const [selectedThickness, setSelectedThickness] = useState(user.borderThickness || "2px");
  const [selectedStyle, setSelectedStyle] = useState(user.borderStyle || "solid");
  
  const [selectedEffect, setSelectedEffect] = useState(user.profile_effect || "none");
  const [selectedGlowType, setSelectedGlowType] = useState(user.cardGlowType || "none");
  const [selectedGlowColor, setSelectedGlowColor] = useState(user.cardGlowColor || "#ff007f");
  
  const [isSaving, setIsSaving] = useState(false);

  const calculateCost = () => { return { coins: 0, rubies: 0 }; };
  
  const { coins: costCoins, rubies: costRubies } = calculateCost();
  
  const canAfford = (user.coins || 0) >= costCoins && (user.rubies || 0) >= costRubies;

  const handleSave = async () => {
    setIsSaving(true);
    
    const newCoins = (user.coins || 0) - costCoins;
    const newRubies = (user.rubies || 0) - costRubies;
    
    const updates = {
      border: selectedBorder,
      borderThickness: selectedThickness,
      borderStyle: selectedStyle,
      profile_effect: selectedEffect,
      cardGlowColor: selectedGlowColor,
      cardGlowType: selectedGlowType,
      coins: newCoins,
      rubies: newRubies
    };

    const dbUpdates = {
      border: selectedBorder,
      border_thickness: selectedThickness,
      border_style: selectedStyle,
      profile_effect: selectedEffect,
      card_glow_color: selectedGlowColor,
      card_glow_type: selectedGlowType,
      coins: newCoins,
      rubies: newRubies
    };
    
    await supabase.from("profiles").update(dbUpdates).eq("id", user.id);
    onUserUpdate(updates);
    if (onPurchase) onPurchase();
    else onClose();
  };

  const previewBorderStyle = useMemo(() => {
    const s = getProfileBorderStyle(selectedBorder, selectedThickness);
    if (selectedBorder !== "none") {
       s.borderStyle = selectedStyle;
    }
    return s;
  }, [selectedBorder, selectedThickness, selectedStyle]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="w-full max-w-4xl bg-[#121212] border border-purple-900/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-purple-900/40 flex items-center justify-between shrink-0 bg-[#0d0a1c]">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            <h4 className="font-black text-white text-lg">Profile Decor</h4>
          </div>
          <div className="flex items-center gap-4">
            
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#0d0a1c] shrink-0">
          <button
            onClick={() => setActiveTab("borders")}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "borders" ? "border-purple-500 text-white" : "border-transparent text-white/50 hover:text-white/80"}`}
          >
            Profile Borders
          </button>
          <button
            onClick={() => setActiveTab("effects")}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "effects" ? "border-purple-500 text-white" : "border-transparent text-white/50 hover:text-white/80"}`}
          >
            Profile Effects
          </button>
          <button
            onClick={() => setActiveTab("glow")}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "glow" ? "border-purple-500 text-white" : "border-transparent text-white/50 hover:text-white/80"}`}
          >
            Card Glow 🌟
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-[400px]">
          {/* Left side: selection list */}
          <div className="w-full lg:w-1/2 overflow-y-auto p-4 custom-scrollbar bg-[#0d0a1c]">
            {activeTab === "borders" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-bold px-1">Thickness</label>
                    <select 
                      value={selectedThickness}
                      onChange={(e) => setSelectedThickness(e.target.value)}
                      className="w-full bg-[#16122a] border border-white/10 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="1px">Thin (1px)</option>
                      <option value="2px">Normal (2px)</option>
                      <option value="4px">Thick (4px)</option>
                      <option value="6px">Heavy (6px)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-bold px-1">Style</label>
                    <select 
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full bg-[#16122a] border border-white/10 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                      <option value="double">Double</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {BORDERS_LIST.map((b, i) => {
                    
                    const isSelected = selectedBorder === b.id;
                    const isOwned = user.border === b.id;

                    return (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBorder(b.id)}
                        className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 gap-1 transition-all ${isSelected ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'bg-[#16122a] hover:bg-[#1a1532]'} border border-white/5`}
                        title={b.label}
                      >
                        <div 
                          className={`w-8 h-8 rounded-full ${b.id !== 'none' ? `profile-border-${b.id}` : ''}`} 
                          style={b.id === 'none' ? { border: '1px solid rgba(255,255,255,0.2)' } : getProfileBorderStyle(b.id, '2px')}
                        />
                        <span className="text-[9px] text-center font-medium text-white/70 truncate w-full">{b.label}</span>
                        
                        {isOwned && (
                          <div className="absolute top-1 right-1 text-[8px] font-black text-green-400 bg-green-400/10 px-1 py-0.5 rounded">
                            OWNED
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Border Thickness Customizer */}
                {selectedBorder !== "none" && (
                  <div className="mt-4 bg-[#1a1534]/50 border border-purple-900/20 p-3.5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-purple-300 uppercase font-black tracking-wider font-sans">
                        Border Thickness
                      </label>
                      <span className="text-xs font-mono font-bold text-white bg-purple-900/40 px-2.5 py-0.5 rounded">
                        {selectedThickness}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {["1px", "2px", "3px", "4px"].map((t) => {
                        const isSelected = selectedThickness === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedThickness(t)}
                            className={`py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-purple-600 text-white border-purple-400 shadow-md"
                                : "bg-black/30 text-purple-300 border-white/5 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {t === "1px" ? "Very Thin" : t === "2px" ? "Thin" : t === "3px" ? "Medium" : "Thick"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "effects" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EFFECTS_LIST.map(e => {
                  const isSelected = selectedEffect === e.id;
                  const isOwned = user.profile_effect === e.id;
                  
                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEffect(e.id)}
                      className={`relative flex flex-col items-center justify-center p-3 gap-2 rounded-xl border transition-all ${isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-[#16122a] hover:bg-[#1a1532]'}`}
                    >
                      <span className="text-[11px] font-bold text-white text-center">{e.label}</span>
                      
                      {isOwned && (
                        <div className="text-[9px] font-black text-green-400 mt-1 px-2 py-0.5 bg-green-400/10 rounded">OWNED</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === "glow" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="p-3 bg-purple-950/20 border border-purple-900/20 rounded-xl">
                  <p className="text-xs text-purple-200 leading-relaxed">
                    Personalize your presence in the online users list. Add a vibrant glowing outline around your profile card with any color of your choice, a moving rainbow cascade, or convert the entire card into a classic green Hacker Terminal.
                  </p>
                </div>

                {/* Glow Type Selections */}
                <div className="space-y-2">
                  <label className="text-[10px] text-white/50 uppercase font-black tracking-wider px-1 block">1. Choose Glow Style</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* None Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedGlowType("none")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedGlowType === 'none' 
                          ? 'border-purple-500 bg-purple-500/10 text-white shadow-lg' 
                          : 'border-white/5 bg-[#16122a] hover:bg-[#1a1532] text-white/70'
                      }`}
                    >
                      <span className="font-bold text-xs block">Disabled ❌</span>
                      <span className="text-[10px] text-white/40 block mt-1">Standard card outline</span>
                    </button>

                    {/* Custom Color Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedGlowType("color")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedGlowType === 'color' 
                          ? 'border-purple-500 bg-purple-500/10 text-white shadow-lg' 
                          : 'border-white/5 bg-[#16122a] hover:bg-[#1a1532] text-white/70'
                      }`}
                    >
                      <span className="font-bold text-xs block">Solid Color Wheel 🎨</span>
                      <span className="text-[10px] text-white/40 block mt-1">Pick any custom outline glow</span>
                    </button>

                    {/* Rainbow Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedGlowType("rainbow")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedGlowType === 'rainbow' 
                          ? 'border-purple-500 bg-purple-500/10 text-white shadow-lg' 
                          : 'border-white/5 bg-[#16122a] hover:bg-[#1a1532] text-white/70'
                      }`}
                    >
                      <span className="font-bold text-xs block text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-green-400 to-blue-400">Rainbow Cascade 🌈</span>
                      <span className="text-[10px] text-white/40 block mt-1">Animated color cycle outline</span>
                    </button>

                    {/* Terminal Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedGlowType("terminal")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedGlowType === 'terminal' 
                          ? 'border-purple-500 bg-purple-500/10 text-white shadow-lg' 
                          : 'border-white/5 bg-[#16122a] hover:bg-[#1a1532] text-white/70'
                      }`}
                    >
                      <span className="font-bold text-xs block text-green-400 font-mono">Hacker Terminal 💻</span>
                      <span className="text-[10px] text-white/40 block mt-1">Pitch-black and phosphor green</span>
                    </button>
                  </div>
                </div>

                {/* Color Selector (only shown if solid color is selected) */}
                {selectedGlowType === 'color' && (
                  <div className="space-y-3 p-3.5 bg-[#1a1534]/50 border border-purple-900/30 rounded-xl animate-in slide-in-from-top-2 duration-150">
                    <label className="text-[10px] text-white/50 uppercase font-black tracking-wider block">2. Select Your Color</label>
                    
                    <div className="flex items-center gap-4 bg-[#0d0a1c] border border-white/10 p-3 rounded-xl">
                      <div className="relative w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden shrink-0 shadow-lg cursor-pointer" style={{ backgroundColor: selectedGlowColor }}>
                        <input 
                          type="color" 
                          value={selectedGlowColor} 
                          onChange={(e) => setSelectedGlowColor(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white">Full Color Wheel</p>
                        <p className="text-[10px] text-purple-400">Tap circle to open color wheel</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-purple-200 bg-purple-950/40 px-2.5 py-1.5 rounded border border-purple-900/40">{selectedGlowColor.toUpperCase()}</span>
                    </div>

                    {/* Pre-designed presets for convenience */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[9px] text-white/40 uppercase font-bold">Quick Presets</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'Hot Pink', hex: '#ff007f' },
                          { name: 'Neon Purple', hex: '#a855f7' },
                          { name: 'Electric Cyan', hex: '#00f2fe' },
                          { name: 'Toxic Green', hex: '#39ff14' },
                          { name: 'Gold Dust', hex: '#f59e0b' },
                          { name: 'Ruby Red', hex: '#ef4444' }
                        ].map(preset => (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => setSelectedGlowColor(preset.hex)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/5 hover:border-white/25 bg-[#0d0a1c] text-white/80 hover:text-white transition-all cursor-pointer"
                          >
                            <span className="w-2 h-2 rounded-full block shrink-0" style={{ backgroundColor: preset.hex }} />
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side: Live Preview */}
          <div className="w-full lg:w-1/2 p-4 sm:p-6 bg-[#090714] flex flex-col border-l border-white/5 overflow-y-auto custom-scrollbar">
            <h5 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4 text-center">Live Preview</h5>
            
            {/* User Card Live Preview */}
            <div className="mb-5 border-b border-white/5 pb-5">
              <p className="text-[10px] text-white/50 uppercase font-black tracking-widest text-center mb-3">Userlist Card Preview</p>
              <div className="flex justify-center">
                <div 
                  className={`p-2.5 rounded-none flex items-center justify-between transition-all w-64 border bg-[#120e24]/60 ${
                    selectedGlowType === 'terminal' 
                      ? 'font-mono text-[#00ff00]' 
                      : selectedGlowType === 'rainbow' 
                        ? 'animate-rainbow-card text-white' 
                        : 'border-purple-950/40 text-white'
                  }`}
                  style={{
                    backgroundColor: selectedGlowType === 'terminal' ? '#000000' : undefined,
                    borderColor: selectedGlowType === 'color' ? selectedGlowColor : selectedGlowType === 'terminal' ? '#00ff00' : undefined,
                    boxShadow: selectedGlowType === 'color' ? `0 0 10px ${selectedGlowColor}` : selectedGlowType === 'terminal' ? '0 0 12px rgba(0, 255, 0, 0.6)' : undefined,
                    color: selectedGlowType === 'terminal' ? '#00ff00' : '#ffffff',
                    fontFamily: selectedGlowType === 'terminal' ? 'monospace' : undefined,
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-none bg-purple-950/80 p-0.5 border border-purple-800/20 overflow-hidden shrink-0">
                        <img src={user.pfp} alt={user.username} className="w-full h-full rounded-none object-cover" />
                      </div>
                      <div className="absolute bottom-0 right-0">
                        <span className="w-2.5 h-2.5 border-2 border-[#0c0919] rounded-full bg-emerald-500 block" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span 
                        className="text-xs font-bold truncate max-w-[120px] block"
                        style={{ color: selectedGlowType === 'terminal' ? '#00ff00' : undefined }}
                      >
                        {user.username}
                      </span>
                      <span className="text-[9px] italic truncate max-w-[120px] block" style={{ color: selectedGlowType === 'terminal' ? '#00ff00' : '#a78bfa' }}>
                        {user.mood || "No mood set"}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="text-[8px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded uppercase" style={{ color: selectedGlowType === 'terminal' ? '#00ff00' : undefined, borderColor: selectedGlowType === 'terminal' ? '#00ff00' : undefined }}>
                      {user.rank}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-white/50 uppercase font-black tracking-widest text-center mb-3">Profile Modal Preview</p>
            <div className="flex-1 flex items-center justify-center">
              <div 
                className={`relative w-full max-w-sm rounded-2xl overflow-hidden flex flex-col shadow-2xl h-[360px] ${
                  selectedBorder !== "none" ? `profile-border-${selectedBorder}` : "border border-purple-900/40" } ${selectedEffect === "sepia" ? "profile-effect-sepia" : ""
                }`}
                style={selectedBorder !== "none" ? previewBorderStyle : {}}
              >
                
                
                <div className="relative z-10 flex flex-col h-full bg-[#0d0a1c]/80 backdrop-blur-sm">
                  <div className="h-24 w-full bg-purple-900/30" />
                  <div className={`px-6 pb-6 flex-1 flex flex-col items-center text-center -mt-10 ${selectedEffect !== "none" && selectedEffect !== "sepia" ? "profile-effect-" + selectedEffect : ""}`}>
                    <div className="w-16 h-16 rounded-full border-2 border-[#121212] overflow-hidden bg-black mb-2">
                      <img src={user.pfp} className="w-full h-full object-cover" alt="pfp" />
                    </div>
                    <h3 className="font-black text-lg text-white">{user.username}</h3>
                    <p className="text-[10px] text-purple-300 mt-0.5 uppercase tracking-wider font-bold">{user.rank}</p>
                    
                    <div className="mt-4 w-full p-2.5 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[11px] text-white/70 italic">"{user.aboutMe || "No bio set."}"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Purchase Action */}
            <div className="mt-6 p-4 bg-[#16122a] rounded-xl border border-white/10 shrink-0">
              <div className="flex justify-between items-center mb-3 text-sm font-bold text-white"><span>Price:</span><span className="text-green-400">FREE</span></div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors ${
                  'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'
                }`}
              >
                {isSaving ? "Saving..." : <><Check className="w-4 h-4" /> Apply Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
