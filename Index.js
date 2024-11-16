import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import bodyParser from "body-parser";
import {authenticateUser) from '../server/Auth.js'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const uri = process.env.MDB_CONNECTION_STRING;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

let db; 
let client;


function connectToMongo() {
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return client
    .connect()
    .then(() => {
      db = client.db("ThewriteInkco"); // Database name
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.log("Failed to connect to MongoDB:", error.message);
      process.exit(1);
    });
}

app.post("/signup", async (req, res) => {
  try {
    const user = req.body;

    if (user.password.length < 6) throw new Error("Password too short");
    if (!user.email.includes("@")) throw new Error("Invalid email format");

    const collection = db.collection("Customers");

    const existingUser = await collection.findOne({ email: user.email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const result = await collection.insertOne({
      ...user,
      createdAt: new Date(),
    });
    const userId = await registerUser(db, email, password);
    res.status(201).json({
      message: "User created successfully",
      userId
    });
  } catch (error) {
    console.error("Error inserting user: ", error);
    res
      .status(500)
      .json({ message: error.message || `Internal Server Error: ${error}` });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser(db, email, password); 
    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/products", async (_, res) => {
  try {
    await client.connect();
    const database = client.db("ThewriteInkco");
    const productsCollection = database.collection("Product catalogue");

    const products = await productsCollection.find().toArray();
    res.json(products);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});
app.get("/cartitems", async (_, res) => {
  try {
    await client.connect();
    const database = client.db("ThewriteInkco");
    const cartItemsCollection = database.collection("Cart");

    const cartItems = await cartItemsCollection.find().toArray();
    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

app.post("/addtocart", async (req, res) => {
  const product = req.body;

  if (!product) {
    return res.status(400).json({ message: "Product details are required." });
  }

  try {
    const database = client.db("ThewriteInkco");
    const cartCollection = database.collection("Cart");
    await cartCollection.insertOne({ product });

    res.status(201).json({ message: "Product added to cart", product });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Error adding product to cart", error });
  }
});

app.post("/addOrder", async (req, res) => {
  const { email, orderId, orderNumber } = req.body;

  if (!email || !orderId || !orderNumber) {
    return res.status(400).json({
      message: "Missing required fields: email, orderId, or orderNumber",
      missingFields: {
        email: !email,
        orderId: !orderId,
        orderNumber: !orderNumber,
      },
    });
  }

  try {
    const database = client.db("ThewriteInkco");
    const ordersCollection = database.collection("Customer orders");

    const newOrder = {
      email,
      orderId,
      orderNumber,
      createdAt: new Date(),
    };

    const result = await ordersCollection.insertOne(newOrder);

    res.status(201).json({
      message: "Order added successfully",
      orderId: result.insertedId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error adding order",
      error: error.message,
    });
  }
});

app.get("/customers", async (_, res) => {
  try {
    await client.connect();
    const database = client.db("ThewriteInkco");
    const usersCollection = database.collection("Customers");

    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/deleteuser", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    await client.connect();
    const database = client.db("ThewriteInkco");
    const result = await database.collection("Customers").deleteOne({ email });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the user" });
  }
});

app.delete("/removefromcart", async (req, res) => {
  const { productName } = req.body;

  if (!productName) {
    return res.status(400).json({ message: "Product name is required" });
  }

  try {
    await client.connect();
    const database = client.db("ThewriteInkco");
    const result = await database.collection("Cart").deleteOne({ productName });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product removed successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while removing the product" });
  }
});

app.get("/locations", async (_, res) => {
  try {
    await client.connect();
    const database = client.db("ThewriteInkco");
    const locationCollection = database.collection("Pick up Locations");

    const locations = await locationCollection.find().toArray();
    res.json(locations);
  } catch (error) {
    console.error("Error fetching Locations:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.post("/addLocation", async (req, res) => {
  const { Suburb, City, Address } = req.body;

  // Check if location data is provided
  if (!Suburb || !City || !Address) {
    return res
      .status(400)
      .json({ message: "Suburb, City, and Address are required fields" });
  }

  try {
    const database = client.db("ThewriteInkco");
    const locationCollection = database.collection("Pick up Locations");

    const newLocation = { Suburb, City, Address, createdAt: new Date() };
    const result = await locationCollection.insertOne(newLocation);

    res.status(201).json({
      message: "Location added successfully",
      locationId: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding location:", error);
    res.status(500).json({
      message: "Error adding location",
      error: error.message,
    });
  }
});

app.get("/history", async (_, res) => {
  try {
    await client.connect();
    const database = client.db("ThewriteInkco");
    const historyCollection = database.collection("Payment History");

    const paymentHistory = await historyCollection.find().toArray();
    res.json(paymentHistory);
  } catch (error) {
    console.error("Error fetching Payment History:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

connectToMongo();
