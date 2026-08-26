const express = require("express");
const app = express();
const backendApp = require("../backend/server");

// Mount the backend Express app under /api prefix for Vercel Serverless Function
app.use("/api", backendApp);

module.exports = app;
