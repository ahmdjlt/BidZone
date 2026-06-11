"use client";

interface PriceFilterProps {
  min: string;
  max: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  onClear: () => void;
}

/** Shared min/max price-range inputs, used in both the dropdown and the drawer. */
export default function PriceFilter({ min, max, onMinChange, onMaxChange, onClear }: PriceFilterProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
          <input
            type="number"
            placeholder="Min"
            aria-label="Minimum price"
            value={min}
            onChange={(e) => onMinChange(e.target.value)}
            className="w-full rounded-lg border border-border-strong bg-surface-alt py-2 pl-7 pr-3 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <span className="text-text-muted">–</span>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
          <input
            type="number"
            placeholder="Max"
            aria-label="Maximum price"
            value={max}
            onChange={(e) => onMaxChange(e.target.value)}
            className="w-full rounded-lg border border-border-strong bg-surface-alt py-2 pl-7 pr-3 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>
      {(min || max) && (
        <button
          type="button"
          onClick={onClear}
          className="mt-3 w-full text-center text-xs font-medium text-accent transition hover:text-accent/80"
        >
          Clear
        </button>
      )}
    </>
  );
}
