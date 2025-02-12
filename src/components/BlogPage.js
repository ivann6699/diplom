import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const API_KEY = process.env.REACT_APP_NEWS_API_KEY

const BlogPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("publishedAt"); 

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const url = `https://newsapi.org/v2/everything?q=AI&sortBy=${sortBy}&apiKey=${API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "ok" && Array.isArray(data.articles)) {
        setArticles(data.articles);
      } else {
        throw new Error("Unexpected API response structure");
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setError(`Failed to fetch articles: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    fetchArticles(); // Перезагружаем статьи с новым параметром сортировки
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">Error: {error}</div>;
  }

  if (!articles || articles.length === 0) {
    return <div className="flex justify-center items-center h-screen">No articles found.</div>;
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

      {/* Выпадающий список для сортировки */}
      <div className="mb-8">
        <label htmlFor="sortBy" className="mr-2">Сортировать по:</label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={handleSortChange}
          className="p-2 border rounded bg-dark-gray text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="publishedAt">Дате публикации</option>
          <option value="relevancy">Релевантности</option>
          <option value="popularity">Популярности</option>
        </select>
      </div>

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
            <p className="text-sm text-muted-foreground">
              <strong>Источник:</strong> {article.source.name}
            </p>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
};

export default BlogPage;
