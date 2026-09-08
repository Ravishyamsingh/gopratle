const test = require('node:test');
const assert = require('node:assert/strict');

const PlannerRequirement = require('../src/models/PlannerRequirement');
const PerformerRequirement = require('../src/models/PerformerRequirement');
const CrewRequirement = require('../src/models/CrewRequirement');

const base = {
  eventName: 'Maya and Karan Wedding',
  eventType: 'Wedding',
  dateType: 'single',
  startDate: '2026-12-10',
  location: 'Delhi',
};

test('planner requirement validates with discriminator category', () => {
  const document = new PlannerRequirement({
    ...base,
    servicesNeeded: ['Full Planning'],
    guestCount: 120,
    budgetRange: '₹1L–5L',
  });
  assert.equal(document.validateSync(), undefined);
  assert.equal(document.category, 'planner');
});

test('performer requirement requires a performance duration', () => {
  const document = new PerformerRequirement({
    ...base,
    performerType: 'DJ',
    audienceSize: 80,
    budgetRange: 'Under ₹50k',
  });
  const error = document.validateSync();
  assert.ok(error.errors.performanceDuration);
});

test('crew date range requires an end date', () => {
  const document = new CrewRequirement({
    ...base,
    dateType: 'range',
    crewType: ['Hospitality'],
    numberOfCrewNeeded: 5,
    shiftDuration: 'Full-day',
    budgetRange: '₹50k–1L',
  });
  const error = document.validateSync();
  assert.ok(error.errors.endDate);
});
