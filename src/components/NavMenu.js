"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import { motion } from "framer-motion"

const NavMenu = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { name: "Главная", path: "/" },
    { name: "Сохраненные", path: "/saved" },
    { name: "Блог", path: "/blog" },
  ]

  useEffect(() => {
    checkAuth()
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    setIsLoggedIn(!!session)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gradient">
              AI Tools
            </Link>
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center space-x-4">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.path
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {!isLoggedIn ? (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gradient text-primary hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  Войти
                </Link>
              ) : (
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors duration-200"
                >
                  Выйти
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default NavMenu

