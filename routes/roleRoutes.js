const express = require('express');

const roleController = require('../controllers/roleController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    roleController.getMissionaries
  )
  .post(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    roleController.createRole
  );

router
  .route('/:id')
  .get(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    roleController.getRole
  )
  .patch(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    roleController.updateRole
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    roleController.deleteRole
  );

module.exports = router;
