'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, type Resolver, type ResolverResult } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApiErrorMessage, postRequirement } from '@/lib/api';
import { baseSchema, categoryStep2Schemas, categoryStep3Schemas, requirementSchemas } from '@/lib/validation';
import type { Category, CreatedRequirement, RequirementFormValues } from '@/lib/types';
import { Step1EventBasics } from './Step1EventBasics';
import { Step2CategoryFields } from './Step2CategoryFields';
import { Step3CategoryFields } from './Step3CategoryFields';
import { Step4Review } from './Step4Review';
import { StepIndicator } from './StepIndicator';

const defaults: RequirementFormValues = {
  eventName: '',
  eventType: '',
  dateType: 'single',
  startDate: '',
  endDate: '',
  location: '',
  venue: '',
  servicesNeeded: [],
  crewType: [],
  genrePreference: '',
  stylePreference: '',
  additionalNotes: '',
};

const dynamicResolver: Resolver<RequirementFormValues> = (values, context, options) => {
  const schema = values.category ? requirementSchemas[values.category] : baseSchema;
  return zodResolver(schema)(values, context, options) as Promise<ResolverResult<RequirementFormValues>>;
};

function getStep(searchStep: string | null) {
  const value = Number(searchStep);
  return Number.isInteger(value) && value >= 1 && value <= 4 ? value : 1;
}

function buildPayload(values: RequirementFormValues): RequirementFormValues {
  const base = {
    category: values.category,
    eventName: values.eventName.trim(),
    eventType: values.eventType,
    dateType: values.dateType,
    startDate: values.startDate,
    endDate: values.dateType === 'range' ? values.endDate : undefined,
    location: values.location.trim(),
    venue: values.venue?.trim() || undefined,
  };

  if (values.category === 'planner') {
    return { ...base, servicesNeeded: values.servicesNeeded, guestCount: values.guestCount, budgetRange: values.budgetRange, stylePreference: values.stylePreference?.trim() || undefined, additionalNotes: values.additionalNotes?.trim() || undefined };
  }
  if (values.category === 'performer') {
    return { ...base, performerType: values.performerType, genrePreference: values.genrePreference?.trim() || undefined, performanceDuration: values.performanceDuration, audienceSize: values.audienceSize, budgetRange: values.budgetRange, additionalNotes: values.additionalNotes?.trim() || undefined };
  }
  return { ...base, crewType: values.crewType, numberOfCrewNeeded: values.numberOfCrewNeeded, shiftDuration: values.shiftDuration, budgetRange: values.budgetRange, additionalNotes: values.additionalNotes?.trim() || undefined };
}

export function PostRequirementWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = getStep(searchParams.get('step'));
  const methods = useForm<RequirementFormValues>({
    defaultValues: defaults,
    resolver: dynamicResolver,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
  const category = methods.watch('category');
  const [createdRequirement, setCreatedRequirement] = useState<CreatedRequirement>();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (step > 1 && !category) {
      router.replace('/post-requirement?step=1');
    }
  }, [category, router, step]);

  const stepSchema = useMemo(() => {
    if (step === 1) return baseSchema;
    if (!category) return baseSchema;
    return step === 2 ? categoryStep2Schemas[category] : categoryStep3Schemas[category];
  }, [category, step]);

  function changeStep(nextStep: number) {
    setServerError('');
    router.push(`/post-requirement?step=${nextStep}`, { scroll: true });
  }

  function validateCurrentStep() {
    const result = stepSchema.safeParse(methods.getValues());
    if (result.success) {
      methods.clearErrors();
      return true;
    }

    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (typeof field === 'string') {
        methods.setError(field as keyof RequirementFormValues, { type: 'manual', message: issue.message });
      }
    });
    return false;
  }

  function nextStep() {
    if (validateCurrentStep()) changeStep(step + 1);
  }

  async function submit(values: RequirementFormValues) {
    setServerError('');
    setIsSubmitting(true);
    try {
      const created = await postRequirement(buildPayload(values));
      setCreatedRequirement(created);
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function startAgain() {
    methods.reset(defaults);
    setCreatedRequirement(undefined);
    setServerError('');
    router.replace('/post-requirement?step=1');
  }

  if (createdRequirement) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto flex min-h-[75vh] max-w-2xl items-center justify-center">
          <section className="w-full rounded-2xl border border-[#b7eb1f]/35 bg-[#0d1321] p-7 text-center shadow-2xl shadow-black/30 sm:p-10">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#d7ff4f] text-2xl font-black text-[#08101b]">✓</div>
            <p className="mt-6 text-sm font-bold uppercase tracking-[.16em] text-[#d7ff4f]">Requirement posted</p>
            <h1 className="mt-2 text-3xl font-bold text-white">You&apos;re all set.</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">Your requirement has been saved and categorised as <span className="font-semibold text-slate-200">{createdRequirement.category}</span>.</p>
            <div className="mt-6 rounded-lg border border-[#26334b] bg-[#070b14] px-4 py-3 text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Submission ID</p>
              <code className="mt-1 block break-all text-sm text-[#d7ff4f]">{createdRequirement._id}</code>
            </div>
            <button type="button" onClick={startAgain} className="focus-ring mt-7 rounded-lg bg-[#d7ff4f] px-5 py-3 text-sm font-extrabold text-[#0a101b] hover:bg-[#ecff9a]">Post another requirement</button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between border-b border-[#26334b] pb-5">
          <a href="/post-requirement?step=1" className="focus-ring text-xl font-black tracking-tight text-white">go<span className="text-[#d7ff4f]">Pratle</span></a>
          <span className="hidden text-xs font-semibold uppercase tracking-[.16em] text-slate-500 sm:block">Host portal</span>
        </header>
        <div className="grid overflow-hidden rounded-2xl border border-[#26334b] bg-[#0d1321] shadow-2xl shadow-black/30 lg:grid-cols-[.78fr_1.22fr]">
          <aside className="hidden min-h-full border-r border-[#26334b] bg-[linear-gradient(155deg,#121e36,#0a101b_62%)] p-8 lg:block">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d7ff4f]">GoPratle hosts</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white">Great events start with the right people.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">Post your brief once. We&apos;ll help you find planners, performers and crew that fit.</p>
            <div className="mt-12 space-y-5 border-t border-white/10 pt-6 text-sm">
              {['Share event essentials', 'Describe your exact need', 'Review and post in minutes'].map((item, index) => (
                <div key={item} className="flex items-center gap-3 text-slate-300"><span className="grid h-6 w-6 place-items-center rounded-full border border-[#d7ff4f]/50 text-xs font-bold text-[#d7ff4f]">{index + 1}</span>{item}</div>
              ))}
            </div>
          </aside>
          <section className="p-5 sm:p-8 lg:p-10">
            <StepIndicator step={step} />
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(submit)} noValidate>
                {step === 1 && <Step1EventBasics />}
                {step === 2 && <Step2CategoryFields />}
                {step === 3 && <Step3CategoryFields />}
                {step === 4 && <Step4Review onEdit={changeStep} />}
                {serverError && <p role="alert" className="mt-5 rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{serverError}</p>}
                <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#26334b] pt-5">
                  {step > 1 ? (
                    <button type="button" onClick={() => changeStep(step - 1)} className="focus-ring rounded-lg px-3 py-3 text-sm font-bold text-slate-300 hover:text-white">← Back</button>
                  ) : <span />}
                  {step < 4 ? (
                    <button type="button" onClick={nextStep} className="focus-ring rounded-lg bg-[#d7ff4f] px-5 py-3 text-sm font-extrabold text-[#0a101b] hover:bg-[#ecff9a]">Continue →</button>
                  ) : (
                    <button type="submit" disabled={isSubmitting} className="focus-ring rounded-lg bg-[#d7ff4f] px-5 py-3 text-sm font-extrabold text-[#0a101b] disabled:cursor-wait disabled:opacity-60 hover:bg-[#ecff9a]">{isSubmitting ? 'Posting…' : 'Post requirement'}</button>
                  )}
                </div>
              </form>
            </FormProvider>
          </section>
        </div>
      </div>
    </main>
  );
}
