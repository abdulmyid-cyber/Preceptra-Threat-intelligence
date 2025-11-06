const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'threat_intel.db');

let db = null;

function init() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('✅ Connected to SQLite database');
      createTables().then(() => {
        seedDatabase().then(() => resolve()).catch(reject);
      }).catch(reject);
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    const schema = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
        oauth_provider TEXT,
        oauth_id TEXT,
        api_key TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- IOC Feeds table
      CREATE TABLE IF NOT EXISTS feeds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT DEFAULT 'json' CHECK(type IN ('json', 'csv', 'stix', 'taxii')),
        enabled INTEGER DEFAULT 1,
        user_id INTEGER,
        last_fetch DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- IOCs table
      CREATE TABLE IF NOT EXISTS iocs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('ip', 'domain', 'url', 'hash', 'email', 'file', 'other')),
        value TEXT NOT NULL,
        source TEXT,
        feed_id INTEGER,
        stix_object TEXT,
        first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE SET NULL
      );

      -- News Channels table
      CREATE TABLE IF NOT EXISTS news_channels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        enabled INTEGER DEFAULT 1,
        user_id INTEGER,
        last_fetch DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- User API Keys table (for external LLM services)
      CREATE TABLE IF NOT EXISTS user_api_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        service TEXT NOT NULL CHECK(service IN ('openai', 'anthropic', 'other')),
        api_key TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- TAXII Collections table
      CREATE TABLE IF NOT EXISTS taxii_collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- STIX Objects table (for TAXII)
      CREATE TABLE IF NOT EXISTS stix_objects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        object_id TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        collection_id TEXT,
        stix_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (collection_id) REFERENCES taxii_collections(collection_id) ON DELETE CASCADE
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_iocs_type ON iocs(type);
      CREATE INDEX IF NOT EXISTS idx_iocs_value ON iocs(value);
      CREATE INDEX IF NOT EXISTS idx_iocs_source ON iocs(source);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
    `;

    db.exec(schema, (err) => {
      if (err) {
        console.error('Error creating tables:', err);
        reject(err);
        return;
      }
      console.log('✅ Database tables created');
      resolve();
    });
  });
}

function seedDatabase() {
  return new Promise((resolve, reject) => {
    // Check if admin user exists
    db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (!row) {
        // Create global admin user
        const adminPassword = 'admin';
        bcrypt.hash(adminPassword, 10, (err, hash) => {
          if (err) {
            reject(err);
            return;
          }

          db.run(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            ['admin', 'admin@preceptra.com', hash, 'admin'],
            function(err) {
              if (err) {
                reject(err);
                return;
              }
              console.log('✅ Global admin user created (username: admin)');
              
              // Add default IOC feed
              db.run(
                'INSERT INTO feeds (name, url, type, enabled, user_id) VALUES (?, ?, ?, ?, ?)',
                ['GreedyBear Honeynet', 'https://greedybear.honeynet.org/api/feeds/all/all/recent.json', 'json', 1, this.lastID],
                (err) => {
                  if (err) {
                    console.error('Error adding default feed:', err);
                  } else {
                    console.log('✅ Default IOC feed added');
                  }
                  resolve();
                }
              );
            }
          );
        });
      } else {
        // Check if default feed exists
        db.get('SELECT id FROM feeds WHERE url = ?', ['https://greedybear.honeynet.org/api/feeds/all/all/recent.json'], (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          if (!row) {
            db.run(
              'INSERT INTO feeds (name, url, type, enabled) VALUES (?, ?, ?, ?)',
              ['GreedyBear Honeynet', 'https://greedybear.honeynet.org/api/feeds/all/all/recent.json', 'json', 1],
              (err) => {
                if (err) {
                  console.error('Error adding default feed:', err);
                } else {
                  console.log('✅ Default IOC feed added');
                }
                resolve();
              }
            );
          } else {
            resolve();
          }
        });
      }
    });
  });
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call init() first.');
  }
  return db;
}

function close() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log('Database connection closed');
        resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  init,
  getDb,
  close
};

