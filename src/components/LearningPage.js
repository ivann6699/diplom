import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../supabase";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TestModal from "./TestModal";
import ArticleCard from "./ArticleCard";

const ARTICLES_PER_PAGE = 5;

const LearningPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [currentTest, setCurrentTest] = useState(null);
  const [passedTests, setPassedTests] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return false;
    }
    return true;
  }, [navigate]);

  const fetchArticles = useCallback(async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;

    const { data, error } = await supabase.from("learning_articles").select("*");
    if (error) console.error("Error fetching articles:", error);
    else setArticles(data);
    setLoading(false);
  }, [checkAuth]);

  const fetchTestProgress = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("user_article_progress")
      .select("article_id, test_passed")
      .eq("user_id", user.id);

    if (!error) {
      const passed = {};
      data.forEach(item => {
        passed[item.article_id] = item.test_passed;
      });
      setPassedTests(passed);
    }
  }, []);

  const fetchTest = useCallback(async (articleId) => {
    const { data, error } = await supabase
      .from("article_tests")
      .select("*")
      .eq("article_id", articleId);

    if (error) console.error("Error fetching test:", error);
    else if (data.length > 0) setCurrentTest(data);
  }, []);

  const filteredArticles = useMemo(() => {
    if (difficultyFilter === "all") return articles;
    return articles.filter(a => a.difficulty_level === difficultyFilter);
  }, [articles, difficultyFilter]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  }, [filteredArticles]);

  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    return filteredArticles.slice(startIndex, endIndex);
  }, [filteredArticles, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchArticles();
    fetchTestProgress();
  }, [fetchArticles, fetchTestProgress]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filter changes
  }, [difficultyFilter]);

  if (loading) return <div className="flex justify-center items-center h-screen">Загрузка...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold text-center mb-8 text-gradient">Обучение ИИ</h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-input text-foreground border border-border focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-200"
        >
          <option value="all">Все уровни</option>
          <option value="Начинающий">Начинающий</option>
          <option value="Средний">Средний</option>
          <option value="Продвинутый">Продвинутый</option>
        </select>
      </div>
      
      <div className="space-y-6">
        {paginatedArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            passedTests={passedTests}
            onTestClick={fetchTest}
          />
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/80'
            } transition-colors`}
          >
            Назад
          </button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-md ${
                    currentPage === pageNum
                      ? 'bg-primary text-white'
                      : 'bg-input hover:bg-input/80'
                  } transition-colors`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/80'
            } transition-colors`}
          >
            Вперед
          </button>
        </div>
      )}

      {currentTest && (
        <TestModal
          currentTest={currentTest}
          onClose={() => {
            setCurrentTest(null);
            fetchTestProgress();
          }}
          onTestComplete={fetchTestProgress}
        />
      )}
    </motion.div>
  );
};

export default LearningPage;