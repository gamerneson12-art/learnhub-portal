import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useCreatePDF } from "@/hooks/useAdminPDFs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminPDFTable } from "@/components/admin/AdminPDFTable";
import { PDFForm } from "@/components/admin/PDFForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Users, Download, Shield } from "lucide-react";
import { usePDFs } from "@/hooks/usePDFs";
import { useCategories } from "@/hooks/useCategories";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: pdfs } = usePDFs({ limit: 1000 });
  const { data: categories } = useCategories();
  const createPDF = useCreatePDF();
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Loading state
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Not an admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">
                You don't have permission to access the admin portal. Please contact an administrator if you believe this is an error.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const totalDownloads = pdfs?.reduce((sum, pdf) => sum + (pdf.download_count || 0), 0) || 0;

  const handleCreate = (data: {
    title: string;
    description: string;
    category_id: string;
    author: string;
    page_count: number | null;
    pdfFile: File | null;
    thumbnailFile: File | null;
  }) => {
    createPDF.mutate(data, {
      onSuccess: () => setShowAddDialog(false),
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage PDFs, categories, and monitor usage
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New PDF
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total PDFs
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pdfs?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Downloads
              </CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDownloads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Admin Status
              </CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Active</div>
            </CardContent>
          </Card>
        </div>

        {/* PDF Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">PDF Library</h2>
          <AdminPDFTable />
        </div>
      </main>
      <Footer />

      {/* Add PDF Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New PDF</DialogTitle>
          </DialogHeader>
          <PDFForm
            onSubmit={handleCreate}
            onCancel={() => setShowAddDialog(false)}
            isLoading={createPDF.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
