import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ThumbsUp, ThumbsDown, Copy, FileText, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SupportArticleProps {
  title: string;
  category: string;
  tags?: string[];
  lastUpdated?: string;
  content: ReactNode;
  relatedArticles?: {
    id: string;
    title: string;
    path: string;
  }[];
  breadcrumbs?: {
    title: string;
    path: string;
  }[];
  nextArticle?: {
    title: string;
    path: string;
  };
  prevArticle?: {
    title: string;
    path: string;
  };
}

export function SupportArticle({
  title,
  category,
  tags = [],
  lastUpdated,
  content,
  relatedArticles = [],
  breadcrumbs = [],
  nextArticle,
  prevArticle
}: SupportArticleProps) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/support">Support</BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((crumb, index) => (
            <BreadcrumbItem key={index}>
              {index === breadcrumbs.length - 1 ? (
                <span>{crumb.title}</span>
              ) : (
                <BreadcrumbLink href={crumb.path}>{crumb.title}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      )}

      {/* Article Card */}
      <Card className="border rounded-lg overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex justify-between items-start gap-2">
            <div>
              <Badge variant="secondary" className="mb-2">{category}</Badge>
              <CardTitle className="text-2xl">{title}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" title="Copy link">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-6 prose prose-sm max-w-none">
          {content}
        </CardContent>
        <CardFooter className="flex flex-col border-t pt-4 pb-6 space-y-4">
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {lastUpdated && (
                <span>Last updated: {lastUpdated}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-1">Was this helpful?</span>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Yes</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ThumbsDown className="h-3.5 w-3.5" />
                <span>No</span>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Navigation between articles */}
      <div className="flex justify-between items-center pt-2">
        {prevArticle ? (
          <Button variant="ghost" asChild className="gap-2">
            <Link href={prevArticle.path}>
              <ArrowLeft className="h-4 w-4" />
              <span className="max-w-[200px] truncate">{prevArticle.title}</span>
            </Link>
          </Button>
        ) : (
          <div />
        )}
        {nextArticle && (
          <Button variant="ghost" asChild className="gap-2 ml-auto">
            <Link href={nextArticle.path}>
              <span className="max-w-[200px] truncate">{nextArticle.title}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div className="pt-8 border-t">
          <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedArticles.map((article) => (
              <Link href={article.path} key={article.id} className="block group">
                <Card className="h-full hover:border-violet-200 hover:shadow-sm transition-all">
                  <CardHeader className="p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-violet-500 mt-0.5" />
                      <CardTitle className="text-base group-hover:text-violet-600 transition-colors">
                        {article.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
