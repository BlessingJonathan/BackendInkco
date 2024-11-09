import { expect, use } from "chai";
import chaiHttp from "chai-http";

const chai = use(chaiHttp);

describe("GET /customers", () => {
  it("should return user data", (done) => {
    chai.request
      .execute("http://localhost:3001")
      .get("/customers")
      .end((err, res) => {
        console.log(res.body);
        if (err) done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });
});
describe("GET /cartitems", () => {
    it("should return user data", (done) => {
      chai.request
        .execute("http://localhost:3001")
        .get("/cartitems")
        .end((err, res) => {
          console.log(res.body);
          if (err) done(err);
  
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          done();
        });
    });
  });

describe("GET /products", () => {
  it("should return user data", (done) => {
    chai.request
      .execute("http://localhost:3001")
      .get("/products")
      .end((err, res) => {
        console.log(res.body);
        if (err) done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });
});
describe("GET /history", () => {
  it("should return user data", (done) => {
    chai.request
      .execute("http://localhost:3001")
      .get("/history")
      .end((err, res) => {
        console.log(res.body);
        if (err) done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });
});

describe("GET /locations", () => {
  it("should return user data", (done) => {
    chai.request
      .execute("http://localhost:3001")
      .get("/locations")
      .end((err, res) => {
        console.log(res.body); // Log the response body for debugging
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array"); // Check that the response is an object
        done();
      });
  });
});

describe("POST /addtocart", () => {
  it("should add a product to the cart ", (done) => {
    chai.request
      .execute("http://localhost:3001")
      .post("/addtocart")
      .send({
        productId: "5690",
        name: "Bic Stapler",
        price: 35.99,
        quantity: 2,
      })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(201);
        expect(res.body).to.be.an("object");
        expect(res.body.cart).to.be.an("object");
        expect(res.body.cart.products).to.include({
          productId: "5609",
          name: "Bic Stapler",
          price: 35.99,
          quantity: 2,
        });
        done();
      });
  });
});
describe("POST /addOrder", () => {
  it("should add a product to the cart ", (done) => {
    chai.request
      .execute("http://localhost:3001")
      .post("/addOrder")
      .send({
        ProductID: "45t67",
        Transaction_number: "28-765-3000",
        Transcation_amount: "R29.99",
        Email: "jerrymyers@micheals.com",
        Order_number: "4510",
        Product_name: "Bic Starter Pack",
      })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(201);
        expect(res.body).to.be.an("object");
        expect(res.body.cart).to.be.an("object");
        expect(res.body.cart.products).to.include({
            ProductID: "45t67",
            Transaction_number: "28-765-3000",
            Transcation_amount: "R29.99",
            Email: "jerrymyers@micheals.com",
            Order_number: "4510",
            Product_name: "Bic Starter Pack",
        });
        done();
      });
  });
});

describe("POST /signup", () => {
  it("should create a new user and return a success message", (done) => {
    chai.request
      .execute("http://localhost:3001")
      .post("/signup")
      .send({
        name: "Allan Bart",
        email: "bartallan@gmail.com",
        password: "all-bar££>66",
      })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(201);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("userId");
        expect(res.body).to.have.property(
          "message",
          "User created successfully"
        );
        done();
      });
  });
});

/*
import chai from 'chai';
import chaiHttp from 'chai-http';
import { MongoClient } from 'mongodb';

const { expect } = chai;
chai.use(chaiHttp);

let apiUrl;
let db;
let client;

describe('User API', () => {
    
   L
    before(async () => {
       
        apiUrl = 'http://localhost:3001';

       
        const uri = process.env.MDB_CONNECTION_STRING; // Ensure your connection string is in environment variables
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        try {
         
            await client.connect();
            db = client.db('ThewriteInkco'); // Replace with your actual database name
            console.log('Connected to MongoDB and setup completed before all tests.');

           
            await db.collection('Customers').insertOne({ 
                name: "Test User", 
                email: "testuser@example.com",
                password: "testpass123" // Hashing passwords recommended in actual apps
            });

        } catch (error) {
            console.error('Failed to connect to MongoDB:', error.message);
            throw error; // Fail the tests if database connection fails
        }
    });

    after(async () => {
       
        await db.collection('Customers').deleteMany({ email: "testuser@example.com" });

        await client.close(); // Close MongoDB connection
        console.log('Disconnected from MongoDB after all tests.');
    });

    it('should return user data', (done) => {
        chai.request(apiUrl)
            .get('/users')
            .end((err, res) => {
                if (err) done(err);

                
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                expect(res.body[0]).to.have.property('email').equal("testuser@example.com");

                done();
            });
    });
});

*/
