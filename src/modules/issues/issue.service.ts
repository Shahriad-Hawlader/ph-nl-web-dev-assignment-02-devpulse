import { pool } from "../../db";

const createIssueIntoDB = async (payload: any) => {
  const { title, description, type, status } = payload;

  const result = await pool.query(
    `
    INSERT INTO issues(title, description, type, status) VALUES($1,$2,$3,COALESCE($4,'open'))
    RETURNING *
    `,
    [title, description, type, status],
  );

  return result;
};

export const issueService = {
  createIssueIntoDB,
};
