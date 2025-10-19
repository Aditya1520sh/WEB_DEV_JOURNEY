# Todo App (Node + Express + MongoDB)

Simple Todo App demonstrating CRUD operations with a MongoDB-backed storage.

Run locally:

1. Install dependencies: npm install
2. Configure `.env` file with your MongoDB connection:
   - `MONGODB_URI` - Your MongoDB connection string (default: mongodb://127.0.0.1:27017)
   - `MONGODB_DB` - Database name (default: todoapp)
   - `PORT` - Server port (default: 3000)
3. Start server: npm start
4. Open http://localhost:3000

Notes:
- Backend: Express + MongoDB Native Driver
- Per-user isolation without login via a tenant cookie; each browser gets its own isolated list
- Frontend: Vanilla HTML/CSS/JS using fetch()


# Deploying to Vercel

1. Make sure your MongoDB is accessible from the cloud (MongoDB Atlas recommended).
2. Set your environment variables (`MONGODB_URI`, `MONGODB_DB`) in the Vercel dashboard (Project > Settings > Environment Variables).
3. Deploy via Vercel CLI or GitHub import:
   - `vercel --prod` (if you have Vercel CLI installed)
   - Or connect your repo to Vercel and deploy from the dashboard.
4. The API and frontend will be served from Vercel serverless functions and static hosting.

**Note:** Local MongoDB will not work on Vercel. Use MongoDB Atlas or another cloud MongoDB provider.
