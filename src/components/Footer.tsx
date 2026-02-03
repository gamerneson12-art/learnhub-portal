import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6 text-primary" />
            LearningHub
          </Link>

          <p className="text-sm text-muted-foreground">
            Free coding PDFs and tutorials for developers of all levels.
          </p>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} LearningHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}