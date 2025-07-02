export interface User {
  id: number;
  phone_number: string;
  name: string;
  bio?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
