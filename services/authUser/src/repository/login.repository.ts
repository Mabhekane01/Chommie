// src/database/userLogin.ts - Updated Repository
import { QueryResult, query } from '@packages/database';
import { withTransaction } from '@packages/database';
import { UserLogin } from '../types/UserLogin.js';

export const createUserLogin = async (
  userId: number,
  ipAddress: string,
  userAgent: string,
  device: string,
  browser: string,
  os: string,
  country?: string | null,
  city?: string | null
): Promise<UserLogin> =>
  withTransaction(async client => {
    const res = await client.query<UserLogin>(
      `
      INSERT INTO user_login
        (user_id, ip_address, user_agent, device, browser, os, country, city, login_time, is_active)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), TRUE)
      RETURNING 
        id,
        user_id as "userId",
        ip_address as "ipAddress", 
        user_agent as "userAgent",
        device,
        browser,
        os,
        country,
        city,
        login_time as "loginTime",
        logout_time as "logoutTime",
        is_active as "isActive";
    `,
      [
        userId,
        ipAddress,
        userAgent,
        device,
        browser,
        os,
        country ?? null,
        city ?? null,
      ]
    );
    return res.rows[0];
  });

export const markLogout = async (userId: number): Promise<QueryResult> =>
  query(
    `
    UPDATE user_login
    SET logout_time = NOW(),
        is_active = FALSE
    WHERE user_id = $1 AND is_active = TRUE
    `,
    [userId]
  );

export const getUserActiveSessions = async (
  userId: number
): Promise<QueryResult<UserLogin>> =>
  query<UserLogin>(
    `
    SELECT 
      id,
      user_id as "userId",
      ip_address as "ipAddress", 
      user_agent as "userAgent",
      device,
      browser,
      os,
      country,
      city,
      login_time as "loginTime",
      logout_time as "logoutTime",
      is_active as "isActive"
    FROM user_login 
    WHERE user_id = $1 AND is_active = TRUE 
    ORDER BY login_time DESC
    `,
    [userId]
  );

export const getUserLoginHistory = async (
  userId: number,
  limit: number = 10
): Promise<QueryResult<UserLogin>> =>
  query<UserLogin>(
    `
    SELECT 
      id,
      user_id as "userId",
      ip_address as "ipAddress", 
      user_agent as "userAgent",
      device,
      browser,
      os,
      country,
      city,
      login_time as "loginTime",
      logout_time as "logoutTime",
      is_active as "isActive"
    FROM user_login 
    WHERE user_id = $1 
    ORDER BY login_time DESC 
    LIMIT $2
    `,
    [userId, limit]
  );

export const getLoginById = async (
  id: number
): Promise<QueryResult<UserLogin>> =>
  query<UserLogin>(
    `
    SELECT 
      id,
      user_id as "userId",
      ip_address as "ipAddress", 
      user_agent as "userAgent",
      device,
      browser,
      os,
      country,
      city,
      login_time as "loginTime",
      logout_time as "logoutTime",
      is_active as "isActive"
    FROM user_login 
    WHERE id = $1
    `,
    [id]
  );

export const getUserCurrentLogin = async (
  userId: number
): Promise<QueryResult<UserLogin>> =>
  query<UserLogin>(
    `
    SELECT 
      id,
      user_id as "userId",
      ip_address as "ipAddress", 
      user_agent as "userAgent",
      device,
      browser,
      os,
      country,
      city,
      login_time as "loginTime",
      logout_time as "logoutTime",
      is_active as "isActive"
    FROM user_login 
    WHERE user_id = $1 AND is_active = TRUE 
    ORDER BY login_time DESC 
    LIMIT 1
    `,
    [userId]
  );

export const markSpecificLoginLogout = async (
  loginId: number
): Promise<QueryResult> =>
  query(
    `
    UPDATE user_login
    SET logout_time = NOW(),
        is_active = FALSE
    WHERE id = $1 AND is_active = TRUE
    `,
    [loginId]
  );

export const updateLoginLocation = async (
  loginId: number,
  country: string,
  city: string
): Promise<QueryResult> =>
  query(
    `
    UPDATE user_login
    SET country = $2, city = $3
    WHERE id = $1
    `,
    [loginId, country, city]
  );

// Additional functions that might be needed
export const logoutAllUserSessions = async (
  userId: number,
  excludeSessionId?: number
): Promise<QueryResult> => {
  if (excludeSessionId) {
    return query(
      `
      UPDATE user_login
      SET logout_time = NOW(),
          is_active = FALSE
      WHERE user_id = $1 AND is_active = TRUE AND id != $2
      `,
      [userId, excludeSessionId]
    );
  } else {
    return markLogout(userId);
  }
};

export const getUserSessionCount = async (userId: number): Promise<number> => {
  const result = await query(
    `SELECT COUNT(*) as count FROM user_login WHERE user_id = $1 AND is_active = TRUE`,
    [userId]
  );
  return parseInt(result.rows[0].count);
};
