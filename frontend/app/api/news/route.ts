import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { searchTerm, filterTerm } = await request.json();

    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Invalid API KEY" }, { status: 401 });
    }

    if (!searchTerm || !filterTerm) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Fetch news from external API
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

    // Remove duplicates and get up to 6 articles
    const uniqueArticles = Array.from(
      new Map(allArticles.map((article) => [article.title, article])).values()
    ).slice(0, 6);

    return NextResponse.json(uniqueArticles);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Failed to load news" }, { status: 500 });
  }
}
