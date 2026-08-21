import crypto from "crypto";

export type UserRole = "USER" | "MONITOR" | "ADMIN";

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  monitorId?: string | null;
  status?: string;
}

const AUTH_SECRET = process.env.AUTH_SECRET || "erafit_production_super_secret_key_2026_rbac_jwt";

/**
 * Hash password using PBKDF2 with salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(hash, "hex"));
  } catch (err) {
    return false;
  }
}

/**
 * Create a signed base64url JWT-style token
 */
export function signAuthToken(payload: AuthSessionUser, expiresInHours = 72): string {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const body = { ...payload, exp };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(body)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify signed token and return payload
 */
export function verifyAuthToken(token: string): AuthSessionUser | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      avatar: payload.avatar,
      monitorId: payload.monitorId,
      status: payload.status,
    };
  } catch (e) {
    return null;
  }
}

/**
 * Extract auth user from Request cookies or Authorization header
 */
export function getAuthUserFromRequest(req: Request): AuthSessionUser | null {
  // 1. Try Cookie
  const cookieHeader = req.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/erafit_token=([^;]+)/);
  if (tokenMatch && tokenMatch[1]) {
    const user = verifyAuthToken(tokenMatch[1]);
    if (user) return user;
  }

  // 2. Try Authorization header
  const authHeader = req.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return verifyAuthToken(token);
  }

  return null;
}
