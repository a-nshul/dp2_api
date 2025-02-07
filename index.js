const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const adminRoutes =require("./routes/adminRoutes");
const formRoutes =require("./routes/fileRoutes");
const responseRoutes = require("./routes/responseRoutes");
dotenv.config();
connectDB();

const app = express();

// CORS configuration
const corsOptions = {
  origin: true,
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  exposedHeaders: ["X-Auth-Token"], // Expose custom headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
  preflightContinue: false,
  optionsSuccessStatus: 204, // For older browsers
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// log in development environment
if (process.env.NODE_ENV === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}
app.get("/", (req, res) => {
  res.status(200).json({
    type: "success",
    message: "Server is up and running",
    data: null,
  });
});
// API routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/form", formRoutes);
app.use("/api/response", responseRoutes);
// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}...`);
});
