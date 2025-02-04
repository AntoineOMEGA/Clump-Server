const express = require(`express`)

const eventExceptionController = require(`./../controllers/eventExceptionController`)
const authController = require('./../controllers/authController')

const router = express.Router()

router
  .route(`/:id`)
  .delete(authController.protect, eventExceptionController.deleteEventException)

module.exports = router
