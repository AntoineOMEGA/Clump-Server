const express = require(`express`);

const clumpController = require(`./../controllers/clumpController`);
const authController = require('./../controllers/authController');

const router = express.Router();

router.route(`/`).get(authController.protect, clumpController.assignToken);
router.route(`/getRefreshToken`).get(authController.protect, clumpController.getRefreshToken);

module.exports = router;
