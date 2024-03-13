const express = require(`express`);

const clumpController = require(`./../controllers/clumpController`);
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/bind').get(authController.protect, clumpController.bindClump);
router.route(`/redirect`).get(authController.protect, clumpController.assignToken);
router.route(`/calendars`).get(authController.protect, clumpController.getGoogleCalendars);
router.route(`/getRefreshToken`).post(authController.protect, clumpController.getRefreshToken);

module.exports = router;
