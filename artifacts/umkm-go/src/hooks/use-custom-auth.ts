import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, register, getMe, LoginRequest, RegisterRequest } from "@workspace/api-client-react";
import { setToken, setUser, logoutUser, getToken } from "@/lib/auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Wrapper hooks that handle localStorage and redirection
export function useAuth() {
  const token = getToken();
  return useQuery({
    queryKey: ["/api/auth/me", token],
    queryFn: async () => {
      if (!token) throw new Error("No token");
      const user = await getMe({ headers: { Authorization: `Bearer ${token}` } });
      setUser(user);
      return user;
    },
    retry: false,
    enabled: !!token,
  });
}

export function useLoginAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await login(data);
      return res;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({ title: "Login successful", description: "Welcome back to UMKM Go!" });
      
      if (data.user.role === 'admin' || data.user.role === 'super_admin') {
        setLocation("/admin/dashboard");
      } else if (data.user.hasStore) {
        setLocation("/dashboard");
      } else {
        setLocation("/onboarding");
      }
    },
    onError: (error: any) => {
      toast({ 
        title: "Login failed", 
        description: error?.message || "Invalid credentials", 
        variant: "destructive" 
      });
    }
  });
}

export function useRegisterAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const res = await register(data);
      return res;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Registration successful", description: "Let's set up your store!" });
      setLocation("/onboarding");
    },
    onError: (error: any) => {
      toast({ 
        title: "Registration failed", 
        description: error?.message || "Please check your details", 
        variant: "destructive" 
      });
    }
  });
}

export function useLogoutAction() {
  return () => {
    logoutUser();
  };
}
