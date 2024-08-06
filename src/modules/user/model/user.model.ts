export interface User {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  bio: string;
  username: string;
  password: string;
  email: string;
  is_private: boolean;
}

export interface CreateUser{
  username:string;
  email: string;
  password: string;
}

