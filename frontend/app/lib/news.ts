export async function fetchNewsItems({
  searchTerm,
  filterTerm,
}: {
  searchTerm: string;
  filterTerm: string;
}) {
  try {
    const response = await fetch("/api/news", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ searchTerm, filterTerm }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw {
        error: errorData.error || "Failed to fetch news",
        status: response.status,
      };
    }

    const articles = await response.json();
    return articles;
  } catch (error) {
    console.error("Error fetching news:", error);
    return { error: "Failed to load news", status: 500 };
  }
}
