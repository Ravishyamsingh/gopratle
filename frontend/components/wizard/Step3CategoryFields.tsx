import { useFormContext } from 'react-hook-form';
import { budgetRanges, shiftDurations, type RequirementFormValues } from '@/lib/types';

export function Step3CategoryFields() {
  const { register, watch, formState: { errors } } = useFormContext<RequirementFormValues>();
  const category = watch('category');

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#d7ff4f]">Almost there</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">A few final details.</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">A clear brief helps the right people respond with confidence.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {category === 'performer' && (
          <label>
            <span className="field-label">Expected audience size <span className="text-[#d7ff4f]">*</span></span>
            <input type="number" min="1" className="field" placeholder="e.g. 200" {...register('audienceSize', { valueAsNumber: true })} />
            {errors.audienceSize && <p className="field-error">{errors.audienceSize.message}</p>}
          </label>
        )}
        {category === 'crew' && (
          <label>
            <span className="field-label">Shift duration <span className="text-[#d7ff4f]">*</span></span>
            <select className="field" defaultValue="" {...register('shiftDuration')}>
              <option value="" disabled>Select shift duration</option>
              {shiftDurations.map((duration) => <option key={duration} value={duration}>{duration}</option>)}
            </select>
            {errors.shiftDuration && <p className="field-error">{errors.shiftDuration.message}</p>}
          </label>
        )}
        <label>
          <span className="field-label">Budget range <span className="text-[#d7ff4f]">*</span></span>
          <select className="field" defaultValue="" {...register('budgetRange')}>
            <option value="" disabled>Select budget range</option>
            {budgetRanges.map((range) => <option key={range} value={range}>{range}</option>)}
          </select>
          {errors.budgetRange && <p className="field-error">{errors.budgetRange.message}</p>}
        </label>
        {category === 'planner' && (
          <label className="sm:col-span-2">
            <span className="field-label">Style preference <span className="font-normal text-slate-500">(optional)</span></span>
            <input className="field" placeholder="e.g. Minimal, traditional, garden party" {...register('stylePreference')} />
          </label>
        )}
      </div>
      <label className="block">
        <span className="field-label">Anything else we should know? <span className="font-normal text-slate-500">(optional)</span></span>
        <textarea rows={5} className="field resize-y" placeholder="Share any special requests, timings or must-haves." {...register('additionalNotes')} />
      </label>
    </div>
  );
}
