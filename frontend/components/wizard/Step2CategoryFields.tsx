import { useFormContext } from 'react-hook-form';
import { CheckboxGroup } from './CheckboxGroup';
import {
  crewTypes,
  performanceDurations,
  performerTypes,
  plannerServices,
  type RequirementFormValues,
} from '@/lib/types';

export function Step2CategoryFields() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<RequirementFormValues>();
  const category = watch('category');

  const heading = category === 'planner' ? 'How can a planner help?' : category === 'performer' ? 'Find the right performer.' : 'Build your event crew.';
  const copy = category === 'planner'
    ? 'Choose the support you would like for your event.'
    : category === 'performer'
      ? 'Tell us about the performance you have in mind.'
      : 'Select the roles your event needs on the ground.';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#d7ff4f]">Your requirement</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">{heading}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
      </div>

      {category === 'planner' && (
        <>
          <fieldset>
            <legend className="field-label">Services needed <span className="text-[#d7ff4f]">*</span></legend>
            <CheckboxGroup
              label="Services needed"
              options={plannerServices}
              value={watch('servicesNeeded') ?? []}
              onChange={(value) => setValue('servicesNeeded', value, { shouldDirty: true, shouldValidate: true })}
            />
            {errors.servicesNeeded && <p className="field-error">{errors.servicesNeeded.message}</p>}
          </fieldset>
          <label className="block max-w-sm">
            <span className="field-label">Expected guest count <span className="text-[#d7ff4f]">*</span></span>
            <input type="number" min="1" className="field" placeholder="e.g. 150" {...register('guestCount', { valueAsNumber: true })} />
            {errors.guestCount && <p className="field-error">{errors.guestCount.message}</p>}
          </label>
        </>
      )}

      {category === 'performer' && (
        <div className="grid gap-5 sm:grid-cols-2">
          <label>
            <span className="field-label">Performer type <span className="text-[#d7ff4f]">*</span></span>
            <select className="field" defaultValue="" {...register('performerType')}>
              <option value="" disabled>Select performer type</option>
              {performerTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            {errors.performerType && <p className="field-error">{errors.performerType.message}</p>}
          </label>
          <label>
            <span className="field-label">Performance duration <span className="text-[#d7ff4f]">*</span></span>
            <select className="field" defaultValue="" {...register('performanceDuration')}>
              <option value="" disabled>Select duration</option>
              {performanceDurations.map((duration) => <option key={duration} value={duration}>{duration}</option>)}
            </select>
            {errors.performanceDuration && <p className="field-error">{errors.performanceDuration.message}</p>}
          </label>
          <label className="sm:col-span-2">
            <span className="field-label">Genre or vibe <span className="font-normal text-slate-500">(optional)</span></span>
            <input className="field" placeholder="e.g. Bollywood, acoustic, high-energy" {...register('genrePreference')} />
          </label>
        </div>
      )}

      {category === 'crew' && (
        <>
          <fieldset>
            <legend className="field-label">Crew type <span className="text-[#d7ff4f]">*</span></legend>
            <CheckboxGroup
              label="Crew type"
              options={crewTypes}
              value={watch('crewType') ?? []}
              onChange={(value) => setValue('crewType', value, { shouldDirty: true, shouldValidate: true })}
            />
            {errors.crewType && <p className="field-error">{errors.crewType.message}</p>}
          </fieldset>
          <label className="block max-w-sm">
            <span className="field-label">Number of crew needed <span className="text-[#d7ff4f]">*</span></span>
            <input type="number" min="1" className="field" placeholder="e.g. 8" {...register('numberOfCrewNeeded', { valueAsNumber: true })} />
            {errors.numberOfCrewNeeded && <p className="field-error">{errors.numberOfCrewNeeded.message}</p>}
          </label>
        </>
      )}
    </div>
  );
}
