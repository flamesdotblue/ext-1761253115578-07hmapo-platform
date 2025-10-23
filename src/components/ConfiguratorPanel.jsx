import { useMemo } from 'react';
import { Settings, Save, Layers } from 'lucide-react';

const MOCK_ISO_CARS = [
  { make: 'Toyota', models: ['Supra', 'Corolla', 'Camry'], years: ['2020','2021','2022','2023'] },
  { make: 'BMW', models: ['M3', 'M4', 'i8'], years: ['2019','2020','2021','2022'] },
  { make: 'Audi', models: ['A4', 'RS7', 'R8'], years: ['2018','2019','2020','2021'] },
];

export default function ConfiguratorPanel({ selection, onSelectionChange, config, onConfigChange, onSave }) {
  const currentMake = useMemo(() => MOCK_ISO_CARS.find(c=>c.make===selection.make) || MOCK_ISO_CARS[0], [selection.make]);

  const updateSel = (patch) => onSelectionChange({ ...selection, ...patch });
  const updateCfg = (patch) => onConfigChange({ ...config, ...patch });

  return (
    <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={18} />
        <h3 className="text-lg font-semibold">Configurator</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-neutral-400">Make</label>
          <select value={selection.make} onChange={(e)=>updateSel({ make: e.target.value, model: MOCK_ISO_CARS.find(m=>m.make===e.target.value)?.models[0]||'', year: MOCK_ISO_CARS.find(m=>m.make===e.target.value)?.years[0]||'' })} className="w-full mt-1 bg-black/30 border border-white/10 rounded px-2 py-2">
            {MOCK_ISO_CARS.map((m)=> <option key={m.make} value={m.make}>{m.make}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-neutral-400">Model</label>
          <select value={selection.model} onChange={(e)=>updateSel({ model: e.target.value })} className="w-full mt-1 bg黑/30 border border-white/10 rounded px-2 py-2">
            {currentMake.models.map((m)=> <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-neutral-400">Year</label>
          <select value={selection.year} onChange={(e)=>updateSel({ year: e.target.value })} className="w-full mt-1 bg-black/30 border border-white/10 rounded px-2 py-2">
            {currentMake.years.map((y)=> <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="my-4 h-px bg-white/10" />

      <div className="space-y-4">
        <div>
          <label className="text-xs text-neutral-400">Body Color</label>
          <input type="color" value={config.bodyColor} onChange={(e)=>updateCfg({ bodyColor: e.target.value })} className="mt-1 w-full h-10 bg-black/30 border border-white/10 rounded" />
        </div>
        <div>
          <label className="text-xs text-neutral-400">Interior Glow Color</label>
          <input type="color" value={config.interiorColor} onChange={(e)=>updateCfg({ interiorColor: e.target.value })} className="mt-1 w-full h-10 bg-black/30 border border-white/10 rounded" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-neutral-400">Wheel Size</label>
            <span className="text-xs text-neutral-300">{config.wheelSize.toFixed(2)}x</span>
          </div>
          <input type="range" min={0.8} max={1.5} step={0.02} value={config.wheelSize} onChange={(e)=>updateCfg({ wheelSize: parseFloat(e.target.value) })} className="w-full" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} />
            <span className="text-sm">Spoiler</span>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={config.spoiler} onChange={(e)=>updateCfg({ spoiler: e.target.checked })} className="sr-only" />
            <span className="w-11 h-6 bg-white/10 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full transition-all" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }} />
          </label>
        </div>
      </div>

      <button onClick={onSave} className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 transition">
        <Save size={16} /> Save Design
      </button>
    </div>
  );
}
