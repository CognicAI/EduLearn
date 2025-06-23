"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("@/controllers/adminController");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.get('/users', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), adminController_1.adminController.getUsers);
exports.default = router;
//# sourceMappingURL=admin.js.map