const express = require('express');

const roleController = require('../controllers/roleController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    roleController.getRoles
  )
  .post(
    authController.protect,
    //authController.restrictTo('admin'),
    roleController.createRole
  );

router
  .route('/:id')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    roleController.getRole
  )
  .patch(
    authController.protect,
    //authController.restrictTo('admin'),
    roleController.updateRole
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin'),
    roleController.deleteRole
  );

module.exports = router;
