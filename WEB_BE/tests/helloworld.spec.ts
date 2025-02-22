import request from "supertest";
import app from "../src/app";

describe("GET /helloworld", () => {
  let server;

  beforeAll((done) => {
    server = app.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test('should return "Hello, World!" and status 200', async () => {
    const response = await request(app).get("/test/helloworld");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Hello, World!");
  });
});
