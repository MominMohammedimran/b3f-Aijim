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
        
          <h2 className="text-2xl font-bold  text-center mb-6 text-white underline ">From The Journal</h2>
          

    

        {/* Articles Grid */}
     <div className="space-y-6">
  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
    {articles.slice(0, 3).map((article) => (
      <Link
        key={article.id}
        to={`/articles/${article.slug}`}
        onClick={() => window.scrollTo(0, 0)}
        className="group flex gap-5 border border-gray-700 hover:border-yellow-400 rounded-lg p-4 transition-all cursor-pointer hover:bg-[#0f0f0f]"
      >
        {/* Thumbnail */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-md overflow-hidden bg-gray-900 flex-shrink-0">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-contain transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 opacity-90"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* Right Side Content */}
        <div className="flex flex-col justify-between flex-1">
          <div>
            <h3 className="text-white text-sm md:text-lg font-semibold group-hover:text-yellow-400 transition">
              {article.title}
            </h3>

            {article.excerpt && (
              <p className="text-gray-400 mt-1 text-xs md:text-sm line-clamp-2">
                {article.excerpt}
              </p>
            )}
          </div>

          <div className="mt-3">
            <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-blue-400">
              {article.category || "Streetwear"}
            </p>

            <p className="text-xs md:text-sm mt-2 text-yellow-400 underline uppercase tracking-wider font-medium">
              Read More →
            </p>
          </div>
        </div>
      </Link>
    ))}
  </div>
</div>
{articles.length > 1 && (
  <Link 
    to="/articles"
    className="text-center block mt-6 text-yellow-400 underline text-lg"
  >
    View All Articles →
  </Link>
)}

      </div>
    </section>
  );
};
