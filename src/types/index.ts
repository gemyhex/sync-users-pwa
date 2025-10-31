// Existing AppUser structure (or similar, assuming it has an ID)
export interface AppUser {
  id: number;
  // Other user properties like name, email, etc.
  [key: string]: any; 
}

// Data structure for the login request body
export interface LoginCredentials {
  username: string;
  password: string;
}

// Data structure for the successful login API response
export interface AuthResponse {
  token: string;
  user: AppUser;
}

// Structure for encrypted user data stored in IndexedDB
export interface IdbUser {
  id: number;
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
}
