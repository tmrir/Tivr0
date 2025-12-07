import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandAsset, DesignElement } from '../types';
import { INITIAL_TEMPLATES } from '../services/designTemplates';
import { Save, Move, Type, Image as ImageIcon, Square, Monitor, Smartphone, Layout, CreditCard, Tag, LucideProps } from 'lucide-react';
import * as Icons from 'lucide-react';

export const BrandIdentity = () => {
    const { t, lang } = useApp();
    const [assets, setAssets] = useState<BrandAsset[]>(INITIAL_TEMPLATES);
    const [selectedAssetId, setSelectedAssetId] = useState<string>(INITIAL_TEMPLATES[0].id);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    const activeAsset = assets.find(a => a.id === selectedAssetId);

    const updateElement = (elId: string, updates: Partial<DesignElement>) => {
        if (!activeAsset) return;
        const newElements = activeAsset.elements.map(el => 
            el.id === elId ? { ...el, ...updates } : el
        );
        const newAssets = assets.map(a => 
            a.id === activeAsset.id ? { ...a, elements: newElements } : a
        );
        setAssets(newAssets);
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'logo': return <Layout size={18}/>;
            case 'favicon': return <Monitor size={18}/>;
            case 'app_icon': return <Smartphone size={18}/>;
            case 'poster': return <Layout size={18}/>;
            case 'stationery': return <Tag size={18}/>;
            default: return <Square size={18}/>;
        }
    };

    const RenderIcon = ({ name, style }: { name: string, style?: any }) => {
        const Icon = (Icons as any)[name] || Icons.HelpCircle;
        // Convert style strings to numbers if needed for SVG width/height, though CSS style works usually
        return <Icon style={style} />;
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
            {/* Sidebar Assets List */}
            <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto">
                <div className="p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">{t('admin.brand.assets')}</h3>
                </div>
                <div>
                    {assets.map(asset => (
                        <button 
                            key={asset.id}
                            onClick={() => setSelectedAssetId(asset.id)}
                            className={`w-full text-left p-3 flex items-center gap-3 text-sm hover:bg-slate-50 transition border-l-4 ${selectedAssetId === asset.id ? 'border-tivro-primary bg-slate-50 font-bold' : 'border-transparent'}`}
                        >
                            <span className="text-slate-500">{getIcon(asset.type)}</span>
                            {asset.name[lang]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 flex flex-col relative bg-slate-100 overflow-hidden">
                <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                    <h2 className="font-bold text-lg">{activeAsset?.name[lang]}</h2>
                    <div className="flex gap-2">
                        <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                            <Save size={16}/> {t('admin.btn.save')}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-10 flex items-center justify-center bg-slate-200/50">
                    {activeAsset && (
                        <div 
                            className="bg-white shadow-2xl relative transition-all duration-300 overflow-hidden"
                            style={{ 
                                width: activeAsset.width, 
                                height: activeAsset.height, 
                                transform: `scale(${Math.min(1, 600 / activeAsset.width)})`,
                                transformOrigin: 'center center' 
                            }}
                            onClick={() => setSelectedElementId(null)}
                        >
                            {activeAsset.elements.map(el => (
                                <div
                                    key={el.id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                                    className={`absolute cursor-move select-none group ${selectedElementId === el.id ? 'ring-2 ring-blue-500 z-50' : 'z-10'}`}
                                    style={{
                                        left: el.x,
                                        top: el.y,
                                        ...el.style,
                                        width: el.type === 'shape' || el.type === 'image' ? el.style.width : 'auto',
                                        height: el.type === 'shape' || el.type === 'image' ? el.style.height : 'auto',
                                    }}
                                >
                                    {el.type === 'text' && (
                                        <span style={{whiteSpace: 'nowrap'}}>{el.content}</span>
                                    )}
                                    {el.type === 'image' && (
                                        <img src={el.content} className="w-full h-full object-cover pointer-events-none" alt="" />
                                    )}
                                    {el.type === 'shape' && (
                                        <div style={{width:'100%', height:'100%', borderRadius: el.style.borderRadius, backgroundColor: el.style.backgroundColor}}></div>
                                    )}
                                    {el.type === 'icon' && (
                                        <RenderIcon name={el.content} style={{ width: '100%', height: '100%', color: el.style.color }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Properties Panel */}
            <div className="w-72 bg-white border-l border-slate-200 p-4 overflow-y-auto">
                <h3 className="font-bold text-sm text-slate-800 mb-4 uppercase tracking-wider">{t('admin.brand.properties')}</h3>
                
                {selectedElementId ? (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-slate-50 p-3 rounded text-xs text-slate-500 mb-2">
                             Selected: <span className="font-bold text-slate-800">{activeAsset?.elements.find(e => e.id === selectedElementId)?.type.toUpperCase()}</span> ({selectedElementId})
                        </div>

                        {activeAsset?.elements.find(e => e.id === selectedElementId)?.type === 'text' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Text Content</label>
                                <input 
                                    className="w-full border p-2 rounded text-sm" 
                                    value={activeAsset.elements.find(e => e.id === selectedElementId)?.content}
                                    onChange={(e) => updateElement(selectedElementId, { content: e.target.value })}
                                />
                                <label className="block text-xs font-bold text-slate-500 mt-2 mb-1">Font Size</label>
                                <input 
                                    className="w-full border p-2 rounded text-sm" 
                                    value={activeAsset.elements.find(e => e.id === selectedElementId)?.style.fontSize}
                                    onChange={(e) => updateElement(selectedElementId, { style: { ...activeAsset.elements.find(x=>x.id===selectedElementId)?.style, fontSize: e.target.value } })}
                                />
                            </div>
                        )}
                        
                        {activeAsset?.elements.find(e => e.id === selectedElementId)?.type === 'icon' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Icon Name (Lucide)</label>
                                <input 
                                    className="w-full border p-2 rounded text-sm" 
                                    value={activeAsset.elements.find(e => e.id === selectedElementId)?.content}
                                    onChange={(e) => updateElement(selectedElementId, { content: e.target.value })}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Color</label>
                            <input 
                                type="color"
                                className="w-full h-10 border rounded cursor-pointer" 
                                onChange={(e) => {
                                    const el = activeAsset?.elements.find(x => x.id === selectedElementId);
                                    if(el) updateElement(selectedElementId, { style: { ...el.style, color: e.target.value, backgroundColor: el.type==='shape'?e.target.value : undefined } })
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">X Position</label>
                                <input type="number" className="w-full border p-2 rounded text-sm" 
                                    value={activeAsset?.elements.find(e => e.id === selectedElementId)?.x}
                                    onChange={(e) => updateElement(selectedElementId, { x: parseInt(e.target.value) })}
                                />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Y Position</label>
                                <input type="number" className="w-full border p-2 rounded text-sm" 
                                    value={activeAsset?.elements.find(e => e.id === selectedElementId)?.y}
                                    onChange={(e) => updateElement(selectedElementId, { y: parseInt(e.target.value) })}
                                />
                             </div>
                        </div>
                        <button onClick={() => setSelectedElementId(null)} className="w-full mt-4 border border-slate-300 text-slate-600 py-2 rounded text-sm font-bold hover:bg-slate-50">Deselect Element</button>
                    </div>
                ) : (
                    <div className="text-sm text-slate-400 text-center py-10 flex flex-col items-center">
                        <Move size={32} className="mb-2 opacity-20"/>
                        Select an element on the canvas to edit its properties.
                    </div>
                )}
            </div>
        </div>
    );
};