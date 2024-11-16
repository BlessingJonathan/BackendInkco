import { MongoClient } from "mongodb";

const uri = process.env.MDB_CONNECTION_STRING;
const client = new MongoClient(uri);
let db;

async function connectToDb() {
  if (!db) {
    await client.connect();
    db = client.db("ThewriteInkco");
  }
  return db;
}

function encodeBase64(data) {
  return Buffer.from(data).toString("base64");
}

function decodeBase64(data) {
  return Buffer.from(data, "base64").toString("utf-8");
}

export async function registerUser(email, password) {
  const db = await connectToDb();

  const encodedEmail = encodeBase64(email);
  const encodedPassword = encodeBase64(password);

  const result = await db.collection("Customers").insertOne({
    email: encodedEmail,
    password: encodedPassword,
    createdAt: new Date(),
  });

  return result.insertedId;
}

export async function authenticateUser(email, password) {
  const db = await connectToDb();

  const encodedEmail = encodeBase64(email);
  const encodedPassword = encodeBase64(password);

  const user = await db
    .collection("Customers")
    .findOne({ email: encodedEmail });

  if (!user) throw new Error("Invalid email or password");

  if (user.password !== encodedPassword)
    throw new Error("Invalid email or password");

  return { email: decodeBase64(user.email) };
}

connectToDb();
