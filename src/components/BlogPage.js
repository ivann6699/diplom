import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const API_KEY = process.env.REACT_APP_NEWS_API_KEY;

const BlogPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = useCallback(async () => {
    try {
      // Using the top headlines endpoint instead of everything
      const url = `https://newsapi.org/v2/top-headlines?country=ru&category=technology&apiKey=${API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "ok" && Array.isArray(data.articles)) {
        // Filter articles to only include AI-related content
        const aiArticles = data.articles.filter(article => 
          article.title?.toLowerCase().includes('ai') ||
          article.title?.toLowerCase().includes('искусственный интеллект') ||
          article.description?.toLowerCase().includes('ai') ||
          article.description?.toLowerCase().includes('искусственный интеллект')
        );
        setArticles(aiArticles);
      } else {
        throw new Error("Unexpected API response structure");
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setError(`Failed to fetch articles: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []); // Removed sortBy dependency as we're using top headlines

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center px-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Ошибка загрузки</h2>
        <p className="text-muted-foreground">{error}</p>
        <button 
          onClick={() => fetchArticles()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-center px-4">
        <p className="text-xl text-muted-foreground">Статьи не найдены.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="blog-container max-w-4xl mx-auto px-4 py-8"
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-4xl font-bold text-center mb-8 text-gradient"
      >
        Блог
      </motion.h1>

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-8"
      >
        {articles.map((article, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card-glow rounded-lg p-6 shadow-md transition-all duration-300 hover:shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-2">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors duration-200"
              >
                {article.title}
              </a>
            </h2>
            <p className="text-muted-foreground mb-4">{article.description}</p>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <p><strong>Источник:</strong> {article.source.name}</p>
              <p>{new Date(article.publishedAt).toLocaleDateString('ru-RU')}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
};

export default BlogPage;