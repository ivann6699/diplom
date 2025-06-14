import { motion } from "framer-motion";

const ArticleCard = ({ article, passedTests, onTestClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glow rounded-xl p-6"
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold mb-2">{article.title}</h2>
          <span className={`px-2 py-1 rounded-full text-xs ${
            article.difficulty_level === "Начинающий" 
              ? "bg-green-500" 
              : article.difficulty_level === "Средний" 
                ? "bg-yellow-500" 
                : "bg-red-500"
          }`}>
            {article.difficulty_level}
          </span>
        </div>
        <button
          onClick={() => onTestClick(article.id)}
          className={`px-4 py-2 rounded-lg ${
            passedTests[article.id] 
              ? "bg-purple-600 hover:bg-purple-700 text-white" 
              : "bg-gradient text-primary hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700"
          }`}
        >
          {passedTests[article.id] ? "Пройти заново" : "Проверить знания"}
        </button>
      </div>
      <p className="mt-4 mb-4 text-muted-foreground">Автор: {article.author}</p>
      <p className="mb-4">{article.content.substring(0, 200)}...</p>
      <div className="flex justify-between items-center">
        <a 
          href={article.source_url} 
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Читать статью
        </a>
        {passedTests[article.id] && (
          <span className="text-green-500">✓ Тест пройден</span>
        )}
      </div>
    </motion.div>
  );
};

export default ArticleCard; 