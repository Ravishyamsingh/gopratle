const mongoose = require('mongoose');

const EVENT_TYPES = ['Birthday Party', 'Wedding', 'Corporate', 'Concert', 'Festival', 'Other'];

const requirementSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true, trim: true },
    eventType: { type: String, required: true, enum: EVENT_TYPES },
    dateType: { type: String, required: true, enum: ['single', 'range'], default: 'single' },
    startDate: { type: Date, required: true },
    endDate: {
      type: Date,
      required() {
        return this.dateType === 'range';
      },
      validate: {
        validator(value) {
          return !value || !this.startDate || value >= this.startDate;
        },
        message: 'End date must be on or after the start date.',
      },
    },
    location: { type: String, required: true, trim: true },
    venue: { type: String, trim: true },
  },
  { discriminatorKey: 'category', timestamps: true }
);

requirementSchema.index({ category: 1, createdAt: -1 });
requirementSchema.index({ eventName: 1 });
requirementSchema.index({ location: 1 });

const Requirement = mongoose.model('Requirement', requirementSchema);

module.exports = Requirement;
module.exports.EVENT_TYPES = EVENT_TYPES;
