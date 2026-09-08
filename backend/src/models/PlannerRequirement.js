const mongoose = require('mongoose');
const Requirement = require('./Requirement');

const PLANNER_SERVICES = [
  'Full Planning',
  'Decor & Design',
  'Vendor Coordination',
  'Day-of Coordination',
  'Budget Management',
];
const BUDGET_RANGES = ['Under ₹50k', '₹50k–1L', '₹1L–5L', '₹5L+'];

const plannerSchema = new mongoose.Schema({
  servicesNeeded: {
    type: [{ type: String, enum: PLANNER_SERVICES }],
    required: true,
    validate: [(value) => value.length > 0, 'Select at least one planning service.'],
  },
  guestCount: { type: Number, required: true, min: 1 },
  budgetRange: { type: String, required: true, enum: BUDGET_RANGES },
  stylePreference: { type: String, trim: true },
  additionalNotes: { type: String, trim: true },
});

const PlannerRequirement = Requirement.discriminator('planner', plannerSchema);

module.exports = PlannerRequirement;
module.exports.PLANNER_SERVICES = PLANNER_SERVICES;
module.exports.BUDGET_RANGES = BUDGET_RANGES;
