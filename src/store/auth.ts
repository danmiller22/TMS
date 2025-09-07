// src/store/auth.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AllowedUser = { username: string; password: string };

// <<< ПРАВЬ ЗДЕСЬ: список разрешённых учёток >>>
const ALLOWED_USERS: AllowedUser[] = [
  { username: "usteam", password: "fleet2025" },
  // можно добавить ещё: { username: "disp", password: "*******" }
];

type User = { username: string };

type AuthState = {
  user: User | null;
  signIn: (username: string, password: string) => boolean;
  signOut: () => void;
  isAllowed: (username: string, password: string) => boolean;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAllowed: (u, p) =>
        ALLOWED_USERS.some(
          (x) => x.username.toLowerCase() === u.trim().toLowerCase() && x.password === p
        ),
      signIn: (u, p) => {
        const ok = get().isAllowed(u, p);
        if (ok) set({ user: { username: u.trim() } });
        return ok;
      },
      signOut: () => set({ user: null }),
    }),
    {
      name: "utcn-auth",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
