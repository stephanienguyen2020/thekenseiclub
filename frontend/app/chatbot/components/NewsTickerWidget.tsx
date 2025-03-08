import { ArrowUpRight, Clock, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type News = {
  author: string;
  content: string;
  description: string;
  publishedAt: string;
  source: { id: null; name: string };
  title: string;
  url: string;
  urlToImage: string;
  category?: string; // Added optional category
  summary?: string; // Added optional summary
};

interface NewsTickerWidgetProps {
  news: News[];
}

export function NewsTickerWidget({ news }: NewsTickerWidgetProps) {
  return (
    <div className="mt-6 space-y-6">
      <h1 className="text-4xl font-bold">
        Latest{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
          {" "}
          Updates
        </span>
      </h1>

      <div className="space-y-4">
        {news.length === 0 ? (
          <div className="py-4 text-center">No news articles available</div>
        ) : (
          news.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="flex gap-3 p-3 transition-colors rounded-lg cursor-pointer hover:bg-white/5">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">
                      {item.source.name}
                    </span>
                    {item.publishedAt && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(item.publishedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                  <h3 className="mb-1 text-sm font-medium">{item.title}</h3>
                  {item.category && (
                    <p className="text-xs text-blue-400">{item.category}</p>
                  )}
                  {item.summary && (
                    <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                </div>
                <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden rounded-md">
                  {item.urlToImage && (
                    <img
                      src={item.urlToImage}
                      alt={item.title}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
