// Presentation-only delivery variants. Catalog records and original URLs stay
// untouched, and full-resolution photographs remain available for inspection.
export function imageDelivery(url, widths = [400, 800, 1200]) {
  if (url?.startsWith("https://cdn.shopify.com/")) {
    const atWidth = (width) => {
      const photo = new URL(url);
      photo.searchParams.set("width", width);
      return photo.href;
    };
    return {
      src: atWidth(widths[Math.min(1, widths.length - 1)]),
      srcSet: widths.map((width) => `${atWidth(width)} ${width}w`).join(", "),
    };
  }
  if (
    !url ||
    !url.startsWith("https://res.cloudinary.com/") ||
    !url.includes("/image/upload/")
  )
    return { src: url };
  const atWidth = (width) =>
    url.replace(
      "/image/upload/",
      `/image/upload/f_auto,q_auto,c_limit,w_${width}/`,
    );
  return {
    src: atWidth(widths[Math.min(1, widths.length - 1)]),
    srcSet: widths.map((width) => `${atWidth(width)} ${width}w`).join(", "),
  };
}
