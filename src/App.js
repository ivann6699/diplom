import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import NavMenu from "./components/NavMenu"
import AiToolCatalog from "./components/AiToolCatalog"
import SavedTools from "./components/SavedTools"
import BlogPage from "./components/BlogPage"
import LoginPage from "./components/LoginPage"
import LearningPage from "./components/LearningPage";
import UserProfile from './components/UserProfile';

function App() {
  return (
    <Router>
      <div className="font-sans antialiased text-foreground bg-background min-h-screen">
        <NavMenu />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<AiToolCatalog />} />
            <Route path="/saved" element={<SavedTools />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/learning" element={<LearningPage />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  )
}

export default App

