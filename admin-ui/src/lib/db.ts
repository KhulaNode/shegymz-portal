import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const DB_PATH = process.env.ADMIN_DB_PATH ?? path.join(process.cwd(), 'data', 'admin.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id          TEXT PRIMARY KEY,
        email       TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name        TEXT NOT NULL,
        role        TEXT NOT NULL CHECK(role IN ('ADMIN','TRAINER')),
        trainer_id  TEXT,
        created_at  TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    // Seed initial admin from env vars if table is empty
    const row = _db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }
    if (row.c === 0) {
      const email = process.env.ADMIN_EMAIL
      const password = process.env.ADMIN_PASSWORD
      if (email && password) {
        _db.prepare(
          'INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)'
        ).run(crypto.randomUUID(), email, bcrypt.hashSync(password, 12), 'Admin', 'ADMIN')
      }
    }
  }
  return _db
}

export interface DbUser {
  id: string
  email: string
  password_hash: string
  name: string
  role: 'ADMIN' | 'TRAINER'
  trainer_id: string | null
  created_at: string
}

export function findUserByEmail(email: string): DbUser | null {
  return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as DbUser | null
}

export function getAllUsers(): Omit<DbUser, 'password_hash'>[] {
  return getDb()
    .prepare('SELECT id, email, name, role, trainer_id, created_at FROM users ORDER BY role, name')
    .all() as Omit<DbUser, 'password_hash'>[]
}

export function createUser(
  email: string,
  password: string,
  name: string,
  role: 'ADMIN' | 'TRAINER',
  trainerId?: string | null
) {
  getDb()
    .prepare('INSERT INTO users (id, email, password_hash, name, role, trainer_id) VALUES (?, ?, ?, ?, ?, ?)')
    .run(crypto.randomUUID(), email, bcrypt.hashSync(password, 12), name, role, trainerId ?? null)
}

export function deleteUser(id: string) {
  getDb().prepare('DELETE FROM users WHERE id = ?').run(id)
}

export function updatePassword(id: string, newPassword: string) {
  getDb()
    .prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .run(bcrypt.hashSync(newPassword, 12), id)
}
