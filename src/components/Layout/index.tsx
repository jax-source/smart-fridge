import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { Home, Package, BookOpen, Shuffle } from 'lucide-react';
import { TabType } from '../../types';

const tabs: { id: TabType; label: string; icon: React.ElementType; path: string }[] = [
  { id: 'home', label: '首页', icon: Home, path: '/' },
  { id: 'ingredients', label: '食材', icon: Package, path: '/ingredients' },
  { id: 'recipes', label: '菜谱', icon: BookOpen, path: '/recipes' },
  { id: 'recommend', label: '推荐', icon: Shuffle, path: '/recommend' },
];

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
                isActive
                  ? 'text-primary-500'
                  : 'text-gray-400 hover:text-gray-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon
                  className={clsx(
                    'w-6 h-6 mb-1 transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                />
                <span className="text-xs font-medium">{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 bg-primary-500 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showNav = true }) => {
  return (
    <div className="min-h-screen bg-cream-50">
      <main className={`${showNav ? 'pb-20' : ''} max-w-lg mx-auto`}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};
