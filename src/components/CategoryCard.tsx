import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryCardProps {
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  pdfCount?: number;
}

export function CategoryCard({ name, slug, description, icon, color, pdfCount = 0 }: CategoryCardProps) {
  return (
    <Link to={`/category/${slug}`}>
      <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 cursor-pointer overflow-hidden">
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>
          {pdfCount > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {pdfCount} PDFs
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
