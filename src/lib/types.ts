export interface Teacher {
  id: number;
  name: string;
  subject: string;
  image_url: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin";
}

export interface Vote {
  id: number;
  user_id: string;
  teacher_id: number;
  created_at: string;
}

export interface TeacherWithVotes extends Teacher {
  vote_count: number;
}

export interface SessionData {
  user: User;
  expires: number;
}
