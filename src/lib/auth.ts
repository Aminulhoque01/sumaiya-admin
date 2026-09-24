 
const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (
  token: string
): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const setAdminUser = (
  user: unknown
): void => {
  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
};

export const getAdminUser = <T>(): T | null => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as T;
  } catch {
    return null;
  }
};

export const removeAdminUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = (): boolean => {
  return Boolean(getToken());
};

export const logout = (): void => {
  removeToken();
  removeAdminUser();
};
 
