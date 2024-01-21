const express = require('express');

const assignmentController = require('../controllers/assignmentController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'leader'),
    assignmentController.getAssignments
  )
  .post(
    authController.protect,
    authController.restrictTo('admin', 'leader'),
    assignmentController.createAssignment
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'leader'),
    assignmentController.getAssignment
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'leader'),
    assignmentController.updateAssignment
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'leader'),
    assignmentController.deleteAssignment
  );

module.exports = router;
