const express = require('express');

const memberController = require('../controllers/memberController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    memberController.getMembers
  )
  .post(
    authController.protect,
    memberController.createMember
  );

router
  .route('/:id')
  .get(
    authController.protect,
    memberController.getMember
  )
  .put(
    authController.protect,
    memberController.updateMember
  )
  .delete(
    authController.protect,
    memberController.deleteMember
  );

module.exports = router;
