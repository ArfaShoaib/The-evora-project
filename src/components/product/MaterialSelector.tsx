"use client";

interface MaterialSelectorProps {
  materials: string[];
  selectedMaterial?: string;
  onSelect?: (material: string) => void;
  label?: string;
}

export function MaterialSelector({ materials, selectedMaterial, onSelect, label = "Material" }: MaterialSelectorProps) {
  if (materials.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-3">
        {label}{selectedMaterial ? ` — ${selectedMaterial}` : ''}
      </p>
      <div className="flex flex-wrap gap-2">
        {materials.map((material) => {
          const isSelected = selectedMaterial === material;
          return (
            <button
              key={material}
              type="button"
              onClick={() => onSelect?.(material)}
              className={`px-4 py-2 text-sm font-medium border rounded-lg transition-all ${
                isSelected
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-border text-muted-foreground hover:border-gold/50 hover:text-foreground'
              }`}
            >
              {material}
            </button>
          );
        })}
      </div>
    </div>
  );
}
