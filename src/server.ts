import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import config from "./config";
import { Pool } from "pg";

const app: Application = express();

app.use(express.json());

const pool = new Pool({
  connectionString: config.connection_string,
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "DevPulse Express Server",
    author: "Shahriad Hawlader",
  });
});

app.listen(config.port, () => {
  console.log(`Example app listening on port ${config.port}`);
});
