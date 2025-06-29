// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Clock,
  FileEdit,
  History,
  Users,
  Settings,
  X,
  Plus
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';
import CreatePostModal from '@/components/post/CreatePostModal';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = React.useState(false);

  const navigation = [
    {
      name: t('navigation.dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: t('navigation.posts'),
      icon: FileText,
      children: [
        {
          name: t('navigation.scheduled'),
          href: '/posts/scheduled',
          icon: Clock,
        },
        {
          name: t('navigation.drafts'),
          href: '/posts/drafts',
          icon: FileEdit,
        },
        {
          name: t('navigation.history'),
          href: '/posts/history',
          icon: History,
        },
        {
          name: t('navigation.calendar'),
          href: '/posts/calendar',
          icon: Calendar,
        },
      ],
    },
    {
      name: t('navigation.accounts'),
      href: '/accounts',
      icon: Users,
    },
    {
      name: t('navigation.settings'),
      href: '/settings',
      icon: Settings,
    },
  ];

  const isActiveLink = (href) => {
    if (href === '/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 z-50 flex w-64 flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isRTL ? "right-0" : "left-0",
        isOpen ? "translate-x-0" : (isRTL ? "translate-x-full" : "-translate-x-full")
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r px-6 pb-4">
          {/* Logo and close button */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">SM</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                {t('app.name')}
              </span>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Create Post Button */}
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex items-center justify-center w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('posts.createPost')}
          </button>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  {!item.children ? (
                    <Link
                      to={item.href}
                      className={cn(
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors",
                        isActiveLink(item.href)
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  ) : (
                    <div>
                      <div className="flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-medium text-muted-foreground">
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.name}
                      </div>
                      <ul className="mt-1 space-y-1 ml-6">
                        {item.children.map((child) => (
                          <li key={child.name}>
                            <Link
                              to={child.href}
                              className={cn(
                                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors",
                                isActiveLink(child.href)
                                  ? "bg-accent text-accent-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                              )}
                            >
                              <child.icon className="h-4 w-4 shrink-0" />
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* User info */}
          <div className="border-t pt-4">
            <Link
              to="/profile"
              className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user?.first_name || user?.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />
    </>
  );
};

export default Sidebar;