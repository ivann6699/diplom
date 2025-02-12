import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../supabase"
import { motion } from "framer-motion"

const SavedTools = () => {
  const [savedTools, setSavedTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  const fetchUserData = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    setUser(currentUser)
    if (currentUser) {
      fetchSavedTools(currentUser.id)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchSavedTools = async (userId) => {
    try {
      const { data, error } = await supabase.from("saved_tools").select("tool_id").eq("user_id", userId)

      if (error) {
        console.error("Ошибка при загрузке сохраненных инструментов:", error)
        return
      }

      const toolIds = data.map((item) => item.tool_id)
      const { data: toolsData, error: toolsError } = await supabase.from("ai_tools").select("*").in("id", toolIds)

      if (toolsError) {
        console.error("Ошибка при загрузке данных инструментов:", toolsError)
        return
      }

      setSavedTools(toolsData)
    } catch (err) {
      console.error("Произошла ошибка:", err)
    } finally {
      setLoading(false)
    }
  }

  const deleteSavedTool = async (toolId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот инструмент из сохраненных?")) {
      try {
        const { error } = await supabase.from("saved_tools").delete().eq("user_id", user.id).eq("tool_id", toolId)

        if (error) {
          throw error
        }

        setSavedTools((prevTools) => prevTools.filter((tool) => tool.id !== toolId))
        alert("Инструмент успешно удален из сохраненных.")
      } catch (error) {
        console.error("Ошибка при удалении инструмента:", error)
        alert("Не удалось удалить инструмент. Попробуйте еще раз.")
      }
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-glow rounded-xl p-8 text-center max-w-md mx-auto mt-12"
      >
        <p className="text-xl mb-4">Пожалуйста, войдите в систему</p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 rounded-lg bg-gradient text-primary hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
        >
          Войти
        </Link>
      </motion.div>
    )
  }

  if (savedTools.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-glow rounded-xl p-8 text-center max-w-md mx-auto mt-12"
      >
        <p className="text-xl mb-4">У вас пока нет сохраненных инструментов</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-lg bg-gradient text-primary hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
        >
          Просмотреть каталог
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-4xl font-bold text-center mb-12 text-gradient"
      >
        Сохраненные инструменты
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {savedTools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card-glow rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold">{tool.title}</h3>
              <button
                onClick={() => deleteSavedTool(tool.id)}
                className="text-sm px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Удалить
              </button>
            </div>
            <p className="text-muted-foreground mb-4">{tool.description}</p>
            <a
              href={tool.official_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full px-4 py-2 rounded-lg bg-gradient text-primary hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-center"
            >
              Открыть сайт
            </a>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default SavedTools

