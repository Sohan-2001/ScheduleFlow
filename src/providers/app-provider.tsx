'use client';

// This provider was previously used to initialize availability in local storage.
// Since we are now using Firestore for availability, this provider is no longer needed
// and has been simplified to just render its children.
// It can be safely removed from the layout if no other app-wide context is needed.

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
