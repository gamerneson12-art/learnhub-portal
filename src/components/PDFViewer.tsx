import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

export function PDFViewer({ isOpen, onClose, pdfUrl, title }: PDFViewerProps) {
  // Add Google Docs viewer as fallback for browsers that don't support PDF embedding
  const viewerUrl = `${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <DialogTitle className="line-clamp-1 pr-8">{title}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="flex-1 w-full h-full min-h-0 px-4 pb-4">
          <iframe
            src={viewerUrl}
            className="w-full h-full rounded-md border"
            title={title}
            style={{ minHeight: "calc(90vh - 80px)" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
