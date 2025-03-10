export interface NewsSource {
  id: string;
  name: string;
}

export interface NewsItem {
  source: NewsSource;
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}
