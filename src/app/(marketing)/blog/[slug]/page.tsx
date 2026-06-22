import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { blogPosts, getBlogPost } from "@/lib/marketing/blog-posts";
import { BlogArticle } from "@/components/marketing/blog-article";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex-1 max-w-3xl mx-auto px-6 py-12 md:py-20">
      <Button
        variant="ghost"
        size="sm"
        className="mb-8 -ml-2 text-muted-foreground"
        render={<Link href="/blog" />}
        nativeButton={false}
      >
        <ArrowLeft />
        Back to Blog
      </Button>

      <article className="space-y-8">
        <div className="space-y-4">
          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary uppercase tracking-wider text-[10px]">
            {post.category}
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">By {post.author}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>

          <Separator />
        </div>

        <BlogArticle content={post.content} />
      </article>
    </div>
  );
}
