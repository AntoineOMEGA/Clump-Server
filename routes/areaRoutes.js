const express = require(`express`);

const areaController = require(`./../controllers/areaController`);
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route(`/`)
  .get(authController.protect, areaController.getAreas)
  .post(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    areaController.createArea
  );

router
  .route(`/:id`)
  .get(authController.protect, areaController.getArea)
  .patch(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    areaController.updateArea
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    areaController.deleteArea
  );

module.exports = router;
