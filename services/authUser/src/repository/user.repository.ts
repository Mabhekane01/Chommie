// src/database/users.ts
import { QueryResult, query } from '@packages/database';
import { withTransaction } from '@packages/database';
import { User } from '@packages/database';

export async function getAllUsers() {
  const res = await query('SELECT * FROM users');
  return res.rows;
}

export const findUserByPhone = (phone: string): Promise<QueryResult<User>> =>
  query<User>('SELECT * FROM users WHERE phone_number = $1', [phone]);

export const createUser = async (phone: string): Promise<User> =>
  withTransaction(async client => {
    const res = await client.query<User>(
      `
      INSERT INTO users (phone_number, profile_public, name, bio, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *;
    `,
      [phone, false, '', '']
    );
    return res.rows[0];
  });

export const updateUserName = (
  id: number,
  name: string
): Promise<QueryResult> =>
  query('UPDATE users SET name = $2, updated_at = NOW() WHERE id = $1', [
    id,
    name,
  ]);

export const updateUserBio = (id: number, bio: string): Promise<QueryResult> =>
  query('UPDATE users SET bio = $2, updated_at = NOW() WHERE id = $1', [
    id,
    bio,
  ]);

export const updateUserProfileVisibility = (
  id: number,
  isPublic: boolean
): Promise<QueryResult> =>
  query(
    'UPDATE users SET profile_public = $2, updated_at = NOW() WHERE id = $1',
    [id, isPublic]
  );

export const findUserById = (id: number): Promise<QueryResult<User>> =>
  query<User>('SELECT * FROM users WHERE id = $1', [id]);
