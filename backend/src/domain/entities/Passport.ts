export interface Passport {
  id: string;
  title: string;
  description: string | null;
  tag: string | null;
  userId: string;
  unlockDate: Date | null;
  createdAt: Date;
}
