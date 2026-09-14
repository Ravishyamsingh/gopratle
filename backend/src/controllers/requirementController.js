const mongoose = require('mongoose');
const Requirement = require('../models/Requirement');
const PlannerRequirement = require('../models/PlannerRequirement');
const PerformerRequirement = require('../models/PerformerRequirement');
const CrewRequirement = require('../models/CrewRequirement');

const requirementModels = {
  planner: PlannerRequirement,
  performer: PerformerRequirement,
  crew: CrewRequirement,
};

function formatValidationError(error) {
  return Object.values(error.errors).map((item) => ({
    field: item.path,
    message: item.message,
  }));
}

async function createRequirement(req, res, next) {
  try {
    const { category } = req.body;
    const RequirementModel = requirementModels[category];

    if (!RequirementModel) {
      return res.status(400).json({
        success: false,
        message: 'category must be planner, performer, or crew.',
      });
    }

    const sanitizedBody = {
      ...req.body,
      eventName: req.body.eventName?.trim(),
      location: req.body.location?.trim(),
      venue: req.body.venue?.trim() || undefined,
      stylePreference: req.body.stylePreference?.trim() || undefined,
      genrePreference: req.body.genrePreference?.trim() || undefined,
      additionalNotes: req.body.additionalNotes?.trim() || undefined,
    };

    const requirement = new RequirementModel(sanitizedBody);
    await requirement.save();
    return res.status(201).json({ success: true, data: requirement });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: error.name === 'ValidationError' ? formatValidationError(error) : [{ field: error.path, message: error.message }],
      });
    }
    return next(error);
  }
}

async function listRequirements(req, res, next) {
  try {
    const { category } = req.query;
    if (category && !requirementModels[category]) {
      return res.status(400).json({ success: false, message: 'Invalid category filter.' });
    }

    const filter = category ? { category } : {};
    const requirements = await Requirement.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: requirements });
  } catch (error) {
    return next(error);
  }
}

async function getRequirement(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid requirement ID.' });
    }

    const requirement = await Requirement.findById(id).lean();
    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found.' });
    }
    return res.json({ success: true, data: requirement });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createRequirement, listRequirements, getRequirement };
