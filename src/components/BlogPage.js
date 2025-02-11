"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const BlogPage = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    const apiKey = "92770c79a95c4c8481141d32762eb30b"
    const url = `https://newsapi.org/v2/everything?q=AI&apiKey=${apiKey}`
    try {
      const response = await fetch(url)
      const data = await response.json()
      setArticles(data.articles)
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
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
            <p className="text-sm text-muted-foreground">
              <strong>Источник:</strong> {article.source.name}
            </p>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  )
}

export default BlogPage

