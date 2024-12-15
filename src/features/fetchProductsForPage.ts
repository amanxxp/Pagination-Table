const truncateText = (text: string, wordLimit: number = 8): string => {
  const words = text.split(" ");
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(" ") + "...";
  }
  return text;
};

export default async function fetchProductsForPage(
  pageNum: number,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  setLoading(true);
  try {
    const response = await fetch(
      `https://api.artic.edu/api/v1/artworks?page=${pageNum}`
    );
    const data = await response.json();
    const transformedProducts = data.data
      .slice(0, 5) // Limit to the first 5 items
      .map((item: any) => ({
        id: item.id,
        title: item.title || "N/A",
        place_of_origin: truncateText(item.place_of_origin || "N/A"),
        artist_display: truncateText(item.artist_display || "N/A"),
        inscriptions: truncateText(item.inscriptions || "N/A"),
        date_start: item.date_start || 0,
        date_end: item.date_end || 0,
      }));

    return {
      products: transformedProducts,
      total: data.pagination.total,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], total: 0 };
  } finally {
    setLoading(false);
  }
}
