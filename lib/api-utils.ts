import { useAuthContext } from "@/providers/AuthProvider";

export async function handleApiResponse(response: Response) {
  if (response.status === 401) {
    // Get auth context
    const { logout } = useAuthContext();
    
    // Clear auth state and redirect to login
    logout();
    window.location.href = "/login?expired=true";
    
    throw new Error("Your session has expired. Please login again.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}
