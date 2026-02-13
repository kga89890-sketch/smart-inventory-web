
import React, { useState, useMemo, useEffect } from 'react';
import { Material, AppMode, SearchResult } from './types';
import { searchMaterialWithAI, identifyMaterialFromImage } from './services/geminiService';
import WarehouseMap from './components/WarehouseMap';

// 대용량 실제 데이터 (일부 생략되었으나 전체가 로드되어 있다고 가정)
const REAL_INVENTORY: Material[] = [
  { "pn_code": "6E2245C0", "location": "D-1-1-1", "label_spec": "MCR03 EZP F 3.3K", "erp_spec": "3.3K/F/1608", "match": { "primary_tokens": ["3.3K", "EZP"], "secondary_tokens": ["MCR03"], "erp_tokens": ["1608", "3.3K"] } },
  { "pn_code": "6E2246C0", "location": "D-1-1-2", "label_spec": "MCR03 EZP F 13K", "erp_spec": "13K/F/1608", "match": { "primary_tokens": ["13K", "EZP"], "secondary_tokens": ["MCR13"], "erp_tokens": ["13K", "1608"] } },
  { "pn_code": "6E2247C0", "location": "D-1-1-3", "label_spec": "MCR03 EZP J 100K", "erp_spec": "100K/J/1608", "match": { "primary_tokens": ["100K", "EZP"], "secondary_tokens": ["MCR03"], "erp_tokens": ["100K", "1608"] } },
  { "pn_code": "6E2253C0", "location": "D-1-1-4", "label_spec": "MCR03 EZP J 510K", "erp_spec": "510K/J/1608", "match": { "primary_tokens": ["510K", "EZP"], "secondary_tokens": ["MCR03"], "erp_tokens": ["1608", "510K"] } },
  { "pn_code": "6E2254C0", "location": "D-1-1-5", "label_spec": "MCR10 EZP J 560K", "erp_spec": "560㏀/J/2012", "match": { "primary_tokens": ["560K", "EZP"], "secondary_tokens": ["MCR10"], "erp_tokens": ["2012", "560㏀"] } },
  { "pn_code": "6E0466C0", "location": "D-1-1-6", "label_spec": "0805 100K 10/0", "erp_spec": "100K/F/2012", "match": { "primary_tokens": ["0805", "10"], "secondary_tokens": ["100K"], "erp_tokens": ["100K", "2012"] } },
  { "pn_code": "6E0467C0", "location": "D-1-1-7", "label_spec": "MCR10 EZP F 3K", "erp_spec": "3㏀/F/2012,1/8W", "match": { "primary_tokens": ["3K", "EZP"], "secondary_tokens": ["MCR10"], "erp_tokens": ["2012", "3㏀", "8W"] } },
  { "pn_code": "6E0470C0", "location": "D-1-1-8", "label_spec": "MCR10 EZP F 10K", "erp_spec": "10㏀/F/2012,1/8W", "match": { "primary_tokens": ["10K", "EZP"], "secondary_tokens": ["MCR10"], "erp_tokens": ["10㏀", "2012", "8W"] } },
  { "pn_code": "6E0477C0", "location": "D-1-1-9", "label_spec": "MCR03 EZP J 1K", "erp_spec": "1K/J/1608,1/10W", "match": { "primary_tokens": ["1K", "EZP"], "secondary_tokens": ["MCR03"], "erp_tokens": ["10W", "1608", "1K"] } },
  { "pn_code": "6E0478C0", "location": "D-1-1-10", "label_spec": "MCR03 EZP F 3K", "erp_spec": "3K/F/1608,1/10W", "match": { "primary_tokens": ["3K", "EZP"], "secondary_tokens": ["MCR03"], "erp_tokens": ["10W", "1608", "3K"] } },
  { "pn_code": "6E2255C0", "location": "D-1-2-1", "label_spec": "MCR10 EZP J 56K", "erp_spec": "56㏀/J/2012", "match": { "primary_tokens": ["56K", "EZP"], "secondary_tokens": ["MCR10"], "erp_tokens": ["2012", "56㏀"] } },
  { "pn_code": "6E2263C0", "location": "D-1-2-3", "label_spec": "MCR03 EZP F 680R", "erp_spec": "680Ω/F/1608", "match": { "primary_tokens": ["680R", "EZP"], "secondary_tokens": ["MCR03"], "erp_tokens": ["1608", "680Ω"] } },
  { "pn_code": "6E0479C0", "location": "D-1-2-6", "label_spec": "MCR03 EZP J 10K", "erp_spec": "10K/J/1608,1/10W", "match": { "primary_tokens": ["10K", "EZP"], "secondary_tokens": ["MCR03"], "erp_tokens": ["10K", "10W", "1608"] } },
  { "pn_code": "6E0480C0", "location": "D-1-2-7", "label_spec": "MCR03 EZP J 510R", "erp_spec": "510Ω/J/1608,1/10W", "match": { "primary_tokens": ["510R", "EZP"], "secondary_tokens": ["MCR03"], "erp_tokens": ["10W", "1608", "510Ω"] } },
  { "pn_code": "6E0481C0", "location": "D-1-2-8", "label_spec": "MCR50 EZP J 10R", "erp_spec": "10Ω/J/5025,1/2W", "match": { "primary_tokens": ["10R", "EZP"], "secondary_tokens": ["MCR50"], "erp_tokens": ["10Ω", "2W", "5025"] } },
  { "pn_code": "6E0483C0", "location": "D-1-2-9", "label_spec": "MCR03 EZP J 4.7K", "erp_spec": "4.7K/J/1608,1/10W", "match": { "primary_tokens": ["4.7K", "EZP"], "secondary_tokens": ["MCR03"], "erp_tokens": ["10W", "1608", "4.7K"] } },
  { "pn_code": "6E0486C0", "location": "D-1-2-10", "label_spec": "MCR03  J 0R 0R", "erp_spec": "0Ω 1608 (JUMPER)", "match": { "primary_tokens": ["0R", "MCR03"], "secondary_tokens": [], "erp_tokens": ["(JUMPER)", "0Ω", "1608"] } },
  { "pn_code": "6E2264C0", "location": "D-1-3-1", "label_spec": "MCR18 J 103 10K", "erp_spec": "10K/J/3216", "match": { "primary_tokens": ["103", "10K"], "secondary_tokens": ["MCR18"], "erp_tokens": ["10K", "3216"] } },
  { "pn_code": "6E2265C0", "location": "D-1-3-2", "label_spec": "MCR03  J 103 100K", "erp_spec": "100K/F/1608", "match": { "primary_tokens": ["100K", "103"], "secondary_tokens": ["MCR03"], "erp_tokens": ["100K", "1608"] } },
  { "pn_code": "6E2266C0", "location": "D-1-3-3", "label_spec": "MCR03  J 393 39K", "erp_spec": "39K/J/1608", "match": { "primary_tokens": ["393", "39K"], "secondary_tokens": ["MCR03"], "erp_tokens": ["1608", "39K"] } },
  { "pn_code": "6E0494C0", "location": "D-1-3-4", "label_spec": "0805 4K7 50/0", "erp_spec": "4.7㏀/J/2012,1/8W", "match": { "primary_tokens": ["0805", "4K7"], "secondary_tokens": ["50"], "erp_tokens": ["2012", "4.7㏀", "8W"] } },
  { "pn_code": "6E2268C0", "location": "D-1-3-5", "label_spec": "MCR03 2RO 2R", "erp_spec": "2Ω/J/1608", "match": { "primary_tokens": ["2R", "2RO"], "secondary_tokens": ["MCR03"], "erp_tokens": ["1608", "2Ω"] } },
  { "pn_code": "6E0484C0", "location": "D-1-3-6", "label_spec": "MCR03 J 122 1.2K", "erp_spec": "1.2㏀/J/1608,1/10W", "match": { "primary_tokens": ["1.2K", "122"], "secondary_tokens": ["MCR03"], "erp_tokens": ["1.2㏀", "10W", "1608"] } },
  { "pn_code": "6E0492C0", "location": "D-1-3-7", "label_spec": "MCR10 J 103 10K", "erp_spec": "10㏀/J/2012,1/8W", "match": { "primary_tokens": ["103", "10K"], "secondary_tokens": ["MCR10"], "erp_tokens": ["10㏀", "2012", "8W"] } },
  { "pn_code": "EL0266C0", "location": "D-1-3-10", "label_spec": "GCM188L81H103KA", "erp_spec": "103/K/50V/1608", "match": { "primary_tokens": ["GCM188L81H103KA"], "secondary_tokens": [], "erp_tokens": ["103", "1608", "50V"] } },
  { "pn_code": "6E2269C0", "location": "D-1-4-1", "label_spec": "MCR03 J 201 200R", "erp_spec": "200R/J/1608", "match": { "primary_tokens": ["200R", "201"], "secondary_tokens": ["MCR03"], "erp_tokens": ["1608", "200R"] } },
  { "pn_code": "6E2270C0", "location": "D-1-4-2", "label_spec": "MCR03 J 430 43R", "erp_spec": "43Ω/J/1608", "match": { "primary_tokens": ["430", "43R"], "secondary_tokens": ["MCR03"], "erp_tokens": ["1608", "43Ω"] } },
  { "pn_code": "6E2261C0", "location": "D-1-4-3", "label_spec": "MCR18 J 101 100R", "erp_spec": "100R/J/3216", "match": { "primary_tokens": ["100R", "101"], "secondary_tokens": ["MCR18"], "erp_tokens": ["100R", "3216"] } },
  { "pn_code": "6E2267C0", "location": "D-1-4-4", "label_spec": "MCR03 J 563 56K", "erp_spec": "56K/J/1608", "match": { "primary_tokens": ["563", "56K"], "secondary_tokens": ["MCR03"], "erp_tokens": ["1608", "56K"] } },
  { "pn_code": "6E2243C0", "location": "D-1-4-6", "label_spec": "MCR03 FX 3602 36K", "erp_spec": "36K/F/1608", "match": { "primary_tokens": ["3602", "36K"], "secondary_tokens": ["FX", "MCR03"], "erp_tokens": ["1608", "36K"] } },
  { "pn_code": "6E0499C0", "location": "D-1-4-7", "label_spec": "MCR03 J 151 150R", "erp_spec": "150Ω/J/1608,1/10W", "match": { "primary_tokens": ["150R", "151"], "secondary_tokens": ["MCR03"], "erp_tokens": ["10W", "150OHM", "1608"] } },
  { "pn_code": "6E2201C0", "location": "D-1-4-8", "label_spec": "MCR10 F 2003 200K", "erp_spec": "200㏀/F/2012", "match": { "primary_tokens": ["2003", "200K"], "secondary_tokens": ["MCR10"], "erp_tokens": ["200㏀", "2012"] } },
  { "pn_code": "6E2202C0", "location": "D-1-4-9", "label_spec": "MCR10 F 32.4K", "erp_spec": "32.4㏀/F/2012(공용)", "match": { "primary_tokens": ["32.4K", "MCR10"], "secondary_tokens": [], "erp_tokens": ["2012(공용)", "32.4㏀"] } },
  { "pn_code": "6E2203C0", "location": "D-1-4-10", "label_spec": "MCR10 F 3301 3.3K", "erp_spec": "3.3㏀/F/2012", "match": { "primary_tokens": ["3.3K", "3301"], "secondary_tokens": ["MCR10"], "erp_tokens": ["2012", "3.3㏀"] } },
  { "pn_code": "6E2278C0", "location": "D-1-5-1", "label_spec": "MCR03 F 1802 18K", "erp_spec": "18K/F/1608", "match": { "primary_tokens": ["1802", "18K"], "secondary_tokens": ["MCR03"], "erp_tokens": ["1608", "18K"] } },
  { "pn_code": "6E2279C0", "location": "D-1-5-2", "label_spec": "MCR03 F 1201 1.2K", "erp_spec": "1.2K/F/1608", "match": { "primary_tokens": ["1.2K", "1201"], "secondary_tokens": ["MCR03"], "erp_tokens": ["1.2K", "1608"] } },
  { "pn_code": "6E2280C0", "location": "D-1-5-3", "label_spec": "MCR18 J 820 82R", "erp_spec": "82Ω/J/3216", "match": { "primary_tokens": ["820", "82R"], "secondary_tokens": ["MCR18"], "erp_tokens": ["3216", "82Ω"] } },
  { "pn_code": "6E2282C0", "location": "D-1-5-4", "label_spec": "MCR18 J 202 2K", "erp_spec": "2K/J/3216", "match": { "primary_tokens": ["202", "2K"], "secondary_tokens": ["MCR18"], "erp_tokens": ["2K", "3216"] } },
  { "pn_code": "6E2205C0", "location": "D-1-5-7", "label_spec": "MCR18 J 220 22R", "erp_spec": "22Ω/J/3216(공용)", "match": { "primary_tokens": ["220", "22R"], "secondary_tokens": ["MCR18"], "erp_tokens": ["22Ω", "3216(공용)"] } },
  { "pn_code": "6E2206C0", "location": "D-1-5-8", "label_spec": "MCR18 J 751 750R", "erp_spec": "750Ω/J/3216", "match": { "primary_tokens": ["750R", "751"], "secondary_tokens": ["MCR18"], "erp_tokens": ["3216", "750Ω"] } },
  { "pn_code": "6E2207C0", "location": "D-1-5-9", "label_spec": "MCR03 J 101 100R", "erp_spec": "100R/J/1608", "match": { "primary_tokens": ["100R", "101"], "secondary_tokens": ["MCR03"], "erp_tokens": ["100R", "1608"] } },
  { "pn_code": "6E2216C0", "location": "D-1-6-1", "label_spec": "MCR10 F 1302 13K", "erp_spec": "13㏀/F/2012(공용)", "match": { "primary_tokens": ["1302", "13K"], "secondary_tokens": ["MCR10"], "erp_tokens": ["13㏀", "2012(공용)"] } },
  { "pn_code": "6E2285C0", "location": "D-1-6-2", "label_spec": "MCR18 J 272 2.7K", "erp_spec": "2.7K/J/3216", "match": { "primary_tokens": ["2.7K", "272"], "secondary_tokens": ["MCR18"], "erp_tokens": ["2.7K", "3216"] } },
  { "pn_code": "EL0167C0", "location": "D-1-6-3", "label_spec": "SA7V", "erp_spec": "SA7V", "match": { "primary_tokens": ["SA7V"], "secondary_tokens": [], "erp_tokens": ["SA7V"] } },
  { "pn_code": "EL0168C0", "location": "D-1-6-4", "label_spec": "1N4148WV", "erp_spec": "1N4148WV", "match": { "primary_tokens": ["1N4148WV"], "secondary_tokens": [], "erp_tokens": ["1N4148WV"] } },
  { "pn_code": "EL0169C0", "location": "D-1-6-5", "label_spec": "CME-CSCF4532B-510T20", "erp_spec": "CME-CSCF4532B-510T20", "match": { "primary_tokens": ["510T20", "CME"], "secondary_tokens": ["CSCF4532B"], "erp_tokens": ["510T20", "CME", "CSCF4532B"] } },
  { "pn_code": "6E2209C0", "location": "D-1-6-6", "label_spec": "MCR10 J 101 100R", "erp_spec": "100Ω/J/2012", "match": { "primary_tokens": ["100R", "101"], "secondary_tokens": ["MCR10"], "erp_tokens": ["100Ω", "2012"] } },
  { "pn_code": "6E0493C0", "location": "D-1-6-7", "label_spec": "0805 7K5 JTL", "erp_spec": "7.5㏀/J/2012,1/8W", "match": { "primary_tokens": ["0805", "7K5"], "secondary_tokens": ["JTL"], "erp_tokens": ["2012", "7.5㏀", "8W"] } },
  { "pn_code": "EL0208C0", "location": "D-1-6-8", "label_spec": "MCR03 J 220 22R", "erp_spec": "22R/J/1608", "match": { "primary_tokens": ["220", "22R"], "secondary_tokens": ["MCR03"], "erp_tokens": ["1608", "22R"] } },
  { "pn_code": "EL0024C0", "location": "D-1-6-9", "label_spec": "0603 470K JTL", "erp_spec": "470K/J/1608", "match": { "primary_tokens": ["0603", "470K"], "secondary_tokens": ["JTL"], "erp_tokens": ["1608", "470K"] } },
  { "pn_code": "EL0007C0", "location": "D-1-6-10", "label_spec": "0603 2K0 JTL", "erp_spec": "2K/J/1608", "match": { "primary_tokens": ["0603", "2K0"], "secondary_tokens": ["JTL"], "erp_tokens": ["1608", "2K"] } },
];

const App: React.FC = () => {
  const [inventory, setInventory] = useState<Material[]>(REAL_INVENTORY);
  const [mode, setMode] = useState<AppMode>(AppMode.SEARCH);
  const [inputValue, setInputValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // 엑셀식 다중 필터 로직 (AND 조건)
  const filteredInventory = useMemo(() => {
    if (activeFilters.length === 0) return inventory;

    return inventory.filter(m => {
      return activeFilters.every(filter => {
        const lowerFilter = filter.toLowerCase();
        return (
          m.pn_code.toLowerCase().includes(lowerFilter) ||
          m.label_spec.toLowerCase().includes(lowerFilter) ||
          m.erp_spec.toLowerCase().includes(lowerFilter) ||
          m.location.toLowerCase().includes(lowerFilter) ||
          m.match.primary_tokens.some(t => t.toLowerCase().includes(lowerFilter)) ||
          m.match.secondary_tokens.some(t => t.toLowerCase().includes(lowerFilter)) ||
          m.match.erp_tokens.some(t => t.toLowerCase().includes(lowerFilter))
        );
      });
    });
  }, [inventory, activeFilters]);

  useEffect(() => {
    if (updateMessage) {
      const timer = setTimeout(() => setUpdateMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [updateMessage]);

  const addFilter = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !activeFilters.includes(trimmed)) {
      setActiveFilters(prev => [...prev, trimmed]);
      setInputValue('');
    }
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setPreviewImage(reader.result as string);
      setLoading(true);
      setSearchResult(null);
      try {
        const result = await identifyMaterialFromImage(base64, inventory);
        setSearchResult(result);
      } catch (error) {
        console.error("Image analysis failed:", error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleJsonDataUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          setInventory(json);
          setUpdateMessage({ text: "새로운 DB 로드 완료", type: 'success' });
        }
      } catch (error: any) {
        setUpdateMessage({ text: "DB 로드 실패", type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 overflow-hidden">
      {/* Mobile Top Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-slate-100 z-30">
        <h1 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px]">AI</span>
          Smart Inventory
        </h1>
        <div className="flex gap-2">
          {mode === AppMode.INVENTORY && (
            <label className="p-2 bg-slate-100 rounded-full active:bg-slate-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <input type="file" className="hidden" accept=".json" onChange={handleJsonDataUpload} />
            </label>
          )}
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 pb-24 overflow-y-auto px-5 pt-4">
        {updateMessage && (
          <div className="mb-4 p-3 rounded-xl bg-slate-900 text-white text-xs font-bold text-center animate-in fade-in slide-in-from-top-2">
            {updateMessage.text}
          </div>
        )}

        {mode === AppMode.SEARCH && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">다중 필터 검색</h2>
              <p className="text-sm text-slate-500">사양을 하나씩 추가하여 자재를 좁혀보세요.</p>
            </div>

            {/* Excel-like Filtering Interface */}
            <div className="space-y-3">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-2 transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {activeFilters.map(filter => (
                    <span key={filter} className="bg-blue-600 text-white pl-3 pr-1 py-1 rounded-lg text-xs font-bold flex items-center gap-1 animate-in zoom-in-95">
                      {filter}
                      <button onClick={() => removeFilter(filter)} className="p-1 hover:bg-blue-700 rounded-md">✕</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder={activeFilters.length > 0 ? "사양 추가 입력..." : "예: 100K, 1608, MCR..."}
                    className="flex-1 px-3 py-3 text-sm outline-none bg-transparent"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addFilter(inputValue);
                    }}
                  />
                  <button 
                    onClick={() => addFilter(inputValue)}
                    className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold active:bg-slate-200 transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>

              {activeFilters.length > 0 && (
                <div className="flex items-center justify-between px-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    결과 <span className="text-blue-600">{filteredInventory.length}건</span>
                  </div>
                  <button onClick={() => setActiveFilters([])} className="text-[10px] font-bold text-red-500">전체 삭제</button>
                </div>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2">
              {['MCR03', '100K', '1608', 'EZP', 'D-1'].map(tag => (
                <button 
                  key={tag} 
                  onClick={() => addFilter(tag)} 
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    activeFilters.includes(tag) ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-white text-slate-600 border border-slate-200 active:bg-slate-50'
                  }`}
                >
                  +{tag}
                </button>
              ))}
            </div>

            {/* Filtered Result List Inline for Search Mode */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest px-1">실시간 매칭 목록</h3>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
                {filteredInventory.length > 0 ? (
                  filteredInventory.slice(0, 50).map(m => (
                    <div key={m.pn_code} className="p-4 flex items-center justify-between active:bg-slate-50 transition-colors" onClick={() => { setSearchResult({ matchFound: true, material: m, explanation: "필터 검색 결과" }); setMode(AppMode.MAP); }}>
                      <div className="space-y-0.5 flex-1 pr-4">
                        <div className="text-xs font-black text-blue-600 font-mono">{m.pn_code}</div>
                        <div className="text-sm font-bold text-slate-900 leading-tight">{m.label_spec}</div>
                        <div className="text-[10px] text-slate-400 truncate">{m.erp_spec}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-bold mb-1">{m.location}</div>
                        <div className="text-[10px] text-slate-300 font-mono">D-ZONE</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-400 text-sm">조건에 맞는 자재가 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {mode === AppMode.VISION && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">비전 분석</h2>
              <p className="text-sm text-slate-500">라벨 사진을 찍어 위치를 확인하세요.</p>
            </div>
            <div className={`relative border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[300px] transition-all ${previewImage ? 'bg-white shadow-inner' : 'bg-slate-50'}`}>
              {previewImage ? (
                <div className="relative w-full">
                  <img src={previewImage} alt="Preview" className="w-full h-auto rounded-2xl shadow-lg" />
                  <button onClick={() => setPreviewImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-90">✕</button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-3xl">📱</div>
                  <label className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all">
                    라벨 촬영하기
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  <p className="text-xs text-slate-400 mt-4">AI가 데이터 시트와 대조합니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === AppMode.INVENTORY && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">전체 부품 데이터 ({inventory.length})</h2>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
              {inventory.map(m => (
                <div key={m.pn_code} className="p-4 flex items-center justify-between active:bg-slate-50 transition-colors" onClick={() => { setSearchResult({ matchFound: true, material: m, explanation: "리스트에서 직접 선택" }); setMode(AppMode.MAP); }}>
                  <div className="space-y-0.5 flex-1 pr-4">
                    <div className="text-xs font-black text-blue-600 font-mono">{m.pn_code}</div>
                    <div className="text-sm font-bold text-slate-900 leading-tight">{m.label_spec}</div>
                    <div className="text-[10px] text-slate-400 truncate">{m.erp_spec}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-bold mb-1">{m.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === AppMode.MAP && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">실시간 위치 안내</h2>
            <WarehouseMap highlightMaterial={searchResult?.material} />
            {searchResult?.material && (
              <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-lg shadow-blue-50 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">탐색 중</div>
                  <div className="text-xs font-mono font-bold text-slate-400">{searchResult.material.pn_code}</div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg leading-tight">{searchResult.material.label_spec}</h3>
                  <p className="text-xs text-slate-500">{searchResult.material.erp_spec}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                    <div className="text-[10px] text-blue-400 font-bold mb-0.5">상세 보관 위치</div>
                    <div className="text-lg font-black text-blue-700">{searchResult.material.location}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold mb-0.5">자재 관리 팁</div>
                    <div className="text-[10px] font-bold text-slate-600 leading-tight">D구역 선반 하단에서 3번째 칸 확인 요망.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Vision Loading / Result Panel */}
        {(loading || (searchResult && mode === AppMode.VISION)) && (
          <div className="fixed inset-x-5 bottom-28 animate-in slide-in-from-bottom-8 duration-500 z-40">
            <div className={`p-5 rounded-[2.5rem] border shadow-2xl ${loading ? 'bg-white/90 backdrop-blur border-slate-100' : 'bg-white border-blue-50'}`}>
              {loading ? (
                <div className="flex items-center gap-4 py-2">
                  <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-bold text-slate-700">AI가 이미지를 정밀 대조 중...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-slate-900 text-white text-[9px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">Recognition Successful</div>
                    <button onClick={() => setSearchResult(null)} className="text-slate-300 w-6 h-6 flex items-center justify-center">✕</button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl">✨</div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-bold text-slate-900 truncate">{searchResult?.material?.label_spec || "미식별"}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{searchResult?.explanation}</p>
                    </div>
                  </div>
                  {searchResult?.material && (
                    <button 
                      onClick={() => setMode(AppMode.MAP)}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all text-sm"
                    >
                      위치 바로보기 ({searchResult.material.location})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 px-6 py-3 safe-area-bottom flex justify-between items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <NavBtn active={mode === AppMode.SEARCH} onClick={() => setMode(AppMode.SEARCH)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} label="검색" />
        <NavBtn active={mode === AppMode.VISION} onClick={() => setMode(AppMode.VISION)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>} label="비전" />
        <NavBtn active={mode === AppMode.INVENTORY} onClick={() => setMode(AppMode.INVENTORY)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} label="재고" />
        <NavBtn active={mode === AppMode.MAP} onClick={() => setMode(AppMode.MAP)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} label="위치" />
      </nav>
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-blue-600 scale-110' : 'text-slate-300'}`}
  >
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default App;
