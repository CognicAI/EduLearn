"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
// Import other routes as you create them (e.g., courseRoutes, assignmentRoutes)
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)()); // Enable CORS for all routes - configure appropriately for production
app.use(express_1.default.json()); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
// API Routes
app.use('/api/auth', auth_routes_1.default);
// app.use('/api/courses', courseRoutes); // Example for course routes
// Basic Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!', message: err.message });
});
// Start Server
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});
exports.default = app;
