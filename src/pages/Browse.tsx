import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { PDFCard } from "@/components/PDFCard";
import { PDFViewer } from "@/components/PDFViewer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories } from "@/hooks/useCategories";
import { usePDFs, useTrackDownload } from "@/hooks/usePDFs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [viewerPdf, setViewerPdf] = useState<{ url: string; title: string } | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: pdfs, isLoading: pdfsLoading } = usePDFs({ searchQuery: activeSearch });
  const trackDownload = useTrackDownload();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveSearch(query);
  };

  const handleFormSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    // If search is cleared, reset active search immediately
    if (!value.trim()) {
      setActiveSearch("");
    }
  };

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
      setViewerPdf({ url: pdf.file_url, title: pdf.title });
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
        
        // Create download link
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
        // Still allow download even if tracking fails
        window.open(pdf.file_url, "_blank");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Library</h1>
            <p className="text-muted-foreground">
              Explore our collection of free programming PDFs
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleFormSearch} className="mb-8">
            <div className="flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search PDFs by title or description..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>

          {/* Tabs */}
          <Tabs defaultValue={activeSearch ? "all" : "categories"} value={activeSearch ? "all" : undefined} className="space-y-6">
            <TabsList>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="all">{activeSearch ? `Results for "${activeSearch}"` : "All PDFs"}</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="space-y-6">
              {categoriesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {categories?.map((category) => (
                    <CategoryCard
                      key={category.id}
                      name={category.name}
                      slug={category.slug}
                      description={category.description}
                      icon={category.icon}
                      color={category.color}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-6">
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
                      categoryName={pdf.categories?.name}
                      onView={handleViewPDF}
                      onDownload={handleDownloadPDF}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {activeSearch
                      ? `No PDFs found for "${activeSearch}"`
                      : "No PDFs available yet. Check back later!"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* PDF Viewer Modal */}
      {viewerPdf && (
        <PDFViewer
          isOpen={!!viewerPdf}
          onClose={() => setViewerPdf(null)}
          pdfUrl={viewerPdf.url}
          title={viewerPdf.title}
        />
      )}
    </div>
  );
}
