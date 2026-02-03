import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUsernameConfirmed() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["usernameConfirmed", user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from("profiles")
        .select("username_confirmed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking username confirmation:", error);
        return false;
      }

      return data?.username_confirmed ?? false;
    },
    enabled: !!user?.id,
  });
}
