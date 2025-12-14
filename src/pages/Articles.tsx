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
          <h2 className="text-2xl font-bold  text-center mb-6 text-white  ">From The Journal</h2>
          

       

          {/* Article List */}
          <section className="container mx-auto px-4">
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : articles.length === 0 ? (
              <p className="text-center text-gray-500">No articles yet.</p>
            ) : (
   <div className="space-y-6">
  <div className="grid gap-6 grid-cols-1  ">
    {articles.map((article) => (
      <Link
        key={article.id}
        to={`/articles/${article.slug}`}
        onClick={() => window.scrollTo(0, 0)}
        className="group flex gap-5 border border-gray-700 hover:border-yellow-400 rounded-none p-4 transition-all cursor-pointer hover:bg-[#0f0f0f]"
      >
        {/* Thumbnail */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-none overflow-hidden bg-gray-900 flex-shrink-0">
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

            <p className="text-xs md:text-sm text-right  mt-2 text-yellow-400 underline uppercase tracking-wider font-medium">
              Read More →
            </p>
          </div>
        </div>
      </Link>
    ))}
  </div>
</div>


            )}
          </section>
        </div>
      </>
    </Layout>
  );
};

export default Articles;
