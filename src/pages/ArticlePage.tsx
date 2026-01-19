import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/lib/types";
import { format } from "date-fns";
import { ArrowLeft, Loader2, Calendar, User } from "lucide-react";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data as Article | null;
    },
    enabled: !!slug,
  });

  if (isLoading)
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
        </div>
      </Layout>
    );

  if (error || !article)
    return (
      <Layout>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-yellow-400">Article Not Found</h1>
          <Link to="/articles">
            <Button variant="outline" className="border-yellow-500 text-white hover:bg-yellow-500 hover:text-black">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </Layout>
    );

  const formattedDate = format(
    new Date(article.published_at ?? article.created_at),
    "MMMM dd, yyyy"
  );

  return (
    <Layout>
      <Helmet>
        <title>{article.title} | AIJIM Journal</title>
        <meta name="description" content={article.excerpt || article.title} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || article.title} />
        {article.image && <meta property="og:image" content={article.image} />}
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-10 mt-10 py-10">
   {/* Header */}
   <div className="container-custom  pb-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3">
              <Link
                to="/"
                className="hover:text-yellow-400 transition-colors"
              >
                Home
              </Link>
          
              <span>/</span>
              <Link
                to="/articles"
                className="hover:text-yellow-400 transition-colors"
              >
                Articles
              </Link>
          
              <span>/</span>
          
              <span className="text-white font-semibold line-clamp-1">
              {article.title} 
              </span>
              
            </nav>
          
          
          </div>

        {/* Hero Image */}
        {article.image && (
          <div className="relative w-full h-[40vh] ">
            <motion.img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-contain opacity-100"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
            />
            <div className="absolute inset-0 " />
          </div>
        )}

        {/* Main Body */}
        <motion.div
          className="container mx-auto px-4 md:px-6 max-w-3xl mt-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
         

          {article.category && (
            <p className="uppercase tracking-widest text-xs text-white mb-2 font-medium">
              {article.category}
            </p>
          )}

          <h1 className="text-xl md:text-2xl font-bold text-yellow-500 leading-tight mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap gap-4 items-center text-sm text-gray-400 mb-8">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-400" />
              {article.author || "AIJIM Studio"}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-400" />
              {formattedDate}
            </span>
          </div>

          {/* Content */}
          <article
            className="
              leading-relaxed bg-black px-3 md:px-7 py-3 rounded-none border border-neutral-700 shadow-lg

              [&>h1]:text-yellow-500 [&>h1]:font-semibold [&>h1]:text-xl
              [&>h2]:text-red-500 [&>h2]:font-medium [&>h2]:text-lg
              [&>h3]:text-white [&>h3]:font-medium [&>h3]:text-md

              [&>p]:text-sm  [&>p]:font-medium [&>p]:leading-relaxed [&>p]:text-neutral-200 [&>p]:my-4

              [&>ul]:list-disc [&>ul]:pl-6 [&>li]:text-neutral-400 [&>li]:marker:text-yellow-400 [&>li]:my-2

              [&>a]:text-blue-400 hover:[&>a]:text-yellow-400 transition
              [&>strong]:text-white [&>strong]:font-semibold
              [&>img]:rounded-xl [&>img]:my-6 border border-neutral-700"
          >
            <ReactMarkdown
              components={{
                blockquote: ({ children }) => (
                  <motion.blockquote
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="
                      border-l-4 border-yellow-400 bg-neutral-800 px-5 py-4 italic text-neutral-200 rounded-md my-6"
                  >
                    {children}
                  </motion.blockquote>
                )
              }}
            >
              {article.content}
            </ReactMarkdown>
          </article>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="mt-8 pt-6 border-t border-neutral-700 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs rounded-full bg-yellow-400 text-black font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        <div className="h-20" />
      </div>
    </Layout>
  );
};

export default ArticlePage;
