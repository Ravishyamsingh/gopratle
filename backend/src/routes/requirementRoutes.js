const express = require('express');
const {
  createRequirement,
  listRequirements,
  getRequirement,
} = require('../controllers/requirementController');

const router = express.Router();

router.route('/').post(createRequirement).get(listRequirements);
router.get('/:id', getRequirement);

module.exports = router;
