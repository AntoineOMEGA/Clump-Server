const express = require('express')

const tagController = require('../controllers/tagController')
const authController = require('../controllers/authController')

const router = express.Router()

router
  .route('/')
  .get(authController.protect, tagController.getTags)
  .post(authController.protect, tagController.createTag)

router
  .route('/:id')
  .get(authController.protect, tagController.getTag)
  .put(authController.protect, tagController.updateTag)
  .delete(authController.protect, tagController.deleteTag)

module.exports = router
