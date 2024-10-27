<<<<<<< HEAD

const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const uri = process.env.MDB_CONNECTION_STRING
; 
const client = new MongoClient(uri );
let db;

async function connectToDb() {
  if (!db) {
    await client.connect();
    db = client.db('ThewriteInkco'); 
  }
  return db;
}
async function registerUser(email, password) {
  const db = await connectToDb();
  const hashedPassword = await bcrypt.hash(password);

  const result = await db.collection('Customers').insertOne({
    email,
    password: hashedPassword
  });

  return result.insertedId;
}
async function authenticateUser(email, password) {
  const db = await connectToDb();
  const user = await db.collection('Customers').findOne({ email });

  if (!user) throw new Error('Invalid email or password');
    console.log('Wrong email')
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');
  console.log('Wrong password')
  return { email: user.email };
}

module.exports = {
  registerUser,
  authenticateUser
};
=======

const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const uri = process.env.MDB_CONNECTION_STRING
; 
const client = new MongoClient(uri );
let db;

async function connectToDb() {
  if (!db) {
    await client.connect();
    db = client.db('ThewriteInkco'); 
  }
  return db;
}
async function registerUser(email, password) {
  const db = await connectToDb();
  const hashedPassword = await bcrypt.hash(password);

  const result = await db.collection('Customers').insertOne({
    email,
    password: hashedPassword
  });

  return result.insertedId;
}
async function authenticateUser(email, password) {
  const db = await connectToDb();
  const user = await db.collection('Customers').findOne({ email });

  if (!user) throw new Error('Invalid email or password');
    console.log('Wrong email')
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');
  console.log('Wrong password')
  return { email: user.email };
}

module.exports = {
  registerUser,
  authenticateUser
};
>>>>>>> b55e07e953472d39f611ec4a73b23f90cef3a1a7
connectToDb();