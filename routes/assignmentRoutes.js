const express = require('express');

const assignmentController = require('../controllers/assignmentController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    assignmentController.getAssignments
  )
  .post(
    authController.protect,
    //authController.restrictTo('admin'),
    assignmentController.createAssignment
  );

router
  .route('/:id')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    assignmentController.getAssignment
  )
  .patch(
    authController.protect,
    //authController.restrictTo('admin'),
    assignmentController.updateAssignment
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin'),
    assignmentController.deleteAssignment
  );

module.exports = router;
