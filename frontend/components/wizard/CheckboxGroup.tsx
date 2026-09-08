type CheckboxGroupProps = {
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
};

export function CheckboxGroup({ options, value, onChange, label }: CheckboxGroupProps) {
  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2" aria-label={label}>
      {options.map((option) => {
        const checked = value.includes(option);
        return (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-sm transition ${checked ? 'border-[#d7ff4f] bg-[#d7ff4f]/10 text-white' : 'border-[#26334b] bg-[#090f1b] text-slate-300 hover:border-slate-500'}`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(option)}
              className="h-4 w-4 accent-[#c9fb3b]"
            />
            {option}
          </label>
        );
      })}
    </div>
  );
}
