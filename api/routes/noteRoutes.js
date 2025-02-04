const express = require(`express`)

const noteController = require(`./../controllers/noteController`)
const authController = require('./../controllers/authController')

const router = express.Router()

router
  .route(`/`)
  .get(authController.protect, noteController.getNotes)
  .post(authController.protect, noteController.createNote)

router
  .route(`/:id`)
  .get(authController.protect, noteController.getNote)
  .put(authController.protect, noteController.updateNote)
  .delete(authController.protect, noteController.deleteNote)

module.exports = router
