const express = require('express');

const memberController = require('../controllers/memberController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    memberController.getMissionaries
  )
  .post(
    authController.protect,
    //authController.restrictTo('admin'),
    memberController.createMember
  );

router
  .route('/:id')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    memberController.getMember
  )
  .patch(
    authController.protect,
    //authController.restrictTo('admin'),
    memberController.updateMember
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin'),
    memberController.deleteMember
  );

module.exports = router;
