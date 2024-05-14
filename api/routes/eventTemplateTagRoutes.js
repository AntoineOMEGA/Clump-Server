const express = require('express');

const eventTemplateTagController = require('../controllers/eventTemplateTagController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    eventTemplateTagController.getEventTemplateTags
  )
  .post(
    authController.protect,
    //authController.restrictTo('admin'),
    eventTemplateTagController.createEventTemplateTag
  );

router
  .route('/:id')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    eventTemplateTagController.getEventTemplateTag
  )
  .put(
    authController.protect,
    //authController.restrictTo('admin'),
    eventTemplateTagController.updateEventTemplateTag
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin'),
    eventTemplateTagController.deleteEventTemplateTag
  );

module.exports = router;
