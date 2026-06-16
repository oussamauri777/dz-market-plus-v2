import jwt from "jsonwebtoken";

export function getUserIdFromRequest(req: Request): string | null {
  // 1. Check Authorization Bearer header (JWT from mobile app)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const jwtSecret = process.env.NEXTAUTH_SECRET || "fallback-secret";
      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      return decoded.id;
    } catch {
      // Invalid JWT, fall through to x-user-id
    }
  }

  // 2. Fallback to x-user-id header (legacy mobile support)
  const xUserId = req.headers.get("x-user-id");
  if (xUserId) return xUserId;

  return null;
}
