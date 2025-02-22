import express from "express";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import swaggerFile from "./swagger_output.json";
import AllRouters from "./routers/index";

const app = express();

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

const allowedOrigins = [process.env.CLIENT_URL, process.env.NOTI_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/", AllRouters);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

export default app;
