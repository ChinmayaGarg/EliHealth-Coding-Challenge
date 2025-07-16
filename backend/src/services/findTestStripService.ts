import { db } from '../db/db';
import { SELECT_HISTORY, SELECT_PAGINATED, SELECT_BY_ID } from '../db/queries';

export const getTestStripHistory = async () => {
  const { rows } = await db.query(SELECT_HISTORY);
  return rows;
};

export const getPaginatedTestStrips = async (limit: number, offset: number) => {
  const { rows } = await db.query(SELECT_PAGINATED, [limit, offset]);
  return rows;
};

export const getTestStripById = async (id: string) => {
  const { rows } = await db.query(SELECT_BY_ID, [id]);
  return rows[0] || null;
};
