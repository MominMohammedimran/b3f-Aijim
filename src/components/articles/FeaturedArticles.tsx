import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/lib/types";

export const FeaturedArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);

      setArticles(data || []);
      setLoading(false);
    };

    fetchArticles();
  }, []);

  if (loading) return null;
  if (articles.length === 0) return null;

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-white">From The Journal</h2>
          <Link
            to="/articles"
            className="text-yellow-400 hover:text-white text-sm uppercase underline tracking-wider"
          >
            View All →
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link 
              key={article.id}
              to={`/articles/${article.slug}`}
              onClick={() => window.scrollTo(0, 0)}
              className="group border border-gray-700 hover:border-yellow-400 rounded-lg overflow-hidden transition-all"
            >
              <div className="relative w-full aspect-[4/3] bg-gray-900 overflow-hidden">
                {article.image ? (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-fit transition-all duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No Image
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-white text-lg font-semibold group-hover:text-yellow-400 transition">
                  {article.title}
                </h3>

                {article.excerpt && (
                  <p className="text-gray-400 mt-2 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}

                <p className="mt-4 text-[11px] uppercase tracking-wider text-blue-400">
                  {article.category || "Streetwear"}
                </p>
                 <Link 
                        to={`/articles/${article.slug}`}
                        onClick={() => window.scrollTo(0, 0)}
                      >
                        <p className="mt-3 text-xs text-yellow-400 underline transition-colors uppercase tracking-wider">
                          Read More →
                        </p>
                      </Link>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
