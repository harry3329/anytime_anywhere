import React, { useState } from 'react';
import { MapPin, User, ArrowRight, Map, Footprints } from 'lucide-react';
import { TAIWAN_CITIES } from './data/towns';
import { filterTowns, pickRandomTown, sendResultToGas, getTownImageUrl } from './utils/logic';
import type { AdventureResult } from './utils/logic';
import { playTickSound, playSuccessSound } from './utils/sound';

const App: React.FC = () => {
  // 環境變數
  const excludeNeighbors = import.meta.env.VITE_EXCLUDE_NEIGHBORS === 'true';

  // State
  const [userId, setUserId] = useState('');
  const [userCity, setUserCity] = useState('');
  
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<AdventureResult | null>(null);
  const [rollText, setRollText] = useState('...');
  const [history, setHistory] = useState<{town: AdventureResult, time: string, uid: string, city: string}[]>([]);
  
  // 開始抽籤
  const startAdventure = () => {
    if (!userId || !userCity) {
      alert("請輸入 User ID 並選擇居住縣市！");
      return;
    }

    // 1. 過濾鄉鎮
    const validTowns = filterTowns(userCity, excludeNeighbors);
    
    if (validTowns.length === 0) {
      alert("沒有可用的鄉鎮！(可能是過濾條件太嚴格)");
      return;
    }

    setIsRolling(true);
    setResult(null);

    // 2. 拉霸機動畫效果
    let rolls = 0;
    const maxRolls = 20; // 閃爍次數
    const rollInterval = setInterval(() => {
      const tempTown = validTowns[Math.floor(Math.random() * validTowns.length)];
      setRollText(`${tempTown.city} ${tempTown.name}`);
      playTickSound();
      rolls++;

      if (rolls >= maxRolls) {
        clearInterval(rollInterval);
        
        // 3. 決定最終結果
        const finalTown = pickRandomTown(validTowns);
        if (finalTown) {
          setResult(finalTown);
          setIsRolling(false);
          playSuccessSound();
          
          const nowStr = new Date().toLocaleTimeString('zh-TW', { hour12: false });
          setHistory(prev => [{ town: finalTown, time: nowStr, uid: userId, city: userCity }, ...prev]);

          // 4. 背景傳送資料給 GAS
          sendResultToGas(userId, userCity, finalTown);
        }
      }
    }, 100); // 每 0.1 秒跳一次
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black bg-[radial-gradient(#333_1px,transparent_1px)] bg-[size:20px_20px]">
      
      {/* 標題區 */}
      <h1 className="text-2xl md:text-5xl text-retro-accent mb-8 text-center leading-relaxed font-bold tracking-widest flex justify-center items-center">
        <Footprints className="inline-block mr-4 w-8 h-8 md:w-12 md:h-12 text-retro-accent" />
        Anytime Anywhere
      </h1>

      <div className="w-full max-w-lg space-y-8">
        
        {/* 輸入卡片 (Login) */}
        <div className="panel-8bit space-y-6">
          <h2 className="text-xl text-retro-primary border-b-2 border-retro-border pb-2">
            PLAYER LOGIN
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-retro-accent">
                <User className="inline w-4 h-4 mr-2" />
                User ID
              </label>
              <input 
                type="text" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Name..."
                className="w-full bg-black border-2 border-retro-border text-retro-text p-3 font-pixel focus:border-retro-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-retro-accent">
                <MapPin className="inline w-4 h-4 mr-2" />
                目前居住縣市
              </label>
              <select 
                value={userCity}
                onChange={(e) => setUserCity(e.target.value)}
                className="w-full bg-black border-2 border-retro-border text-retro-text p-3 font-pixel focus:border-retro-primary focus:outline-none appearance-none"
              >
                <option value="">--請選擇--</option>
                {TAIWAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <p className="text-xs text-gray-400 mt-2">
              系統將自動濾除{excludeNeighbors ? '居住地與鄰近縣市' : '你的居住縣市'}
            </p>
          </div>
        </div>

        {/* 核心按鈕 */}
        <div className="text-center">
          <button 
            onClick={startAdventure}
            disabled={isRolling}
            className={`btn-8bit w-full py-6 text-xl ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRolling ? 'ROLLING...' : 'START ADVENTURE'}
          </button>
        </div>

        {/* 動畫/結果顯示區 */}
        {(isRolling || result) && (
          <div className="panel-8bit text-center border-retro-accent animate-pulse-slow">
            <p className="text-sm text-gray-400 mb-4">-- TARGET DESTINATION --</p>
            
            {isRolling ? (
              <div className="text-2xl md:text-3xl text-retro-text h-32 flex items-center justify-center">
                {rollText}
              </div>
            ) : result ? (
              <div className="animate-bounce-short">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.city + result.name)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-3xl md:text-4xl text-retro-accent mb-6 hover:text-white transition-colors hover:underline flex items-center justify-center"
                >
                  <span>{result.city} <ArrowRight className="inline mx-2" /> {result.name}</span>
                  <Map className="inline-block ml-3 w-8 h-8 md:w-10 md:h-10 text-gray-400 group-hover:text-white" />
                </a>
                
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-2 border-4 border-retro-primary w-32 h-32 md:w-48 md:h-48">
                    {/* Dicebear Pixel Art API (Unsplash APIs are often blocked/deprecated) */}
                    <img 
                      src={getTownImageUrl(result.name + result.city + userId)} 
                      alt="Pixel Avatar" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* 當地特色/提示對話框 */}
                {result.desc && (
                  <div className="bg-gray-800 text-left p-4 border-4 border-white mt-6 relative mx-auto max-w-sm rounded">
                    <div className="absolute -top-3 left-4 bg-black px-2 text-xs text-retro-accent">INFO</div>
                    <p className="text-sm md:text-base leading-relaxed text-gray-200" style={{fontFamily: '微軟正黑體, sans-serif'}}>
                      {result.desc}
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-retro-secondary mt-6 font-pixel">&gt;&gt; LEVEL UP !</p>
              </div>
            ) : null}
          </div>
        )}

        {/* 歷史紀錄區 */}
        { इतिहास() }
      </div>
    </div>
  );

  function इतिहास() {
    if (history.length === 0) return null;
    return (
      <div className="panel-8bit mt-8 border-gray-600">
        <h3 className="text-lg text-gray-300 mb-4 border-b-2 border-gray-600 pb-2">HISTORY RECORDS</h3>
        <ul className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
          {history.map((record, idx) => (
            <li key={idx} className="flex flex-col text-sm bg-gray-900 p-4 border border-gray-700 hover:border-retro-primary transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-xs md:text-sm">[{record.time}]</span>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.town.city + record.town.name)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-retro-accent text-base md:text-lg hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="group-hover:underline">{record.town.city} - {record.town.name}</span>
                  <Map className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </a>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm text-gray-500">
                <span>User: {record.uid.substring(0, 10)}{record.uid.length > 10 ? '...' : ''}</span>
                <span>From: {record.city}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
};

export default App;
