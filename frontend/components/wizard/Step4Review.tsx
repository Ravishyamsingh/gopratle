import { useWatch, useFormContext } from 'react-hook-form';
import type { RequirementFormValues } from '@/lib/types';

type ReviewSectionProps = {
  title: string;
  onEdit: () => void;
  items: [string, string | undefined][];
};

function ReviewSection({ title, onEdit, items }: ReviewSectionProps) {
  return (
    <section className="rounded-xl border border-[#26334b] bg-[#090f1b]/70 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-bold text-white">{title}</h2>
        <button type="button" onClick={onEdit} className="focus-ring text-sm font-bold text-[#d7ff4f] hover:text-white">Edit</button>
      </div>
      <dl className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
        {items.filter(([, value]) => value).map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm leading-5 text-slate-200">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function formatDate(value?: string) {
  if (!value) return undefined;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}

export function Step4Review({ onEdit }: { onEdit: (step: number) => void }) {
  const { control } = useFormContext<RequirementFormValues>();
  const values = useWatch({ control });
  const categoryLabel = values.category === 'planner' ? 'Event Planner' : values.category === 'performer' ? 'Performer' : 'Crew';
  const date = values.dateType === 'range'
    ? `${formatDate(values.startDate)} – ${formatDate(values.endDate)}`
    : formatDate(values.startDate);
  const categoryItems: [string, string | undefined][] = values.category === 'planner'
    ? [['Services', values.servicesNeeded?.join(', ')], ['Guest count', values.guestCount?.toLocaleString()]]
    : values.category === 'performer'
      ? [['Performer type', values.performerType], ['Performance duration', values.performanceDuration], ['Genre / vibe', values.genrePreference]]
      : [['Crew roles', values.crewType?.join(', ')], ['Number of crew', values.numberOfCrewNeeded?.toLocaleString()]];
  const finalItems: [string, string | undefined][] = values.category === 'planner'
    ? [['Budget', values.budgetRange], ['Style preference', values.stylePreference], ['Notes', values.additionalNotes]]
    : values.category === 'performer'
      ? [['Audience size', values.audienceSize?.toLocaleString()], ['Budget', values.budgetRange], ['Notes', values.additionalNotes]]
      : [['Shift duration', values.shiftDuration], ['Budget', values.budgetRange], ['Notes', values.additionalNotes]];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[#d7ff4f]">One last look</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">Review your requirement.</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Everything look right? Post it and we&apos;ll take it from there.</p>
      </div>
      <ReviewSection title="Event basics" onEdit={() => onEdit(1)} items={[
        ['Event', values.eventName], ['Type', values.eventType], ['Date', date], ['Location', values.location], ['Venue', values.venue], ['Need', categoryLabel],
      ]} />
      <ReviewSection title="Your requirement" onEdit={() => onEdit(2)} items={categoryItems} />
      <ReviewSection title="Final details" onEdit={() => onEdit(3)} items={finalItems} />
    </div>
  );
}
