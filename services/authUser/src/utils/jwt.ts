// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { jwtConfig } from '@packages/config/env';
import { logger } from '@packages/config/logger';

export interface JwtPayload {
  userId: number;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: number;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * Generate an access token
 */
export const generateAccessToken = (userId: number): string => {
  try {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId,
      type: 'access',
    };

    const options: jwt.SignOptions = {
      expiresIn: jwtConfig.accessTokenExpiry,
      issuer: 'superapp-auth',
      audience: 'superapp-users',
    };

    const token = jwt.sign(payload, jwtConfig.accessSecret, options);

    logger.debug('Access token generated', { userId });
    return token;
  } catch (error) {
    logger.error('Failed to generate access token', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('TOKEN_GENERATION_FAILED');
  }
};

/**
 * Generate a refresh token
 */
export const generateRefreshToken = (userId: number): string => {
  try {
    const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
      userId,
      type: 'refresh',
    };

    const options: jwt.SignOptions = {
      expiresIn: jwtConfig.refreshTokenExpiry,
      issuer: 'superapp-auth',
      audience: 'superapp-users',
    };

    const token = jwt.sign(payload, jwtConfig.refreshSecret, options);

    logger.debug('Refresh token generated', { userId });
    return token;
  } catch (error) {
    logger.error('Failed to generate refresh token', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('TOKEN_GENERATION_FAILED');
  }
};

/**
 * Verify an access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const options: jwt.VerifyOptions = {
      issuer: 'superapp-auth',
      audience: 'superapp-users',
    };

    const decoded = jwt.verify(
      token,
      jwtConfig.accessSecret,
      options
    ) as JwtPayload;

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid access token', {
        error: error.message,
        tokenPreview: token.substring(0, 20) + '...',
      });
      throw new Error('INVALID_TOKEN');
    }

    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Access token expired', {
        expiredAt: error.expiredAt,
      });
      throw new Error('TOKEN_EXPIRED');
    }

    if (error instanceof jwt.NotBeforeError) {
      logger.warn('Access token not active', {
        date: error.date,
      });
      throw new Error('TOKEN_NOT_ACTIVE');
    }

    logger.error('Access token verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('TOKEN_VERIFICATION_FAILED');
  }
};

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const options: jwt.VerifyOptions = {
      issuer: 'superapp-auth',
      audience: 'superapp-users',
    };

    const decoded = jwt.verify(
      token,
      jwtConfig.refreshSecret,
      options
    ) as RefreshTokenPayload;

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid refresh token', {
        error: error.message,
        tokenPreview: token.substring(0, 20) + '...',
      });
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Refresh token expired', {
        expiredAt: error.expiredAt,
      });
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }

    if (error instanceof jwt.NotBeforeError) {
      logger.warn('Refresh token not active', {
        date: error.date,
      });
      throw new Error('REFRESH_TOKEN_NOT_ACTIVE');
    }

    logger.error('Refresh token verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('REFRESH_TOKEN_VERIFICATION_FAILED');
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Failed to decode token', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as any;
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    logger.error('Failed to get token expiration', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true;
  }
  return expiration < new Date();
};

/**
 * Generate token pair (access + refresh)
 */
export const generateTokenPair = (userId: number) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
    expiresIn: 900, // 15 minutes for access token
  };
};
