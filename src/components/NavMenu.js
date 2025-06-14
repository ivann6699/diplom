import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Transition } from "@headlessui/react";
import { 
  ChevronDownIcon,
  UserIcon,
  AcademicCapIcon,
  BookmarkIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";

const NavMenu = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Главная", path: "/" },
    { name: "Сохраненные", path: "/saved", auth: true },
    { name: "Блог", path: "/blog" },
    { name: "Обучение", path: "/learning", auth: true },
  ];

  const fetchUserProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('user_id', userId)
      .single();

    if (!error) {
      setUserProfile(data);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    
    if (session) {
      fetchUserProfile(session.user.id);
    } else {
      setUserProfile(null);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    checkAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkAuth]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    closeMobileMenu();
  }, [location]);

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

          {/* Desktop Menu */}
          <div className="hidden sm:block">
            <div className="flex items-center space-x-4">
              {menuItems.map((item) => (
                (!item.auth || isLoggedIn) && (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      location.pathname === item.path
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}

              {!isLoggedIn ? (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gradient text-primary hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  Войти
                </Link>
              ) : (
                <Menu as="div" className="relative ml-4">
                  <div>
                    <Menu.Button className="flex items-center space-x-2 focus:outline-none">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white">
                          {userProfile?.first_name?.charAt(0) || ''}
                          {userProfile?.last_name?.charAt(0) || ''}
                        </div>
                        <span className="ml-2 text-sm font-medium hidden md:inline">
                          {userProfile?.first_name || 'Профиль'}
                        </span>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                    </Menu.Button>
                  </div>

                  <Transition
                    as={motion.div}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-popover shadow-lg focus:outline-none z-50 border border-border">
                      <div className="px-1 py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`${
                                active ? 'bg-accent text-accent-foreground' : 'text-foreground'
                              } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                            >
                              <UserIcon className="mr-2 h-5 w-5" />
                              Личный кабинет
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/saved"
                              className={`${
                                active ? 'bg-accent text-accent-foreground' : 'text-foreground'
                              } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                            >
                              <BookmarkIcon className="mr-2 h-5 w-5" />
                              Сохраненные
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/learning"
                              className={`${
                                active ? 'bg-accent text-accent-foreground' : 'text-foreground'
                              } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                            >
                              <AcademicCapIcon className="mr-2 h-5 w-5" />
                              Обучение
                            </Link>
                          )}
                        </Menu.Item>
                        <div className="border-t border-border my-1"></div>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={`${
                                active ? 'bg-destructive text-destructive-foreground' : 'text-destructive'
                              } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                            >
                              <ArrowLeftOnRectangleIcon className="mr-2 h-5 w-5" />
                              Выйти
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden bg-background border-b border-border"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                (!item.auth || isLoggedIn) && (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      location.pathname === item.path
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}

              {!isLoggedIn ? (
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-gradient text-primary hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  Войти
                </Link>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center">
                      <UserIcon className="mr-2 h-5 w-5" />
                      Личный кабинет
                    </div>
                  </Link>
                  <Link
                    to="/saved"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center">
                      <BookmarkIcon className="mr-2 h-5 w-5" />
                      Сохраненные
                    </div>
                  </Link>
                  <Link
                    to="/learning"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center">
                      <AcademicCapIcon className="mr-2 h-5 w-5" />
                      Обучение
                    </div>
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <div className="flex items-center">
                      <ArrowLeftOnRectangleIcon className="mr-2 h-5 w-5" />
                      Выйти
                    </div>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavMenu;