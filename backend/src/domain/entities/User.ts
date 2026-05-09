export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional because we might not always return it
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
