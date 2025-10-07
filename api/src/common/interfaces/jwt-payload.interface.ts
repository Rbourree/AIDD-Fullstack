export interface JwtPayload {
  sub: string;
  tenantId: string;
  email: string;
  iat?: number;
  exp?: number;
}
