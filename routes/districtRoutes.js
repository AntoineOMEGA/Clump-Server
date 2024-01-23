const express = require(`express`);

const districtController = require(`./../controllers/districtController`);
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route(`/`)
  .get(authController.protect, districtController.getDistricts)
  .post(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    districtController.createDistrict
  );

router
  .route(`/:id`)
  .get(authController.protect, districtController.getDistrict)
  .patch(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    districtController.updateDistrict
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    districtController.deleteDistrict
  );

module.exports = router;
