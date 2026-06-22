import React from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { blogPosts } from "@/lib/marketing/blog-posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Blog & Guides",
  description:
    "Practical guides on Core Web Vitals, WCAG accessibility, HTTP security headers, and website health monitoring from the LoopNode team.",
};

export default function BlogPage() {
  return (
    <div className="flex-1 max-w-[88rem] mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          LoopNode Blog
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
          In-depth guides on performance, accessibility, SEO, and security — written for developers who ship and monitor real sites.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <Card
            key={post.slug}
            className="flex flex-col justify-between rounded-3xl border-border/30 hover:border-border/80 hover:shadow-lg transition-all duration-300 group"
          >
            <CardHeader className="space-y-4">
              <Badge variant="outline" className="w-fit bg-primary/10 border-primary/20 text-primary uppercase tracking-wider text-[10px]">
                {post.category}
              </Badge>
              <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm leading-relaxed">
                {post.description}
              </CardDescription>
            </CardHeader>

            <CardFooter className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 mt-auto">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime}
                </span>
              </div>

              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 font-semibold"
                render={<Link href={`/blog/${post.slug}`} />}
                nativeButton={false}
              >
                Read
                <ArrowRight className="group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
