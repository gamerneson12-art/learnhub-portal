import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { CategoryCard } from "@/components/CategoryCard";
import { useCategories } from "@/hooks/useCategories";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategories();

  const handleSearch = (query: string) => {
    navigate(`/browse?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection onSearch={handleSearch} />

        {/* Categories Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Browse by Language
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose from 18+ programming languages and technologies
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories?.slice(0, 12).map((category) => (
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
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why LearningHub?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Curated Content</h3>
                <p className="text-muted-foreground">
                  Hand-picked PDFs covering beginner to advanced topics in every language.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔓</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">100% Free</h3>
                <p className="text-muted-foreground">
                  All resources are completely free. No hidden fees or subscriptions.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Downloads</h3>
                <p className="text-muted-foreground">
                  Instant access to all PDFs. Download and start learning immediately.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
