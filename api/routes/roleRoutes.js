const express = require('express');

const roleController = require('../controllers/roleController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    roleController.getRoles
  )
  .post(
    authController.protect,
    roleController.createRole
  );

router
  .route('/:id')
  .get(
    authController.protect,
    roleController.getRole
  )
  .put(
    authController.protect,
    roleController.updateRole
  )
  .delete(
    authController.protect,
    roleController.deleteRole
  );

module.exports = router;
