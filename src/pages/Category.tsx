import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PDFCard } from "@/components/PDFCard";
import { Button } from "@/components/ui/button";
import { useCategoryBySlug } from "@/hooks/useCategories";
import { usePDFs, useTrackDownload } from "@/hooks/usePDFs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(slug || "");
  const { data: pdfs, isLoading: pdfsLoading } = usePDFs({ categorySlug: slug });
  const trackDownload = useTrackDownload();

  const handleViewPDF = (id: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to view PDFs",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const pdf = pdfs?.find((p) => p.id === id);
    if (pdf) {
      window.open(pdf.file_url, "_blank");
    }
  };

  const handleDownloadPDF = async (id: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to download PDFs",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const pdf = pdfs?.find((p) => p.id === id);
    if (pdf) {
      try {
        await trackDownload.mutateAsync({ pdfId: id, userId: user.id });
        
        const link = document.createElement("a");
        link.href = pdf.file_url;
        link.download = pdf.title;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Download started",
          description: `Downloading ${pdf.title}`,
        });
      } catch (error) {
        console.error("Download tracking failed:", error);
        window.open(pdf.file_url, "_blank");
      }
    }
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Category not found</h1>
          <Button asChild>
            <Link to="/browse">Back to Browse</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/browse">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Browse
            </Link>
          </Button>

          {/* Category Header */}
          <div className="mb-8 flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${category.color}20` }}
            >
              {category.icon}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="text-muted-foreground mt-1">{category.description}</p>
              )}
            </div>
          </div>

          {/* PDFs Grid */}
          {pdfsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pdfs && pdfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {pdfs.map((pdf) => (
                <PDFCard
                  key={pdf.id}
                  id={pdf.id}
                  title={pdf.title}
                  description={pdf.description}
                  thumbnailUrl={pdf.thumbnail_url}
                  fileSize={pdf.file_size}
                  pageCount={pdf.page_count}
                  author={pdf.author}
                  downloadCount={pdf.download_count}
                  createdAt={pdf.created_at}
                  onView={handleViewPDF}
                  onDownload={handleDownloadPDF}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-4">
                No PDFs available in this category yet.
              </p>
              <Button asChild variant="outline">
                <Link to="/browse">Browse Other Categories</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
