import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { Upload, FileText, Image } from "lucide-react";

interface PDFFormData {
  title: string;
  description: string;
  category_id: string;
  author: string;
  page_count: number | null;
  pdfFile: File | null;
  thumbnailFile: File | null;
}

interface PDFFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    category_id: string | null;
    author: string | null;
    page_count: number | null;
    file_url: string;
    thumbnail_url: string | null;
  };
  onSubmit: (data: PDFFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function PDFForm({ initialData, onSubmit, onCancel, isLoading }: PDFFormProps) {
  const { data: categories } = useCategories();
  const [formData, setFormData] = useState<PDFFormData>({
    title: "",
    description: "",
    category_id: "",
    author: "",
    page_count: null,
    pdfFile: null,
    thumbnailFile: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        category_id: initialData.category_id || "",
        author: initialData.author || "",
        page_count: initialData.page_count,
        pdfFile: null,
        thumbnailFile: null,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="Enter PDF title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter PDF description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            placeholder="Author name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="page_count">Page Count</Label>
        <Input
          id="page_count"
          type="number"
          value={formData.page_count || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              page_count: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          placeholder="Number of pages"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pdf">PDF File {!initialData && "*"}</Label>
        <div className="flex items-center gap-2">
          <Input
            id="pdf"
            type="file"
            accept=".pdf"
            onChange={(e) =>
              setFormData({ ...formData, pdfFile: e.target.files?.[0] || null })
            }
            required={!initialData}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("pdf")?.click()}
            className="w-full"
          >
            <FileText className="mr-2 h-4 w-4" />
            {formData.pdfFile ? formData.pdfFile.name : "Choose PDF file"}
          </Button>
        </div>
        {initialData && !formData.pdfFile && (
          <p className="text-sm text-muted-foreground">
            Current file will be kept if no new file is selected
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail">Thumbnail Image</Label>
        <div className="flex items-center gap-2">
          <Input
            id="thumbnail"
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData({ ...formData, thumbnailFile: e.target.files?.[0] || null })
            }
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("thumbnail")?.click()}
            className="w-full"
          >
            <Image className="mr-2 h-4 w-4" />
            {formData.thumbnailFile ? formData.thumbnailFile.name : "Choose thumbnail"}
          </Button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : initialData ? "Update PDF" : "Upload PDF"}
        </Button>
      </div>
    </form>
  );
}
