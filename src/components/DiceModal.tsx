import React, { useState } from "react";
import { X, Dices, Circle, Sparkles, HelpCircle } from "lucide-react";
import { UserProfile } from "../types";

interface DiceModalProps {
  user: UserProfile;
  onClose: () => void;
  onSendRoll: (messageText: string) => Promise<void>;
}

export default function DiceModal({ user, onClose, onSendRoll }: DiceModalProps) {
  const [activeTab, setActiveTab] = useState<"dice" | "coin">("dice");
  const [selectedDice, setSelectedDice] = useState<number>(20); // Default D20
  const [diceCount, setDiceCount] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  const [announceToChat, setAnnounceToChat] = useState(true);
  
  // Results states
  const [diceResults, setDiceResults] = useState<number[]>([]);
  const [coinResult, setCoinResult] = useState<"Heads" | "Tails" | null>(null);
  const [isSuccessRoll, setIsSuccessRoll] = useState<boolean | null>(null);

  const rollDice = () => {
    setIsRolling(true);
    setCoinResult(null);
    setIsSuccessRoll(null);
    
    // Simulate roll animation delay
    setTimeout(async () => {
      const results: number[] = [];
      for (let i = 0; i < diceCount; i++) {
        results.push(Math.floor(Math.random() * selectedDice) + 1);
      }
      setDiceResults(results);
      setIsRolling(false);

      const total = results.reduce((sum, val) => sum + val, 0);
      
      // Determine if high roll (for sparkle effect)
      const maxPossible = selectedDice * diceCount;
      const percentage = total / maxPossible;
      setIsSuccessRoll(percentage >= 0.7);

      if (announceToChat) {
        const payload = {
          type: "dice",
          diceType: selectedDice,
          diceCount: diceCount,
          results: results,
          total: total,
          critical: (selectedDice === 20 && total === 20) ? "hit" : (selectedDice === 20 && total === 1) ? "fail" : null
        };
        const msgText = `[DICE_ROLL]:${JSON.stringify(payload)}`;
        await onSendRoll(msgText);
      }
    }, 800);
  };

  const flipCoin = () => {
    setIsRolling(true);
    setDiceResults([]);
    setIsSuccessRoll(null);

    setTimeout(async () => {
      const result = Math.random() < 0.5 ? "Heads" : "Tails";
      setCoinResult(result);
      setIsRolling(false);

      if (announceToChat) {
        const payload = {
          type: "coin",
          coinResult: result
        };
        const msgText = `[DICE_ROLL]:${JSON.stringify(payload)}`;
        await onSendRoll(msgText);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="w-full max-w-md bg-[#121212] border border-purple-900/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-purple-900/40 flex items-center justify-between shrink-0 bg-[#0d0a1c]">
          <div className="flex items-center gap-2">
            <Dices className="w-5 h-5 text-purple-400 animate-bounce" />
            <h4 className="font-black text-white text-lg">Dice & Coin Roller</h4>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 bg-[#090714] shrink-0">
          <button
            onClick={() => {
              setActiveTab("dice");
              setDiceResults([]);
              setCoinResult(null);
            }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === "dice"
                ? "text-purple-400 border-purple-500 bg-[#120e24]/40"
                : "text-white/40 border-transparent hover:text-white/60 hover:bg-[#120e24]/10"
            }`}
          >
            🎲 Roll Dice
          </button>
          <button
            onClick={() => {
              setActiveTab("coin");
              setDiceResults([]);
              setCoinResult(null);
            }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === "coin"
                ? "text-purple-400 border-purple-500 bg-[#120e24]/40"
                : "text-white/40 border-transparent hover:text-white/60 hover:bg-[#120e24]/10"
            }`}
          >
            🪙 Flip Coin
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto bg-[#0d0a1c] flex-1 space-y-6">
          {activeTab === "dice" ? (
            <div className="space-y-5">
              {/* Dice Type Selection */}
              <div className="space-y-2">
                <label className="text-[10px] text-white/50 uppercase font-black tracking-wider">Choose Dice Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {[4, 6, 8, 10, 12, 20, 100].map((d) => {
                    const isSelected = selectedDice === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setSelectedDice(d);
                          setDiceResults([]);
                        }}
                        className={`py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/20"
                            : "bg-[#16122a] border-white/5 text-purple-300 hover:bg-[#1a1532]"
                        }`}
                      >
                        D{d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="text-[10px] text-white/50 uppercase font-black tracking-wider">Dice Quantity</label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((count) => {
                    const isSelected = diceCount === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          setDiceCount(count);
                          setDiceResults([]);
                        }}
                        className={`w-10 h-10 rounded-full border text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-400 shadow-md"
                            : "bg-[#16122a] border-white/5 text-purple-300 hover:bg-[#1a1532]"
                        }`}
                      >
                        {count}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 text-center py-4">
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 border border-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse">
                <span className="text-4xl font-black text-amber-950">🪙</span>
              </div>
              <p className="text-xs text-purple-300">Flip a coin to decide Heads or Tails instantly!</p>
            </div>
          )}

          {/* Announce Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#16122a] border border-white/5 rounded-xl">
            <div>
              <p className="text-xs font-bold text-white">Announce Roll in Chat</p>
              <p className="text-[10px] text-purple-400">Posts the result to the room automatically</p>
            </div>
            <button
              type="button"
              onClick={() => setAnnounceToChat(!announceToChat)}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer flex ${
                announceToChat ? "bg-purple-600 justify-end" : "bg-purple-950/80 justify-start"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white block shadow" />
            </button>
          </div>

          {/* Action Area & Animated Output */}
          <div className="space-y-4 pt-2 border-t border-white/5">
            {isRolling ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-purple-300 animate-pulse uppercase tracking-widest">
                  {activeTab === "dice" ? "Rolling Dice..." : "Flipping Coin..."}
                </p>
              </div>
            ) : (
              <>
                {/* Dice Result Display */}
                {activeTab === "dice" && diceResults.length > 0 && (
                  <div className={`p-4 rounded-xl border text-center transition-all ${
                    isSuccessRoll 
                      ? 'bg-purple-950/30 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                      : 'bg-black/40 border-white/5'
                  }`}>
                    <p className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
                      {isSuccessRoll && <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />}
                      Result
                    </p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {diceResults.map((val, idx) => (
                        <div key={idx} className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-lg font-black text-white shadow-inner font-mono">
                          {val}
                        </div>
                      ))}
                    </div>
                    {diceCount > 1 && (
                      <p className="text-sm font-black text-white mt-3 bg-purple-950/50 inline-block px-3 py-1 rounded-lg border border-purple-900/30">
                        Total: <span className="text-purple-400 font-mono text-base">{diceResults.reduce((s, v) => s + v, 0)}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Coin Result Display */}
                {activeTab === "coin" && coinResult && (
                  <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-950/10 text-center">
                    <p className="text-[10px] text-yellow-500 font-extrabold uppercase tracking-widest mb-1">Flipped</p>
                    <p className="text-2xl font-black text-yellow-400 font-sans uppercase tracking-wider">
                      ✨ {coinResult} ✨
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={activeTab === "dice" ? rollDice : flipCoin}
                  className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Dices className="w-4 h-4" />
                  {activeTab === "dice" ? `Roll ${diceCount}d${selectedDice}` : "Flip Coin"}
                </button>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
