const stepLabels = ['Event basics', 'What you need', 'Final details', 'Review & post'];

export function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[.18em] text-slate-400">
        <span>Step {step} of 4</span>
        <span>{stepLabels[step - 1]}</span>
      </div>
      <div className="grid grid-cols-4 gap-2" aria-label={`Step ${step} of 4`}>
        {stepLabels.map((label, index) => (
          <div key={label} className={`h-1 rounded-full ${index < step ? 'bg-[#d7ff4f]' : 'bg-slate-700'}`} />
        ))}
      </div>
    </div>
  );
}
