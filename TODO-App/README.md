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

For MongoDB Atlas (cloud):
- Get your connection string from MongoDB Atlas
- Update `MONGODB_URI` in `.env` file with your Atlas connection string
- Example: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`
