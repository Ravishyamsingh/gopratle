export const categories = ['planner', 'performer', 'crew'] as const;
export type Category = (typeof categories)[number];

export const eventTypes = ['Birthday Party', 'Wedding', 'Corporate', 'Concert', 'Festival', 'Other'] as const;
export const budgetRanges = ['Under ₹50k', '₹50k–1L', '₹1L–5L', '₹5L+'] as const;
export const plannerServices = [
  'Full Planning',
  'Decor & Design',
  'Vendor Coordination',
  'Day-of Coordination',
  'Budget Management',
] as const;
export const performerTypes = ['DJ', 'Live Band', 'Singer', 'Dancer', 'Anchor/MC', 'Magician', 'Comedian', 'Other'] as const;
export const performanceDurations = ['<30 min', '30–60 min', '1–2 hrs', '2+ hrs'] as const;
export const crewTypes = [
  'Hospitality',
  'Coordination',
  'Brand Promotion',
  'General Event Support',
  'Security',
  'Technical/AV',
] as const;
export const shiftDurations = ['Half-day', 'Full-day', 'Multi-day'] as const;

export type RequirementFormValues = {
  eventName: string;
  eventType: string;
  dateType: 'single' | 'range';
  startDate: string;
  endDate?: string;
  location: string;
  venue?: string;
  category?: Category;
  servicesNeeded?: string[];
  guestCount?: number;
  performerType?: string;
  genrePreference?: string;
  performanceDuration?: string;
  audienceSize?: number;
  crewType?: string[];
  numberOfCrewNeeded?: number;
  shiftDuration?: string;
  budgetRange?: string;
  stylePreference?: string;
  additionalNotes?: string;
};

export type CreatedRequirement = RequirementFormValues & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};
