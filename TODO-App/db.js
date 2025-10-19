// Ye file MongoDB ko initialize karegi aur SQLite-like adapter export karegi
// Goal: routes/todos.js me koi change na ho; same db.run/get/all API expose kare
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { AsyncLocalStorage } = require('async_hooks');
const { v4: uuidv4 } = require('uuid');

// Connection URI env se, fallback local dev
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'todoapp';

const als = new AsyncLocalStorage();

let client; // Mongo client singleton
let dbConn; // DB handle

async function connect() {
  if (!client) {
    client = new MongoClient(MONGODB_URI, { ignoreUndefined: true });
    await client.connect();
    dbConn = client.db(MONGODB_DB);
    console.log('Connected to MongoDB at', MONGODB_URI, 'db:', MONGODB_DB);
    // indexes for performance and uniqueness per tenant
    const todos = dbConn.collection('todos');
    await todos.createIndex({ tenantId: 1, id: 1 }, { unique: true });
    await todos.createIndex({ tenantId: 1, created_at: -1 });
  // No need to create an index on _id for counters; MongoDB ensures uniqueness by default
  }
  return dbConn;
}

function getTenantId() {
  const store = als.getStore();
  return (store && store.tenantId) || 'public';
}

async function getNextId(tenantId) {
  const db = await connect();
  const key = `todos:${tenantId}`;
  const counters = db.collection('counters');
  let res = await counters.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after', returnOriginal: false }
  );
  if (!res || !res.value || typeof res.value.seq !== 'number') {
    // Initialize counter from current max id for this tenant
    const todos = db.collection('todos');
    const arr = await todos.find({ tenantId }).project({ id: 1 }).sort({ id: -1 }).limit(1).toArray();
    const last = arr && arr[0];
    const maxId = last && typeof last.id !== 'undefined' ? Number(last.id) : 0;
    await counters.updateOne({ _id: key }, { $set: { seq: maxId } }, { upsert: true });
    // Retry increment to get next value
    res = await counters.findOneAndUpdate(
      { _id: key },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after', returnOriginal: false }
    );
  }
  const seq = res && res.value && typeof res.value.seq === 'number' ? res.value.seq : 1;
  return seq;
}

// Helper: map Mongo doc to "row" compatible with existing routes mapper
function toRow(doc) {
  if (!doc) return null;
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    completed: doc.completed === 1 ? 1 : 0,
    created_at: doc.created_at,
  };
}

// SQLite-like adapter
const db = {
  // db.run(sql, params, function (err) { this.lastID; this.changes; })
  run(sql, params, cb) {
    (async () => {
      try {
        const dbh = await connect();
        const tenantId = getTenantId();
        const todos = dbh.collection('todos');
        const normalized = sql.replace(/\s+/g, ' ').trim().toUpperCase();

        if (normalized.startsWith('INSERT INTO TODOS')) {
          // Expect: INSERT INTO todos (title, description) VALUES (?, ?)
          const [title, description] = params;
          const delay = (ms) => new Promise((r) => setTimeout(r, ms));
          const tryInsert = async (attempt = 0) => {
            // Compute next id as max(id)+1 for this tenant
            const arr = await todos
              .find({ tenantId })
              .project({ id: 1 })
              .sort({ id: -1 })
              .limit(1)
              .toArray();
            const last = arr && arr[0];
            const id = (last && typeof last.id !== 'undefined' ? Number(last.id) : 0) + 1;
            const doc = {
              tenantId,
              id,
              title: (title || '').trim(),
              description: description || '',
              completed: 0,
              created_at: new Date().toISOString(),
            };
            try {
              await todos.insertOne(doc);
              cb && cb.call({ lastID: id, changes: 1 }, null);
            } catch (e) {
              if (e && e.code === 11000 && attempt < 7) {
                // Another concurrent insert won the race; backoff and retry
                await delay(20 * (attempt + 1));
                return tryInsert(attempt + 1);
              }
              throw e;
            }
          };
          await tryInsert(0);
          return;
        }

        if (normalized.startsWith('UPDATE TODOS SET')) {
          // Expect: UPDATE todos SET title = ?, description = ?, completed = ? WHERE id = ?
          const [title, description, completed, id] = params;
          const res = await todos.updateOne(
            { tenantId, id: Number(id) },
            { $set: { title: (title || '').trim(), description: description || '', completed: completed ? 1 : 0 } }
          );
          cb && cb.call({ changes: res.modifiedCount }, null);
          return;
        }

        if (normalized.startsWith('DELETE FROM TODOS')) {
          // Expect: DELETE FROM todos WHERE id = ?
          const [id] = params;
          const res = await todos.deleteOne({ tenantId, id: Number(id) });
          cb && cb.call({ changes: res.deletedCount }, null);
          return;
        }

        throw new Error('Unsupported SQL in adapter: ' + sql);
      } catch (err) {
        cb && cb(err);
      }
    })();
  },

  // db.get(sql, params, callback)
  get(sql, params, cb) {
    (async () => {
      try {
        const dbh = await connect();
        const tenantId = getTenantId();
        const todos = dbh.collection('todos');
        const normalized = sql.replace(/\s+/g, ' ').trim().toUpperCase();

        if (normalized.startsWith('SELECT * FROM TODOS WHERE ID =')) {
          const [id] = params;
          const doc = await todos.findOne({ tenantId, id: Number(id) });
          cb && cb(null, toRow(doc));
          return;
        }

        throw new Error('Unsupported SQL in adapter: ' + sql);
      } catch (err) {
        cb && cb(err);
      }
    })();
  },

  // db.all(sql, params, callback)
  all(sql, params, cb) {
    (async () => {
      try {
        const dbh = await connect();
        const tenantId = getTenantId();
        const todos = dbh.collection('todos');
        const normalized = sql.replace(/\s+/g, ' ').trim().toUpperCase();

        if (normalized.startsWith('SELECT * FROM TODOS ORDER BY CREATED_AT DESC')) {
          const docs = await todos
            .find({ tenantId })
            .sort({ created_at: -1 })
            .toArray();
          cb && cb(null, docs.map(toRow));
          return;
        }

        throw new Error('Unsupported SQL in adapter: ' + sql);
      } catch (err) {
        cb && cb(err);
      }
    })();
  },
};

// Tenant cookie middleware (no-login per-user isolation)
// - Agar cookie 'tid' nahi hai to generate karke set karega
// - ALS me tenantId store karega taaki db adapter queries ko scope kar sake
function tenantMiddleware(req, res, next) {
  // cookie-parser pe depend karta hai
  let tid = req.cookies && req.cookies.tid;
  if (!tid) {
    tid = uuidv4();
    // 1 year expiry, httpOnly false so FE read ki need nahi; sameSite=Lax
    res.cookie('tid', tid, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false, sameSite: 'Lax' });
  }
  als.run({ tenantId: tid }, () => next());
}

module.exports = db;
module.exports.tenantMiddleware = tenantMiddleware;
module.exports._als = als; // optional export for testing
