import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import config from "./config";
import { initDB, pool } from "./db";
import { authRoute } from "./modules/authentication/auth.route";

const app: Application = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "DevPulse Express Server",
    author: "Shahriad Hawlader",
  });
});

app.use("/api/auth", authRoute);

export default app;
