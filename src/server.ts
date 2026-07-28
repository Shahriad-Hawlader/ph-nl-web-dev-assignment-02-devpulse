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

const initDB = async () => {
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')), 

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    )
    `);

    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description VARCHAR(20) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
      status VARCHAR(20) DEFAULT 'open' 
        CHECK (status IN ('open', 'in_progress', 'resolved')),
      reporter_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `,
    );
    console.log("DATABASE connected successfully.");
  } catch (error) {
    console.log(error);
  }
};

initDB();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "DevPulse Express Server",
    author: "Shahriad Hawlader",
  });
});

app.post("/api/auth/signup", async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    const result = await pool.query(
      `
    INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,COALESCE($4,'contributor'))
    RETURNING *
    `,
      [name, email, password, role],
    );

    delete result.rows[0].password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      errors: error,
    });
  }
});

app.listen(config.port, () => {
  console.log(`Example app listening on port ${config.port}`);
});
