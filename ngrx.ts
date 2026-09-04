interface AppState {
  auth: AuthState;
  clients: ClientsState;
  ui: UiState;
}

interface AppState {
  auth: AuthState;      // ← esto apunta a otra interface
  clients: ClientsState; // ← esto también
  ui: UiState;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}