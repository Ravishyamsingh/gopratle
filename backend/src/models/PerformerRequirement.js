const mongoose = require('mongoose');
const Requirement = require('./Requirement');
const { BUDGET_RANGES } = require('./PlannerRequirement');

const PERFORMER_TYPES = ['DJ', 'Live Band', 'Singer', 'Dancer', 'Anchor/MC', 'Magician', 'Comedian', 'Other'];
const PERFORMANCE_DURATIONS = ['<30 min', '30–60 min', '1–2 hrs', '2+ hrs'];

const performerSchema = new mongoose.Schema({
  performerType: { type: String, required: true, enum: PERFORMER_TYPES },
  genrePreference: { type: String, trim: true },
  performanceDuration: { type: String, required: true, enum: PERFORMANCE_DURATIONS },
  audienceSize: { type: Number, required: true, min: 1 },
  budgetRange: { type: String, required: true, enum: BUDGET_RANGES },
  additionalNotes: { type: String, trim: true },
});

const PerformerRequirement = Requirement.discriminator('performer', performerSchema);

module.exports = PerformerRequirement;
module.exports.PERFORMER_TYPES = PERFORMER_TYPES;
module.exports.PERFORMANCE_DURATIONS = PERFORMANCE_DURATIONS;
