import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, User, Users } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "manager" | "employee";
  created_at: string;
}

interface SupabaseUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  user_roles: Array<{ role: "admin" | "manager" | "employee" }>;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          created_at,
          user_roles!inner(role)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedUsers = data?.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: (user as any).user_roles?.[0]?.role || "employee",
        created_at: user.created_at,
      })) || [];

      setUsers(formattedUsers);
    } catch (error: any) {
      toast.error("Failed to fetch users", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: "admin" | "manager" | "employee") => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast.success("User role updated successfully");
    } catch (error: any) {
      toast.error("Failed to update user role", {
        description: error.message,
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "destructive",
      manager: "default",
      employee: "secondary",
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || "secondary"}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "manager":
        return <Users className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage user roles and permissions</p>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <h3 className="font-medium">{user.full_name || "No name"}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {getRoleBadge(user.role)}
                  <Select
                    value={user.role}
                    onValueChange={(value: "admin" | "manager" | "employee") =>
                      updateUserRole(user.id, value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
