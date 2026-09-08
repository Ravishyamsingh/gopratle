import { z } from 'zod';
import {
  budgetRanges,
  crewTypes,
  eventTypes,
  performanceDurations,
  performerTypes,
  plannerServices,
  shiftDurations,
} from './types';

const requiredText = (label: string) => z.string().trim().min(1, `${label} is required.`);
const positiveNumber = (label: string) => z.coerce.number({ invalid_type_error: `${label} must be a number.` }).int().positive(`${label} must be at least 1.`);
const dateString = (label: string) => z.string().min(1, `${label} is required.` );

export const baseSchema = z
  .object({
    eventName: z.string().trim().min(1, 'Event name is required.').max(200, 'Event name is too long.'),
    eventType: z.enum(eventTypes, { required_error: 'Event type is required.' }),
    dateType: z.enum(['single', 'range']),
    startDate: dateString('Start date'),
    endDate: z.string().optional(),
    location: z.string().trim().min(1, 'Location is required.').max(200, 'Location is too long.'),
    venue: z.string().trim().max(200, 'Venue name is too long.').optional(),
    category: z.enum(['planner', 'performer', 'crew'], { required_error: 'Category is required.' }),
  })
  .superRefine((values, context) => {
    if (values.dateType === 'range') {
      if (!values.endDate || values.endDate.trim() === '') {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['endDate'], message: 'End date is required for a date range.' });
      } else {
        const start = new Date(values.startDate);
        const end = new Date(values.endDate);
        if (end < start) {
          context.addIssue({ code: z.ZodIssueCode.custom, path: ['endDate'], message: 'End date cannot be before the start date.' });
        }
      }
    }
  });

const plannerSchema = z.object({
  servicesNeeded: z.array(z.enum(plannerServices)).min(1, 'Select at least one service.'),
  guestCount: positiveNumber('Guest count'),
  budgetRange: z.enum(budgetRanges, { required_error: 'Budget range is required.' }),
  stylePreference: z.string().trim().max(500, 'Style preference is too long.').optional(),
  additionalNotes: z.string().trim().max(1000, 'Notes are too long.').optional(),
});

const performerSchema = z.object({
  performerType: z.enum(performerTypes, { required_error: 'Performer type is required.' }),
  genrePreference: z.string().trim().max(200, 'Genre preference is too long.').optional(),
  performanceDuration: z.enum(performanceDurations, { required_error: 'Performance duration is required.' }),
  audienceSize: positiveNumber('Audience size'),
  budgetRange: z.enum(budgetRanges, { required_error: 'Budget range is required.' }),
  additionalNotes: z.string().trim().max(1000, 'Notes are too long.').optional(),
});

const crewSchema = z.object({
  crewType: z.array(z.enum(crewTypes)).min(1, 'Select at least one crew type.'),
  numberOfCrewNeeded: positiveNumber('Number of crew needed'),
  shiftDuration: z.enum(shiftDurations, { required_error: 'Shift duration is required.' }),
  budgetRange: z.enum(budgetRanges, { required_error: 'Budget range is required.' }),
  additionalNotes: z.string().trim().max(1000, 'Notes are too long.').optional(),
});

export const categoryStep2Schemas = {
  planner: plannerSchema.pick({ servicesNeeded: true, guestCount: true }),
  performer: performerSchema.pick({ performerType: true, genrePreference: true, performanceDuration: true }),
  crew: crewSchema.pick({ crewType: true, numberOfCrewNeeded: true }),
};

export const categoryStep3Schemas = {
  planner: plannerSchema.pick({ budgetRange: true, stylePreference: true, additionalNotes: true }),
  performer: performerSchema.pick({ audienceSize: true, budgetRange: true, additionalNotes: true }),
  crew: crewSchema.pick({ shiftDuration: true, budgetRange: true, additionalNotes: true }),
};

export const requirementSchemas = {
  planner: baseSchema.and(plannerSchema),
  performer: baseSchema.and(performerSchema),
  crew: baseSchema.and(crewSchema),
};
