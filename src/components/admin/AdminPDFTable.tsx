import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PDFForm } from "./PDFForm";
import { usePDFs } from "@/hooks/usePDFs";
import { useUpdatePDF, useDeletePDF } from "@/hooks/useAdminPDFs";
import { Edit, Trash2, FileText, Download, ExternalLink } from "lucide-react";
import { format } from "date-fns";

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
  categories?: { name: string; slug: string } | null;
}

export function AdminPDFTable() {
  const { data: pdfs, isLoading } = usePDFs({ limit: 100 });
  const updatePDF = useUpdatePDF();
  const deletePDF = useDeletePDF();
  
  const [editingPDF, setEditingPDF] = useState<PDF | null>(null);
  const [deletingPDF, setDeletingPDF] = useState<PDF | null>(null);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleUpdate = (data: {
    title: string;
    description: string;
    category_id: string;
    author: string;
    page_count: number | null;
    pdfFile: File | null;
    thumbnailFile: File | null;
  }) => {
    if (!editingPDF) return;
    
    updatePDF.mutate(
      {
        ...data,
        id: editingPDF.id,
        existingFileUrl: editingPDF.file_url,
        existingThumbnailUrl: editingPDF.thumbnail_url,
      },
      {
        onSuccess: () => setEditingPDF(null),
      }
    );
  };

  const handleDelete = () => {
    if (!deletingPDF) return;
    deletePDF.mutate(deletingPDF.id, {
      onSuccess: () => setDeletingPDF(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="text-right">Downloads</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pdfs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No PDFs uploaded yet. Click "Add New PDF" to get started.
                </TableCell>
              </TableRow>
            ) : (
              pdfs?.map((pdf) => (
                <TableRow key={pdf.id}>
                  <TableCell>
                    {pdf.thumbnail_url ? (
                      <img
                        src={pdf.thumbnail_url}
                        alt={pdf.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {pdf.title}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      {pdf.categories?.name || "Uncategorized"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {pdf.author || "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatFileSize(pdf.file_size)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {pdf.download_count}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(pdf.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <a href={pdf.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingPDF(pdf)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingPDF(pdf)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPDF} onOpenChange={(open) => !open && setEditingPDF(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit PDF</DialogTitle>
          </DialogHeader>
          {editingPDF && (
            <PDFForm
              initialData={editingPDF}
              onSubmit={handleUpdate}
              onCancel={() => setEditingPDF(null)}
              isLoading={updatePDF.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingPDF} onOpenChange={(open) => !open && setDeletingPDF(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete PDF</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPDF?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
