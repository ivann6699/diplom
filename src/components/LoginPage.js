"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import { motion } from "framer-motion"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleAuth = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const { error } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

      if (error) throw error

      alert("Успешно!")
      navigate("/")
    } catch (e) {
      setError(e.message)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[80vh] flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card-glow w-full max-w-md rounded-xl p-8"
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-gradient">{isLogin ? "Войти" : "Регистрация"}</h1>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg bg-input text-foreground border border-border focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Пароль</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg bg-input text-foreground border border-border focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-200"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient text-primary hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
          >
            {isLogin ? "Войти" : "Зарегистрироваться"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMode}
            className="w-full py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 font-medium"
          >
            {isLogin ? "Создать аккаунт" : "Уже есть аккаунт?"}
          </motion.button>
        </form>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-destructive text-center"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  )
}

export default LoginPage

