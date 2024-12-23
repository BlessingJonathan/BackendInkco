/* eslint-disable jest/valid-expect */
import { expect, use } from "chai";
import chaiHttp from "chai-http";

const chai = use(chaiHttp);

describe("API Tests", () => {
  describe("GET /customers", () => {
    it("should return user data", async () => {
      const res = await chai.request
        .execute("http://localhost:3001")
        .get("/customers");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      console.log(res.body);
    });
  });

  describe("GET /cartitems", () => {
    it("should return cart items data", async () => {
      const res = await chai.request
        .execute("http://localhost:3001")
        .get("/cartitems");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      console.log(res.body);
    });
  });

  describe("GET /products", () => {
    it("should return product data", async () => {
      const res = await chai.request
        .execute("http://localhost:3001")
        .get("/products");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      console.log(res.body);
    });
  });

  describe("GET /history", () => {
    it("should return order history", async () => {
      const res = await chai.request
        .execute("http://localhost:3001")
        .get("/history");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      console.log(res.body);
    });
  });

  describe("GET /locations", () => {
    it("should return pickup locations", async () => {
      const res = await chai.request
        .execute("http://localhost:3001")
        .get("/locations");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      console.log(res.body);
    });
  });

  describe("POST /addLocation", () => {
    it("should add a new location and return 201", async () => {
      const res = await chai.request
        .execute("http://localhost:3001")
        .post("/addLocation")
        .send({ Suburb: "Downtown", City: "Cityville", Address: "456 Elm St" });
      expect(res).to.have.status(201);
      expect(res.body).to.have.property(
        "message",
        "Location added successfully"
      );
      expect(res.body).to.have.property("locationId");
      console.log(res.body);
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await chai.request
        .execute("http://localhost:3001")
        .post("/addLocation")
        .send({ Suburb: "Downtown" }); // Missing City and Address
      expect(res).to.have.status(400);
      expect(res.body).to.have.property(
        "message",
        "Suburb, City, and Address are required fields"
      );
       console.log(res.body);
    });
  });

  describe("POST /addtocart", () => {
    it("should add a product to the cart", async () => {
      const res = await chai.request
        .execute("http://localhost:3001")
        .post("/addtocart")
        .send({
          productId: "4440",
          name: "Stadeler Puncher",
          price: 35.99,
          quantity: 1,
        });
      expect(res).to.have.status(201);
      expect(res.body).to.be.an("object");
      console.log(res.body);
    });
  });

  describe("POST /addOrder", () => {
    it("should add an order with email, orderId, and orderNumber", async () => {
      const res = await chai.request
        .execute("http://localhost:3001")
        .post("/addOrder")
        .send({
          email: "bertanmichaels@gmail.com",
          orderId: "789fc20025640158705d22c8",
          orderNumber: "7894",
        });
      expect(res).to.have.status(201);
      expect(res.body).to.have.property("message", "Order added successfully");
      expect(res.body).to.have.property("orderId");
      console.log(res.body);
    });
  });

  describe("POST /signup", () => {
    it("should create a new user", async () => {
      const res = await chai.request
        .execute("http://localhost:3001")
        .post("/signup")
        .send({
          name: "Dillion Jays",
          email: "dillion@gmail.com",
          password: "dill987bgn",
        });
      expect(res).to.have.status(201);
      expect(res.body).to.have.property("message", "User created successfully");
      expect(res.body).to.have.property("userId");
       console.log(res.body);
    });

    it("should return an error if the password is too short", async () => {
      const res = await chai.request
        .execute("http://localhost:3001")
        .post("/signup")
        .send({
          name: "Dillion Jays",
          email: "dillion@gmail.com",
          password: "dil",
        });
      expect(res).to.have.status(500);
      expect(res.body).to.have.property("message", "Password too short");
    });

    it("should return an error if the email format is invalid", async () => {
      const res = await chai.request
        .execute("http://localhost:3001")
        .post("/signup")
        .send({
          name: "Dillion Jays",
          email: "dillion-email.com",
          password: "dill987bgn",
        });
      expect(res).to.have.status(500);
      expect(res.body).to.have.property("message", "Invalid email format");
    });

    it("should return an error if the user already exists", async () => {
      const res = await chai.request
        .execute("http://localhost:3001")
        .post("/signup")
        .send({
          name: "Dillion Jays",
          email: "dillion@gmail.com",
          password: "dill987bgn",
        });
      expect(res).to.have.status(500);
      expect(res.body).to.have.property("message", "User already exists");
    });
  });
});
