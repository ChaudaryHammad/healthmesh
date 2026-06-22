export const LINK_RESOURCE_OPTIONS = [
  { id: "pages", label: "Page links", hint: "Navigation <a> links between pages" },
  { id: "images", label: "Images", hint: "<img> tags and image files" },
  { id: "stylesheets", label: "CSS", hint: "Stylesheets and .css files" },
  { id: "scripts", label: "JavaScript", hint: "<script> tags and .js files" },
  { id: "documents", label: "Documents", hint: "PDF, Word, Excel, ZIP, etc." },
  { id: "media", label: "Media", hint: "Video and audio files" },
] as const;

export type LinkResourceType = (typeof LINK_RESOURCE_OPTIONS)[number]["id"];

export const ALL_LINK_RESOURCE_TYPES: LinkResourceType[] = LINK_RESOURCE_OPTIONS.map(
  (option) => option.id
);

export function classifyLinkResource(
  tag: string,
  attribute: string,
  href: string,
  rel?: string
): LinkResourceType {
  let path = "";
  try {
    path = new URL(href).pathname.toLowerCase();
  } catch {
    path = href.toLowerCase();
  }

  if (tag === "a" && attribute === "href") return "pages";
  if (tag === "img" || /\.(png|jpe?g|gif|webp|svg|ico|avif|bmp)(\?|$)/i.test(path)) {
    return "images";
  }
  if (
    tag === "script" ||
    (tag === "link" && rel?.toLowerCase().includes("modulepreload")) ||
    /\.(m?js|cjs)(\?|$)/i.test(path)
  ) {
    return "scripts";
  }
  if (
    tag === "link" ||
    rel?.toLowerCase() === "stylesheet" ||
    /\.css(\?|$)/i.test(path)
  ) {
    return "stylesheets";
  }
  if (tag === "video" || tag === "audio" || tag === "source" || /\.(mp4|webm|ogg|mp3|wav)(\?|$)/i.test(path)) {
    return "media";
  }
  if (/\.(pdf|docx?|xlsx?|pptx?|zip|rar|txt|csv)(\?|$)/i.test(path)) {
    return "documents";
  }

  return "pages";
}

export function parseResourceTypes(value: unknown): LinkResourceType[] {
  if (!Array.isArray(value)) return [...ALL_LINK_RESOURCE_TYPES];
  const valid = new Set(ALL_LINK_RESOURCE_TYPES);
  const parsed = value.filter((item): item is LinkResourceType => typeof item === "string" && valid.has(item as LinkResourceType));
  return parsed.length > 0 ? parsed : [...ALL_LINK_RESOURCE_TYPES];
}

export function formatResourceTypes(types: LinkResourceType[]): string {
  const labels = new Map(LINK_RESOURCE_OPTIONS.map((o) => [o.id, o.label]));
  return types.map((t) => labels.get(t) ?? t).join(", ");
}
