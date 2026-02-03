
-- Add username_confirmed column to profiles
ALTER TABLE public.profiles 
ADD COLUMN username_confirmed boolean NOT NULL DEFAULT false;

-- Create function to check username availability and suggest alternatives
CREATE OR REPLACE FUNCTION public.check_username_availability(desired_username text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_available boolean;
  suggestions text[] := '{}';
  base_name text;
  i integer;
  candidate text;
BEGIN
  -- Check if the exact username is available
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE username = desired_username
  ) INTO is_available;
  
  -- If not available, generate suggestions
  IF NOT is_available THEN
    base_name := desired_username;
    
    -- Generate 5 suggestions with random suffixes
    FOR i IN 1..5 LOOP
      candidate := base_name || '_' || floor(random() * 9000 + 1000)::text;
      -- Only add if this suggestion is available
      IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) THEN
        suggestions := array_append(suggestions, candidate);
      END IF;
    END LOOP;
  END IF;
  
  RETURN jsonb_build_object(
    'available', is_available,
    'suggestions', to_jsonb(suggestions)
  );
END;
$$;
