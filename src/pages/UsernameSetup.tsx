import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UsernameCheckResult {
  available: boolean;
  suggestions: string[];
}

export default function UsernameSetup() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkResult, setCheckResult] = useState<UsernameCheckResult | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Set initial username from profile
  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile]);

  // Check if user should be on this page
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Debounced username availability check
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (username.length < 3) {
      setCheckResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      await checkUsername(username);
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [username]);

  const checkUsername = async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3) return;
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase.rpc("check_username_availability", {
        desired_username: usernameToCheck.toLowerCase().trim(),
      });

      if (error) throw error;
      
      const result = data as unknown as UsernameCheckResult;
      setCheckResult(result);
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !checkResult?.available) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          username: username.toLowerCase().trim(),
          username_confirmed: true 
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Username set!",
        description: `Your username is now @${username.toLowerCase().trim()}`,
      });

      // Refresh the page to update context, then navigate
      window.location.href = "/home";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set username",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setUsername(suggestion);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isValidUsername = username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center gap-2 mb-8">
        <BookOpen className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold text-primary">LearningHub</span>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose your username</CardTitle>
          <CardDescription>
            Pick a unique username for your profile. You can use letters, numbers, and underscores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  className="pl-8"
                  placeholder="your_username"
                  minLength={3}
                  maxLength={30}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!isChecking && checkResult?.available && isValidUsername && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {!isChecking && checkResult && !checkResult.available && isValidUsername && (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
              
              {username.length > 0 && username.length < 3 && (
                <p className="text-sm text-muted-foreground">
                  Username must be at least 3 characters
                </p>
              )}

              {!isChecking && checkResult && !checkResult.available && isValidUsername && (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">
                    This username is already taken. Try one of these:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {checkResult.suggestions.map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => selectSuggestion(suggestion)}
                      >
                        @{suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {!isChecking && checkResult?.available && isValidUsername && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Username is available!
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!checkResult?.available || isSubmitting || !isValidUsername}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting username...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
