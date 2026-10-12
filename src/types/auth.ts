export interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface AuthCredentials {
  email: string;
  password: string;
  name?: string; // register only
}
