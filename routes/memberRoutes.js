const express = require('express');

const memberController = require('../controllers/memberController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    memberController.getMissionaries
  )
  .post(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    memberController.createMember
  );

router
  .route('/:id')
  .get(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    memberController.getMember
  )
  .patch(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    memberController.updateMember
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    memberController.deleteMember
  );

module.exports = router;
