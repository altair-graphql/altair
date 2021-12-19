export interface JwtPayload {
  username: string;
  sub: string;
}

export interface RequestUser {
  id: string;
  email: string;
}
