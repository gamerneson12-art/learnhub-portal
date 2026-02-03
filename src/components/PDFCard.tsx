import { FileText, Download, Eye, Clock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface PDFCardProps {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  fileSize: number | null;
  pageCount: number | null;
  author: string | null;
  downloadCount: number;
  createdAt: string;
  categoryName?: string;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${mb.toFixed(1)} MB`;
}

export function PDFCard({
  id,
  title,
  description,
  thumbnailUrl,
  fileSize,
  pageCount,
  author,
  downloadCount,
  createdAt,
  categoryName,
  onView,
  onDownload,
}: PDFCardProps) {
  return (
    <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/50 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <FileText className="h-16 w-16 text-primary/40" />
          </div>
        )}
        {categoryName && (
          <Badge className="absolute top-2 left-2" variant="secondary">
            {categoryName}
          </Badge>
        )}
      </div>

      <CardContent className="flex-1 p-4 space-y-2">
        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {pageCount && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {pageCount} pages
            </span>
          )}
          <span className="flex items-center gap-1">
            {formatFileSize(fileSize)}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {downloadCount}
          </span>
        </div>
        {author && (
          <p className="text-xs text-muted-foreground">By {author}</p>
        )}
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView(id)}
        >
          <Eye className="mr-1 h-4 w-4" />
          View
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onDownload(id)}
        >
          <Download className="mr-1 h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
