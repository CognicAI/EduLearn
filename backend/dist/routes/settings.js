"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const settingsController_1 = require("@/controllers/settingsController");
const router = (0, express_1.Router)();
router.get('/profile', auth_1.authenticateToken, settingsController_1.settingsController.getProfile);
router.put('/profile', auth_1.authenticateToken, settingsController_1.settingsController.updateProfile);
router.get('/settings', auth_1.authenticateToken, settingsController_1.settingsController.getSettings);
router.put('/settings', auth_1.authenticateToken, settingsController_1.settingsController.updateSettings);
router.get('/sessions', auth_1.authenticateToken, settingsController_1.settingsController.getSessions);
router.get('/activity', auth_1.authenticateToken, settingsController_1.settingsController.getActivity);
router.put('/password', auth_1.authenticateToken, settingsController_1.settingsController.updatePassword);
exports.default = router;
//# sourceMappingURL=settings.js.map