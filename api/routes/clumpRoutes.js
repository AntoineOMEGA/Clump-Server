const express = require(`express`)

const clumpController = require(`./../controllers/clumpController`)
const authController = require('./../controllers/authController')

const router = express.Router()

router
  .route(`/`)
  .get(authController.protect, clumpController.getClumps)
  .post(authController.protect, clumpController.createClump)

router
  .route(`/:id`)
  .get(authController.protect, clumpController.getClump)
  .patch(authController.protect, clumpController.updateClump)
  .delete(authController.protect, clumpController.deleteClump)

module.exports = router
