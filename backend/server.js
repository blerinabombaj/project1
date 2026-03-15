const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors'); // Required for frontend to talk to backend

// Load environment variables (useful for local development)
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001; // Backend will run on port 3001 inside the container

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.PGUSER || 'project1user',
  host: process.env.PGHOST || 'project1-app-db-service', // Name of the K8s DB service
  database: process.env.PGDATABASE || 'project1db',
  password: process.env.PGPASSWORD || 'project1pass',
  port: process.env.PGPORT || 5432,
});

// Test DB connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('PostgreSQL connected:', result.rows[0].now);
  });
});

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for now, for production specify frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json()); // For parsing application/json

// Ensure users table exists
const createUsersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table checked/created successfully.');
  } catch (err) {
    console.error('Error creating users table:', err.stack);
  }
};
createUsersTable();


// --- API Routes ---

// Register User
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, password_hash]);
    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    console.error('Registration error:', error.stack);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login User
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const result = await pool.query('SELECT id, password_hash FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // In a real app, you'd generate a JWT here and send it to the client
    res.status(200).json({ message: 'Logged in successfully!', username: user.username });

  } catch (error) {
    console.error('Login error:', error.stack);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).send('Backend is healthy');
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});