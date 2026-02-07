export const extractToc = (content: string) => {
  const headings = content.match(/^(#{2,3})\s+(.*)$/gm);
  if (!headings) return [];

  return headings.map((heading) => {
    const depth = heading.match(/^#+/)?.[0].length || 2;
    const title = heading.replace(/^#+\s+/, "").replace(/<.*?>/g, "");
    const url = `#${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    return { title, url, depth };
  });
};
