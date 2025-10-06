import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type UserRole = "admin" | "manager" | "employee";

interface UserRoleWithDepartment {
  role: UserRole;
  department_id?: string;
  department_name?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: UserRoleWithDepartment[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, roles?: UserRoleWithDepartment[]) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<UserRoleWithDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user roles with department info
          setTimeout(async () => {
            const { data } = await supabase
              .from("user_roles")
              .select("role, department_id, departments(name)")
              .eq("user_id", session.user.id);
            
            const userRoles: UserRoleWithDepartment[] = (data || []).map((r: any) => ({
              role: r.role as UserRole,
              department_id: r.department_id,
              department_name: r.departments?.name,
            }));
            setRoles(userRoles.length > 0 ? userRoles : [{ role: "employee" }]);
          }, 0);
        } else {
          setRoles([]);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const { data } = await supabase
            .from("user_roles")
            .select("role, department_id, departments(name)")
            .eq("user_id", session.user.id);
          
          const userRoles: UserRoleWithDepartment[] = (data || []).map((r: any) => ({
            role: r.role as UserRole,
            department_id: r.department_id,
            department_name: r.departments?.name,
          }));
          setRoles(userRoles.length > 0 ? userRoles : [{ role: "employee" }]);
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Login failed", { description: error.message });
      throw error;
    }

    toast.success("Welcome back!");
    navigate("/");
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast.error("Signup failed", { description: error.message });
      throw error;
    }

    toast.success("Account created successfully!");
    navigate("/");
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error("Logout failed", { description: error.message });
      throw error;
    }

    toast.success("Logged out successfully");
    navigate("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, session, roles, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
