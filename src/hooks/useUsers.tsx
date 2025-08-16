import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type UserRole = Tables<"user_roles">;
type AppRole = "admin" | "manager" | "staff" | "viewer";

interface UserWithRole extends Profile {
  role?: AppRole;
}

export const useUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles (role)
        `);

      if (profilesError) throw profilesError;

      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        role: (profile.user_roles as any)?.[0]?.role || "viewer" as AppRole
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase.rpc("assign_user_role", {
        _user_id: userId,
        _role: role,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      await fetchUsers();
    } catch (error) {
      console.error("Error assigning role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const promoteToAdmin = async (userEmail: string) => {
    try {
      const { error } = await supabase.rpc("promote_user_to_admin", {
        _user_email: userEmail,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User promoted to admin successfully",
      });

      await fetchUsers();
    } catch (error) {
      console.error("Error promoting user:", error);
      toast({
        title: "Error",
        description: "Failed to promote user to admin",
        variant: "destructive",
      });
    }
  };

  const inviteUser = async (email: string, password: string, fullName: string, role: AppRole = "viewer") => {
    try {
      // Use Supabase auth to create user
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          full_name: fullName,
        },
        email_confirm: true,
      });

      if (error) throw error;

      // Assign role if user was created successfully
      if (data.user && role !== "viewer") {
        await assignRole(data.user.id, role);
      }

      toast({
        title: "Success",
        description: "User invited successfully",
      });

      await fetchUsers();
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        title: "Error",
        description: "Failed to invite user",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    assignRole,
    promoteToAdmin,
    inviteUser,
    refetch: fetchUsers,
  };
};