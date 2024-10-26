
//const dotenv= require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const PORT = process.env.PORT || 3001;
const cors = require("cors")
const bodyParser = require('body-parser');
const uri = process.env.MDB_CONNECTION_STRING

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());


let db; // Global variable to hold the database connection
let client;
// Connect to MongoDB and set up the database
function connectToMongo() {
  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  return client.connect()
      .then(() => {
          db = client.db("ThewriteInkco"); // Database name
          console.log('Connected to MongoDB');
      })
      .catch(error => {
          console.log('Failed to connect to MongoDB:', error.message);
          process.exit(1); // Exit the process if unable to connect to MongoDB
      });
}

// Invoke the function

// API endpoint for user signup
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

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Error inserting user: ", error);
    res.status(500).json({ message: error.message || `Internal Server Error: ${error}`});
  }
});
app.post('/login', async (req, res) => {
  try {
    
    const { authenticateUser } = await import('auth');

    const { email, password } = req.body;
    const user = await authenticateUser(email, password);

    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/getproducts', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('ThewriteInkco');
    const productsCollection = database.collection('Products Catalogue');

    const products = await productsCollection.find().toArray();
    res.json(products);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});
app.post('/addtocart', async (req, res) => {
  const product = req.body;

  try {
      const database = client.db('ThewriteInkco');
      const cartCollection = database.collection('Cart');
      let cart = await cartCollection.findOne({});

      if (!cart) {
          cart = { products: [] };
          await cartCollection.insertOne(cart);
      }
      await cartCollection.updateOne(
          {},
          { $push: { products: product } }
      );

      res.status(201).json({ message: 'Product added to cart', cart });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding product to cart', error });
  }
});
app.get('/customers', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('ThewriteInkco'); // Replace with your database name
        const usersCollection = database.collection('Customers'); // Replace with your collection name

        const users = await usersCollection.find().toArray();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } 
});
app.delete('/deleteuser', async (req, res) => {
  const email  = req.body;

  if (!email) {
      return res.status(400).json({ message: 'Email is required' });
  }

  try {
    await client.connect();
    const database = client.db('ThewriteInkco');
      const result = await database.collection('Customsers').deleteOne({ email });

      if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while deleting the user' });
  }
});

app.delete('/removefromcart', async (req, res) => {
  const productName = req.body;

  if (!productName) {
      return res.status(400).json({ message: 'Product name is required' });
  }

  try {
    await client.connect();
    const database = client.db('ThewriteInkco');
      const result = await database.collection('Cart').deleteOne({ productName });

      if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json({ message: 'Product removed successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while removing the product' });
  }
});
app.get('/locations', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('ThewriteInkco'); // Replace with your database name
        const locationCollection = database.collection('Pick-up-Locations'); // Replace with your collection name

        const locations = await locationCollection.find().toArray();
        res.json(locations);
    } catch (error) {
        console.error('Error fetching Locations:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } 
});
app.get('/history', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('ThewriteInkco'); // Replace with your database name
        const historyCollection = database.collection('Payment-History'); // Replace with your collection name

        const paymentHistory = await historyCollection.find().toArray();
        res.json(paymentHistory);
    } catch (error) {
        console.error('Error fetching Payment History:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } 
});



app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
connectToMongo();
  