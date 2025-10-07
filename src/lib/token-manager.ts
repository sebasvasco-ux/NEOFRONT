// Deprecated legacy token manager: replaced by server-managed opaque session.
// Kept as no-op to avoid runtime import errors while components are refactored.
export const tokenManager = {
  storeTokens: () => {},
  getAccessToken: () => null,
  refreshTokens: async () => null,
  clearTokens: () => {},
  isAuthenticated: () => false
};
