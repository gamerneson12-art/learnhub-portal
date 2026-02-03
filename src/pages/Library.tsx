import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { ChevronLeft, Loader2, Download, Clock, FileText } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useDownloadHistory } from "@/hooks/usePDFs";
import { formatDistanceToNow } from "date-fns";

export default function Library() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const { data: downloads, isLoading } = useDownloadHistory(user?.id || "");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Library</h1>
            <p className="text-muted-foreground">
              Your download history and saved PDFs
            </p>
          </div>

          {/* Download History */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : downloads && downloads.length > 0 ? (
            <div className="space-y-4">
              {downloads.map((download: any) => (
                <Card key={download.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-20 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {download.pdfs?.thumbnail_url ? (
                        <img
                          src={download.pdfs.thumbnail_url}
                          alt={download.pdfs?.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {download.pdfs?.title || "Unknown PDF"}
                      </h3>
                      {download.pdfs?.categories?.name && (
                        <p className="text-sm text-muted-foreground">
                          {download.pdfs.categories.name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Downloaded {formatDistanceToNow(new Date(download.downloaded_at), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Actions */}
                    <Button
                      size="sm"
                      onClick={() => window.open(download.pdfs?.file_url, "_blank")}
                      disabled={!download.pdfs?.file_url}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No downloads yet</h3>
              <p className="text-muted-foreground mb-4">
                Start exploring and download your first PDF!
              </p>
              <Button asChild>
                <Link to="/browse">Browse PDFs</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
