import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import { motion } from "framer-motion"

const TOOLS_PER_PAGE = 6;

const AiToolCatalog = () => {
  const [tools, setTools] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [categories, setCategories] = useState([])
  const [savedCounts, setSavedCounts] = useState({}) 
  const [sortBy, setSortBy] = useState("") 
  const [userSavedTools, setUserSavedTools] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTools()
    fetchSavedCounts()
    fetchUserSavedTools()
  }, [])

  const fetchTools = async () => {
    const { data, error } = await supabase.from("ai_tools").select("*")
    if (error) {
      console.error("Error fetching tools:", error)
      return
    }
    setTools(data || []) 
    setCategories([...new Set(data.map((tool) => tool.category))])
  }

  const fetchSavedCounts = async () => {
    try {
      const { data, error } = await supabase.from("saved_tools").select("tool_id")
      if (error) throw error

      const counts = data.reduce((acc, { tool_id }) => {
        acc[tool_id] = (acc[tool_id] || 0) + 1
        return acc
      }, {})

      setSavedCounts(counts)
    } catch (error) {
      console.error("Error fetching saved counts:", error)
    }
  }

  const fetchUserSavedTools = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return 

    const { data, error } = await supabase
      .from("saved_tools")
      .select("tool_id")
      .eq("user_id", user.id)

    if (error) {
      console.error("Error fetching user saved tools:", error)
      return
    }

    setUserSavedTools(data.map((item) => item.tool_id))
  }

  const filteredTools = useMemo(() => {
    return tools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategory === "" || tool.category === selectedCategory)
    );
  }, [tools, searchQuery, selectedCategory]);

  const sortedTools = useMemo(() => {
    return [...filteredTools].sort((a, b) => {
      if (sortBy === "popularity") {
        return (savedCounts[b.id] || 0) - (savedCounts[a.id] || 0);
      }
      return 0;
    });
  }, [filteredTools, sortBy, savedCounts]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedTools.length / TOOLS_PER_PAGE);
  }, [sortedTools]);

  const paginatedTools = useMemo(() => {
    const startIndex = (currentPage - 1) * TOOLS_PER_PAGE;
    const endIndex = startIndex + TOOLS_PER_PAGE;
    return sortedTools.slice(startIndex, endIndex);
  }, [sortedTools, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedCategory, sortBy]);

  const saveTool = async (toolId) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) {
      alert("Пожалуйста, войдите или зарегистрируйтесь.")
      navigate("/login")
      return
    }

    const { data: existingData, error: existingError } = await supabase
      .from("saved_tools")
      .select("*")
      .eq("user_id", user.id)
      .eq("tool_id", toolId)

    if (existingError) {
      console.error("Error checking existing saved tool:", existingError)
      return
    }

    if (existingData.length > 0) {
      alert("Этот инструмент уже сохранен.")
      return
    }

    const { error } = await supabase.from("saved_tools").insert([{ user_id: user.id, tool_id: toolId }])

    if (error) console.error(error)
    else {
      alert("Инструмент успешно сохранен!")
      fetchSavedCounts() 
      fetchUserSavedTools() 
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="text-center mb-16">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold mb-6 text-gradient"
        >
          Каталог AI-инструментов
        </motion.h1>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-muted-foreground text-lg max-w-2xl mx-auto"
        >
          Откройте для себя лучшие инструменты искусственного интеллекта
        </motion.p>
      </div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          type="text"
          placeholder="Поиск инструментов..."
          className="flex-1 px-4 py-2 rounded-lg bg-input text-foreground border border-border focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-200"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-lg bg-input text-foreground border border-border focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-200"
        >
          <option value="">Все категории</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg bg-input text-foreground border border-border focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-200"
        >
          <option value="">Сортировать по</option>
          <option value="popularity">Популярности</option>
        </select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {paginatedTools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card-glow rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105 relative"
          >
            {savedCounts[tool.id] > 0 && (
              <div
                className={`absolute top-2 right-2 rounded-full px-3 py-1 text-sm ${
                  userSavedTools.includes(tool.id)
                    ? "bg-green-500 text-white" 
                    : "bg-accent text-accent-foreground" 
                }`}
              >
                {savedCounts[tool.id]}
              </div>
            )}
            <h2 className="text-xl font-semibold mb-3">{tool.title}</h2>
            <p className="text-muted-foreground mb-4">{tool.description}</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm">{tool.category}</span>
              <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm">{tool.price}</span>
            </div>
            <div className="flex gap-3">
              <a
                href={tool.official_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 rounded-lg bg-gradient text-primary hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-center"
              >
                Открыть
              </a>
              <button
                onClick={() => saveTool(tool.id)}
                className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200"
              >
                Сохранить
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-8 flex justify-center items-center space-x-2"
        >
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
        </motion.div>
      )}
    </motion.div>
  )
}

export default AiToolCatalog