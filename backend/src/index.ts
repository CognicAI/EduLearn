import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes'; // Ensure this path is correct and the file exports correctly
// Import other routes as you create them (e.g., courseRoutes, assignmentRoutes)

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes - configure appropriately for production
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.use('/api/auth', authRoutes);
// app.use('/api/courses', courseRoutes); // Example for course routes

// Basic Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!', message: err.message });
});

// Start Server
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});

export default app;
