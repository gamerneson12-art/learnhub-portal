import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PDFFormData {
  title: string;
  description: string;
  category_id: string;
  author: string;
  page_count: number | null;
  pdfFile: File | null;
  thumbnailFile: File | null;
}

interface UpdatePDFData extends PDFFormData {
  id: string;
  existingFileUrl: string;
  existingThumbnailUrl: string | null;
}

export function useCreatePDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PDFFormData) => {
      if (!data.pdfFile) {
        throw new Error("PDF file is required");
      }

      // Upload PDF file
      const pdfFileName = `${Date.now()}-${data.pdfFile.name}`;
      const { error: pdfUploadError } = await supabase.storage
        .from("pdfs")
        .upload(pdfFileName, data.pdfFile);

      if (pdfUploadError) throw pdfUploadError;

      const { data: pdfUrlData } = supabase.storage
        .from("pdfs")
        .getPublicUrl(pdfFileName);

      // Upload thumbnail if provided
      let thumbnailUrl: string | null = null;
      if (data.thumbnailFile) {
        const thumbFileName = `${Date.now()}-${data.thumbnailFile.name}`;
        const { error: thumbUploadError } = await supabase.storage
          .from("thumbnails")
          .upload(thumbFileName, data.thumbnailFile);

        if (thumbUploadError) throw thumbUploadError;

        const { data: thumbUrlData } = supabase.storage
          .from("thumbnails")
          .getPublicUrl(thumbFileName);
        thumbnailUrl = thumbUrlData.publicUrl;
      }

      // Insert PDF record
      const { error: insertError } = await supabase.from("pdfs").insert({
        title: data.title,
        description: data.description || null,
        category_id: data.category_id || null,
        author: data.author || null,
        page_count: data.page_count,
        file_url: pdfUrlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        file_size: data.pdfFile.size,
      });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      toast.success("PDF uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["pdfs"] });
    },
    onError: (error) => {
      toast.error(`Failed to upload PDF: ${error.message}`);
    },
  });
}

export function useUpdatePDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePDFData) => {
      let fileUrl = data.existingFileUrl;
      let thumbnailUrl = data.existingThumbnailUrl;
      let fileSize: number | undefined;

      // Upload new PDF file if provided
      if (data.pdfFile) {
        const pdfFileName = `${Date.now()}-${data.pdfFile.name}`;
        const { error: pdfUploadError } = await supabase.storage
          .from("pdfs")
          .upload(pdfFileName, data.pdfFile);

        if (pdfUploadError) throw pdfUploadError;

        const { data: pdfUrlData } = supabase.storage
          .from("pdfs")
          .getPublicUrl(pdfFileName);
        fileUrl = pdfUrlData.publicUrl;
        fileSize = data.pdfFile.size;
      }

      // Upload new thumbnail if provided
      if (data.thumbnailFile) {
        const thumbFileName = `${Date.now()}-${data.thumbnailFile.name}`;
        const { error: thumbUploadError } = await supabase.storage
          .from("thumbnails")
          .upload(thumbFileName, data.thumbnailFile);

        if (thumbUploadError) throw thumbUploadError;

        const { data: thumbUrlData } = supabase.storage
          .from("thumbnails")
          .getPublicUrl(thumbFileName);
        thumbnailUrl = thumbUrlData.publicUrl;
      }

      // Update PDF record
      const updateData: Record<string, unknown> = {
        title: data.title,
        description: data.description || null,
        category_id: data.category_id || null,
        author: data.author || null,
        page_count: data.page_count,
        file_url: fileUrl,
        thumbnail_url: thumbnailUrl,
      };

      if (fileSize !== undefined) {
        updateData.file_size = fileSize;
      }

      const { error: updateError } = await supabase
        .from("pdfs")
        .update(updateData)
        .eq("id", data.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success("PDF updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["pdfs"] });
    },
    onError: (error) => {
      toast.error(`Failed to update PDF: ${error.message}`);
    },
  });
}

export function useDeletePDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pdfs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("PDF deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["pdfs"] });
    },
    onError: (error) => {
      toast.error(`Failed to delete PDF: ${error.message}`);
    },
  });
}
