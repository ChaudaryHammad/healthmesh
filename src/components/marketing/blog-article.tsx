import React from "react";
import type { BlogPost } from "@/lib/marketing/blog-posts";

export function BlogArticle({ content }: { content: BlogPost["content"] }) {
  return (
    <div className="prose prose-invert max-w-none text-muted-foreground text-sm sm:text-base leading-relaxed space-y-6 select-text">
      {content.map((block, i) => {
        if (block.type === "h2") {
          return (
            <h2 key={i} className="text-xl font-bold text-foreground pt-4">
              {block.text}
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3 key={i} className="text-lg font-semibold text-foreground pt-2">
              {block.text}
            </h3>
          );
        }
        if (block.type === "ul" && block.items) {
          return (
            <ul key={i} className="list-disc pl-5 space-y-2">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="leading-relaxed">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
