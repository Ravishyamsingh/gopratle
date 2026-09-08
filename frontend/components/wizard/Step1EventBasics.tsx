import { useFormContext } from 'react-hook-form';
import { eventTypes, type Category, type RequirementFormValues } from '@/lib/types';

const categoryCards: { value: Category; eyebrow: string; title: string; copy: string; mark: string }[] = [
  { value: 'planner', eyebrow: 'Plan it end-to-end', title: 'Event Planner', copy: 'Planning, design, vendors and coordination.', mark: '✦' },
  { value: 'performer', eyebrow: 'Set the mood', title: 'Performer', copy: 'Music, hosts and memorable live moments.', mark: '♫' },
  { value: 'crew', eyebrow: 'Make it happen', title: 'Crew', copy: 'Reliable people to support your event.', mark: '◈' },
];

export function Step1EventBasics() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<RequirementFormValues>();
  const dateType = watch('dateType');
  const category = watch('category');

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[#d7ff4f]">Let&apos;s begin</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">Tell us about your event.</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">A few basics help us match you with exactly the right people.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="field-label">Event name <span className="text-[#d7ff4f]">*</span></span>
          <input className="field" placeholder="e.g. Aisha's 30th birthday" {...register('eventName')} />
          {errors.eventName && <p className="field-error">{errors.eventName.message}</p>}
        </label>
        <label>
          <span className="field-label">Event type <span className="text-[#d7ff4f]">*</span></span>
          <select className="field" defaultValue="" {...register('eventType')}>
            <option value="" disabled>Select event type</option>
            {eventTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          {errors.eventType && <p className="field-error">{errors.eventType.message}</p>}
        </label>
        <label>
          <span className="field-label">Location <span className="text-[#d7ff4f]">*</span></span>
          <input className="field" placeholder="City or area" {...register('location')} />
          {errors.location && <p className="field-error">{errors.location.message}</p>}
        </label>
      </div>

      <div>
        <span className="field-label">When is it? <span className="text-[#d7ff4f]">*</span></span>
        <div className="mb-3 inline-flex rounded-lg border border-[#26334b] bg-[#090f1b] p-1">
          {(['single', 'range'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setValue('dateType', option, { shouldDirty: true, shouldValidate: true })}
              className={`focus-ring rounded-md px-4 py-2 text-sm font-semibold transition ${dateType === option ? 'bg-[#d7ff4f] text-[#0a101b]' : 'text-slate-400 hover:text-white'}`}
            >
              {option === 'single' ? 'Single date' : 'Date range'}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="field-label">{dateType === 'range' ? 'Start date' : 'Event date'}</span>
            <input type="date" className="field" {...register('startDate')} />
            {errors.startDate && <p className="field-error">{errors.startDate.message}</p>}
          </label>
          {dateType === 'range' && (
            <label>
              <span className="field-label">End date</span>
              <input type="date" className="field" {...register('endDate')} />
              {errors.endDate && <p className="field-error">{errors.endDate.message}</p>}
            </label>
          )}
        </div>
      </div>

      <label>
        <span className="field-label">Venue <span className="font-normal text-slate-500">(optional)</span></span>
        <input className="field" placeholder="e.g. The Leela Palace" {...register('venue')} />
      </label>

      <fieldset>
        <legend className="field-label">What do you need? <span className="text-[#d7ff4f]">*</span></legend>
        <div className="grid gap-3 md:grid-cols-3">
          {categoryCards.map((card) => {
            const selected = category === card.value;
            return (
              <button
                key={card.value}
                type="button"
                onClick={() => setValue('category', card.value, { shouldDirty: true, shouldValidate: true })}
                className={`focus-ring min-h-[10.5rem] rounded-xl border p-4 text-left transition ${selected ? 'border-[#d7ff4f] bg-[#d7ff4f]/10 shadow-[0_0_0_1px_rgba(215,255,79,.22)]' : 'border-[#26334b] bg-[#0d1321] hover:border-slate-500'}`}
                aria-pressed={selected}
              >
                <span className={`mb-5 grid h-9 w-9 place-items-center rounded-lg text-lg ${selected ? 'bg-[#d7ff4f] text-[#0a101b]' : 'bg-slate-800 text-[#d7ff4f]'}`}>{card.mark}</span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">{card.eyebrow}</span>
                <span className="mt-1 block text-base font-bold text-white">{card.title}</span>
                <span className="mt-1.5 block text-sm leading-5 text-slate-400">{card.copy}</span>
              </button>
            );
          })}
        </div>
        {errors.category && <p className="field-error">{errors.category.message}</p>}
      </fieldset>
    </div>
  );
}
