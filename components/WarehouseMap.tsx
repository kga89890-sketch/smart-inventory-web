
import React from 'react';
import { Material } from '../types';

interface WarehouseMapProps {
  highlightMaterial?: Material;
}

const WarehouseMap: React.FC<WarehouseMapProps> = ({ highlightMaterial }) => {
  const zones = ['A', 'B', 'C', 'D'];
  const shelves = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // 위치 파싱 (D-1-1-1 -> Zone D, Shelf 1)
  const parseLocation = (locStr?: string) => {
    if (!locStr) return null;
    const parts = locStr.split('-');
    return {
      zone: parts[0],
      shelf: parts[1]
    };
  };

  const highlighted = parseLocation(highlightMaterial?.location);

  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          창고 레이아웃 (Zone D 중심)
        </h3>
        {highlightMaterial && (
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">
            {highlightMaterial.location} 탐색 중
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {zones.filter(z => z === 'D' || z === 'C').map((zone) => (
          <div key={zone} className="space-y-2">
            <div className="text-[10px] font-black text-slate-300 uppercase text-center tracking-widest">Zone {zone}</div>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              {shelves.map((shelf) => {
                const isHighlighted = highlighted?.zone === zone && highlighted?.shelf === shelf.toString();
                return (
                  <div 
                    key={shelf}
                    className={`aspect-square rounded-xl transition-all duration-500 flex items-center justify-center text-[9px] font-bold
                      ${isHighlighted 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110 z-10' 
                        : 'bg-white border border-slate-200 text-slate-400 opacity-60'}`}
                  >
                    S{shelf}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-50 flex gap-4 text-[9px] text-slate-400 justify-center">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span>목표 선반</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
          <span>가용 구역</span>
        </div>
      </div>
    </div>
  );
};

export default WarehouseMap;
