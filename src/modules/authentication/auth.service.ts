import config from "../../config";
import { pool } from "../../db";
import type { IUser, IUserLogin } from "./auth.interface";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,COALESCE($4,'contributor'))
    RETURNING *
    `,
    [name, email, hashedPassword, role],
  );

  delete result.rows[0].password;

  return result;
};

const loginUserIntoDB = async (payload: IUserLogin) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new Error("Invalid credentials!");
  }

  const user = userData.rows[0];

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) {
    throw new Error("Invalid credentials!");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(jwtPayload, config.secret as string, {
    expiresIn: "1d",
  });

  delete user.password;

  return { token, user };
};

export const authService = {
  registerUserIntoDB,
  loginUserIntoDB,
};
