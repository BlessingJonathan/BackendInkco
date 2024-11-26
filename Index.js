import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const uri = process.env.MDB_CONNECTION_STRING;
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; 
  if (!token) {
    return res.status(401).json({ message: "Access token is missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

let db;
let client;

async function connectToMongo() {
  try {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    db = client.db("ThewriteInkco");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

app.use((_, res, next) => {
  if (!db) {
    return res.status(500).json({ message: "Database not initialized" });
  }
  next();
});

app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (password.length < 6) throw new Error("Password must be at least 6 characters long.");
    if (!email.includes("@")) throw new Error("Invalid email format.");

    const existingUser = await db.collection("Customers").findOne({ email });
    if (existingUser) throw new Error("User already exists.");


    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("Customers").insertOne({ email, password: hashedPassword });

    res.status(201).json({ message: "User created successfully", email });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(400).json({ message: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.collection("Customers").findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid password." });

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token, email: user.email });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(400).json({ message: error.message });
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
app.get("/cartitems", authenticateToken, async (req, res) => {
  try {
    const database = client.db("ThewriteInkco");
    const cartItemsCollection = database.collection("Cart");

    const cartItems = await cartItemsCollection.find({ email: req.user.email }).toArray();
    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Error fetching cart items" });
  }
});

app.post("/addtocart", authenticateToken, async (req, res) => {
  const { product } = req.body;

  if (!product) {
    return res.status(400).json({ message: "Product details are required." });
  }

  try {
    const database = client.db("ThewriteInkco");
    const cartCollection = database.collection("Cart");
    await cartCollection.insertOne({ email: req.user.email, product });

    res.status(201).json({ message: "Product added to cart", product });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Error adding product to cart", error });
  }
});


app.post("/addOrder",authenticateToken, async (req, res) => {
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
      email: req.user.email,
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
app.post("/refresh-token", authenticateToken, (req, res) => {
  const email = req.user.email;
  const newToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
  res.status(200).json({ token: newToken });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

connectToMongo();

