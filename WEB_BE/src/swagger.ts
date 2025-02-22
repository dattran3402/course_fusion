import swaggerAutogen from "swagger-autogen";
import * as dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT;

console.log("PORT", PORT);

swaggerAutogen();

const doc = {
  info: {
    title: "My API",
    description: "Description",
  },
  host: `localhost:${PORT}`,
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./routers/index.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);
