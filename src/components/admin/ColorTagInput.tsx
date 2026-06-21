'use client';

import * as React from 'react';
import { X, Plus, Pipette } from 'lucide-react';
import { COLOR_HEX_MAP } from './CategorySubcategoryVariations';

export interface ColorEntry {
  name: string;
  hex: string;
}

interface ColorTagInputProps {
  label: string;
  selected: ColorEntry[];
  onChange: (vals: ColorEntry[]) => void;
  predefinedNames?: readonly string[];
}

function getHex(name: string, overrides: Record<string, string>): string {
  const lower = name.toLowerCase();
  // Check overrides first (custom hex saved by admin)
  for (const [key, val] of Object.entries(overrides)) {
    if (key.toLowerCase() === lower) return val;
  }
  // Check predefined map
  for (const [key, val] of Object.entries(COLOR_HEX_MAP)) {
    if (key.toLowerCase() === lower) return val;
  }
  return '';
}

export function ColorTagInput({
  label,
  selected,
  onChange,
  predefinedNames = ['Black', 'White', 'Red', 'Navy', 'Beige', 'Pink', 'Gold', 'Brown', 'Grey'],
}: ColorTagInputProps) {
  const [showCustom, setShowCustom] = React.useState(false);
  const [customName, setCustomName] = React.useState('');
  const [customHex, setCustomHex] = React.useState('#800000');
  const [hexOverrides, setHexOverrides] = React.useState<Record<string, string>>({});

  // Build a map of all hex values (predefined + overrides)
  const allHexes = React.useMemo(() => {
    const map: Record<string, string> = {};
    predefinedNames.forEach((name) => {
      map[name.toLowerCase()] = getHex(name, hexOverrides);
    });
    selected.forEach((c) => {
      map[c.name.toLowerCase()] = c.hex || getHex(c.name, hexOverrides);
    });
    return map;
  }, [predefinedNames, selected, hexOverrides]);

  const toggle = (name: string) => {
    const existing = selected.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      onChange(selected.filter((c) => c.name.toLowerCase() !== name.toLowerCase()));
    } else {
      const hex = getHex(name, hexOverrides) || '#808080';
      onChange([...selected, { name, hex }]);
    }
  };

  const addCustom = () => {
    const name = customName.trim();
    if (!name) return;
    if (selected.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setCustomName('');
      setCustomHex('#800000');
      setShowCustom(false);
      return;
    }
    const newOverrides = { ...hexOverrides, [name]: customHex };
    setHexOverrides(newOverrides);
    onChange([...selected, { name, hex: customHex }]);
    setCustomName('');
    setCustomHex('#800000');
    setShowCustom(false);
  };

  const updateHex = (name: string, newHex: string) => {
    const newOverrides = { ...hexOverrides, [name]: newHex };
    setHexOverrides(newOverrides);
    onChange(
      selected.map((c) =>
        c.name.toLowerCase() === name.toLowerCase() ? { ...c, hex: newHex } : c
      )
    );
  };

  const remove = (name: string) => {
    onChange(selected.filter((c) => c.name.toLowerCase() !== name.toLowerCase()));
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2 tracking-wider uppercase">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {/* Predefined colors */}
        {predefinedNames.map((opt) => {
          const isSelected = selected.some((c) => c.name.toLowerCase() === opt.toLowerCase());
          const hex = allHexes[opt.toLowerCase()] || '#808080';
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-md transition-all ${
                isSelected
                  ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#0A0A0A]'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <span
                className="inline-block size-3 rounded-full border border-gray-300 shrink-0"
                style={{ backgroundColor: hex || '#808080' }}
              />
              {opt}
            </button>
          );
        })}

        {/* Custom colors */}
        {selected
          .filter((c) => !predefinedNames.some((p) => p.toLowerCase() === c.name.toLowerCase()))
          .map((custom) => (
            <span
              key={custom.name}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-[#C9A84C] bg-[#C9A84C]/10 text-[#0A0A0A] rounded-md group"
            >
              <input
                type="color"
                value={custom.hex || '#808080'}
                onChange={(e) => updateHex(custom.name, e.target.value)}
                className="size-3 rounded-full border-0 cursor-pointer p-0 shrink-0"
                title="Change color"
              />
              {custom.name}
              {!custom.hex || custom.hex === '#808080' ? (
                <span className="text-[9px] text-amber-600 font-semibold">no hex</span>
              ) : null}
              <button
                type="button"
                onClick={() => remove(custom.name)}
                className="ml-0.5 text-gray-400 hover:text-red-500"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}

        {/* Add custom button / inline form */}
        {showCustom ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder="Color name"
              className="w-24 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#C9A84C]"
              autoFocus
            />
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                className="size-6 rounded border border-gray-200 cursor-pointer p-0"
              />
              <span className="text-[10px] text-gray-400 font-mono">{customHex}</span>
            </div>
            <button
              type="button"
              onClick={addCustom}
              className="text-[#C9A84C] hover:text-[#C9A84C]/80"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustom(false);
                setCustomName('');
                setCustomHex('#800000');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:border-[#C9A84C] hover:text-[#C9A84C] rounded-md transition-colors"
          >
            <Plus className="size-3" />
            Add custom
          </button>
        )}
      </div>
    </div>
  );
}
