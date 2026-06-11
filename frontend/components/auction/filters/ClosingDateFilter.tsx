"use client";

export interface ClosingDateOption<V extends string = string> {
  label: string;
  value: V;
}

interface ClosingDateFilterProps<V extends string = string> {
  options: readonly ClosingDateOption<V>[];
  value: V;
  onChange: (value: V) => void;
}

/** Shared radio-style list of closing-date options. */
export default function ClosingDateFilter<V extends string = string>({
  options,
  value,
  onChange,
}: ClosingDateFilterProps<V>) {
  return (
    <div className="flex flex-col gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
            value === opt.value
              ? "bg-accent font-medium text-white"
              : "text-text-heading hover:bg-accent-soft"
          }`}
        >
          <span
            className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
              value === opt.value ? "border-white" : "border-border-strong"
            }`}
          >
            {value === opt.value && <span className="h-2 w-2 rounded-full bg-white" />}
          </span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
