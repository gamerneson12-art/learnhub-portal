import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PDF {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  thumbnail_url: string | null;
  category_id: string | null;
  file_size: number | null;
  page_count: number | null;
  author: string | null;
  download_count: number;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    slug: string;
  } | null;
}

interface UsePDFsOptions {
  categorySlug?: string;
  searchQuery?: string;
  limit?: number;
}

export function usePDFs({ categorySlug, searchQuery, limit = 50 }: UsePDFsOptions = {}) {
  return useQuery({
    queryKey: ["pdfs", categorySlug, searchQuery, limit],
    queryFn: async (): Promise<PDF[]> => {
      let query = supabase
        .from("pdfs")
        .select(`
          *,
          categories (
            name,
            slug
          )
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (categorySlug) {
        const { data: category } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();

        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
}

export function usePDF(id: string) {
  return useQuery({
    queryKey: ["pdf", id],
    queryFn: async (): Promise<PDF | null> => {
      const { data, error } = await supabase
        .from("pdfs")
        .select(`
          *,
          categories (
            name,
            slug
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useTrackDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pdfId, userId }: { pdfId: string; userId: string }) => {
      // Insert download record
      const { error: historyError } = await supabase
        .from("download_history")
        .insert({ user_id: userId, pdf_id: pdfId });

      if (historyError) throw historyError;

      // Increment download count using RPC
      const { error: countError } = await supabase.rpc("increment_download_count", {
        pdf_id: pdfId,
      });

      if (countError) throw countError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfs"] });
    },
  });
}

export function useDownloadHistory(userId: string) {
  return useQuery({
    queryKey: ["download-history", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("download_history")
        .select(`
          *,
          pdfs (
            id,
            title,
            thumbnail_url,
            file_url,
            categories (
              name
            )
          )
        `)
        .eq("user_id", userId)
        .order("downloaded_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}
