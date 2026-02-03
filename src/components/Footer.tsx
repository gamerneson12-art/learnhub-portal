import { Link } from "react-router-dom";
import { BookOpen, Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <BookOpen className="h-6 w-6 text-primary" />
              LearningHub
            </Link>
            <p className="text-sm text-muted-foreground">
              Free coding PDFs and tutorials for developers of all levels.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/browse" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse PDFs
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Languages */}
          <div className="space-y-4">
            <h4 className="font-semibold">Popular</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/category/python" className="text-muted-foreground hover:text-foreground transition-colors">
                  Python
                </Link>
              </li>
              <li>
                <Link to="/category/javascript" className="text-muted-foreground hover:text-foreground transition-colors">
                  JavaScript
                </Link>
              </li>
              <li>
                <Link to="/category/react" className="text-muted-foreground hover:text-foreground transition-colors">
                  React
                </Link>
              </li>
              <li>
                <Link to="/category/java" className="text-muted-foreground hover:text-foreground transition-colors">
                  Java
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Connect</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LearningHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
