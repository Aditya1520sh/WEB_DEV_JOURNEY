// Ye server.js Express app ko setup karega, routes mount karega aur static frontend serve karega
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const todosRouter = require('./routes/todos');
const { tenantMiddleware } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json()); // JSON body parse karega
app.use(cookieParser()); // cookies parse karega tenant ke liye
app.use(tenantMiddleware); // per-user isolation bina login

// Static files (frontend) public folder se serve karenge
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/todos', todosRouter);

// Note: On Vercel, static files are served via vercel.json routing.
// Keep Express focused on API only. Local dev still serves /public statically.


// Export app for Vercel serverless (api/server.js)
module.exports = app;

// Only start server if run directly (not imported by Vercel)
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
