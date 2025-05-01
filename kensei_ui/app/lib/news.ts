export async function fetchNewsItems() {
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

  if (!apiKey) {
    throw { error: "Invalid API KEY", status: 401 };
  }

  try {
    const searchTerm = "meme+coin";
    const filterTerm = "meme coin";
    const [everythingResponse, headlinesResponse] = await Promise.all([
      fetch(
        `https://newsapi.org/v2/everything?q=${searchTerm}&sortBy=relevancy&language=en&pageSize=50&apiKey=${apiKey}`
      ),
      fetch(
        `https://newsapi.org/v2/top-headlines?q=${searchTerm}}&country=es&language=en&pageSize=50&apiKey=${apiKey}`
      ),
    ]);

    const [everythingData, headlinesData] = await Promise.all([
      everythingResponse.json(),
      headlinesResponse.json(),
    ]);

    // Combine and filter articles
    const allArticles = [
      ...(headlinesData.articles || []),
      ...(everythingData.articles || []),
    ].filter(
      (article) =>
        article.title &&
        article.description &&
        (article.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
          article.description.toLowerCase().includes(filterTerm.toLowerCase()))
    );

    // Remove duplicates and get up to 15 articles
    const uniqueArticles = Array.from(
      new Map(allArticles.map((article) => [article.title, article])).values()
    ).slice(0, 6);

    // console.log("response", uniqueArticles);

    return uniqueArticles;
  } catch (error) {
    return { error: "Failed to load news", status: 500 };
  }
}
