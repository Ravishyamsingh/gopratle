const mongoose = require('mongoose');
const Requirement = require('./Requirement');
const { BUDGET_RANGES } = require('./PlannerRequirement');

const CREW_TYPES = [
  'Hospitality',
  'Coordination',
  'Brand Promotion',
  'General Event Support',
  'Security',
  'Technical/AV',
];
const SHIFT_DURATIONS = ['Half-day', 'Full-day', 'Multi-day'];

const crewSchema = new mongoose.Schema({
  crewType: {
    type: [{ type: String, enum: CREW_TYPES }],
    required: true,
    validate: [(value) => value.length > 0, 'Select at least one crew type.'],
  },
  numberOfCrewNeeded: { type: Number, required: true, min: 1 },
  shiftDuration: { type: String, required: true, enum: SHIFT_DURATIONS },
  budgetRange: { type: String, required: true, enum: BUDGET_RANGES },
  additionalNotes: { type: String, trim: true },
});

const CrewRequirement = Requirement.discriminator('crew', crewSchema);

module.exports = CrewRequirement;
module.exports.CREW_TYPES = CREW_TYPES;
module.exports.SHIFT_DURATIONS = SHIFT_DURATIONS;
