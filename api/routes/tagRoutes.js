const express = require('express');

const tagController = require('../controllers/tagController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    tagController.getTags
  )
  .post(
    authController.protect,
    //authController.restrictTo('admin'),
    tagController.createTag
  );

router
  .route('/:id')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    tagController.getTag
  )
  .put(
    authController.protect,
    //authController.restrictTo('admin'),
    tagController.updateTag
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin'),
    tagController.deleteTag
  );

module.exports = router;
