import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Article } from "@/lib/types";

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (!error) setArticles(data || []);
      setLoading(false);
    };

    fetchArticles();
  }, []);

  return (
    <Layout>
      <>
        <Helmet>
          <title>Journal | AIJIM</title>
          <meta
            name="description"
            content="Stories, insights, and perspectives on minimal streetwear, fashion culture, and lifestyle."
          />
        </Helmet>

        <div className="min-h-screen bg-black pt-28 pb-16">

          {/* Header */}
       

          {/* Article List */}
          <section className="container mx-auto px-4">
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : articles.length === 0 ? (
              <p className="text-center text-gray-500">No articles yet.</p>
            ) : (
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="group border border-gray-700 hover:border-yellow-400 transition-all rounded-lg p-2 overflow-hidden"
                  >
                    {/* Clickable Image */}
                    <Link to={`/articles/${article.slug}`} onClick={() => window.scrollTo(0, 0)}>
                      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md bg-gray-900">
                        {article.image ? (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                            No Image
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="mt-4">
                      <Link to={`/articles/${article.slug}`}>
                        <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">
                          {article.title}
                        </h3>
                      </Link>

                      {article.excerpt && (
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}

                      <p className="mt-4 text-[11px] tracking-widest uppercase text-yellow-400">
                        category - {article.category || "Streetwear"}
                      </p>

                      {/* Read More - separate link */}
                      <Link 
                        to={`/articles/${article.slug}`}
                        onClick={() => window.scrollTo(0, 0)}
                      >
                        <p className="mt-3 text-xs text-yellow-400 underline  transition-colors uppercase tracking-wider">
                          Read More →
                        </p>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </>
    </Layout>
  );
};

export default Articles;
