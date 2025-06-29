// src/lib/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // App
      app: {
        name: 'Social Scheduler',
        tagline: 'Manage all your social media in one place',
      },

      // Navigation
      navigation: {
        dashboard: 'Dashboard',
        posts: 'Posts',
        scheduled: 'Scheduled',
        drafts: 'Drafts',
        history: 'History',
        calendar: 'Calendar',
        accounts: 'Accounts',
        settings: 'Settings',
        profile: 'Profile',
      },

      // Common
      common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        search: 'Search...',
        optional: 'Optional',
        required: 'Required',
        retry: 'Retry',
        active: 'Active',
        inactive: 'Inactive',
      },

      // Authentication
      auth: {
        login: 'Login',
        logout: 'Logout',
        signup: 'Sign Up',
        email: 'Email',
        password: 'Password',
        username: 'Username',
        firstName: 'First Name',
        lastName: 'Last Name',
        loginWithGoogle: 'Continue with Google',
        forgotPassword: 'Forgot Password?',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
      },

      // Dashboard
      dashboard: {
        title: 'Dashboard',
        subtitle: 'Overview of your social media activity',
        recentPosts: 'Recent Posts',
        recentPostsDescription: 'Your latest posts and their status',
        upcomingEvents: 'Upcoming Events',
        upcomingEventsDescription: 'Special days and holidays coming up',
        connectedAccounts: 'Connected Accounts',
        connectedAccountsDescription: 'Your linked social media accounts',
        stats: {
          scheduled: 'Scheduled Posts',
          scheduledDesc: 'Posts waiting to be published',
          published: 'Published This Month',
          publishedDesc: 'Successfully published posts',
          drafts: 'Draft Posts',
          draftsDesc: 'Posts saved as drafts',
          accounts: 'Connected Accounts',
          accountsDesc: 'Active social media accounts',
        },
      },

      // Posts
      posts: {
        createPost: 'Create Post',
        createFirst: 'Create Your First Post',
        noPosts: 'No posts yet',
        compose: 'Compose',
        preview: 'Preview',
        title: 'Title',
        titlePlaceholder: 'Enter post title...',
        content: 'Content',
        contentPlaceholder: 'What do you want to share?',
        type: 'Post Type',
        types: {
          text: 'Text Only',
          image: 'Image Post',
          video: 'Video Post',
          carousel: 'Carousel',
          reel: 'Reel',
          short: 'Short Video',
        },
        media: 'Media Files',
        targetAccounts: 'Target Accounts',
        noCompatibleAccounts: 'No compatible accounts for this post type',
        schedule: 'Schedule',
        scheduleNote: 'Leave empty to publish immediately',
        saveDraft: 'Save Draft',
        publishNow: 'Publish Now',
        untitled: 'Untitled Post',
        created: 'Post created successfully!',
        savedAsDraft: 'Post saved as draft!',
        status: {
          draft: 'Draft',
          scheduled: 'Scheduled',
          published: 'Published',
          failed: 'Failed',
          partially_published: 'Partially Published',
        },
      },

      // AI
      ai: {
        generate: 'AI Generate',
        generateText: 'Generate Text',
        generateImage: 'Generate Image',
        prompt: 'Prompt',
        promptPlaceholder: 'Describe what you want to create...',
        generating: 'Generating...',
        regenerate: 'Regenerate',
        useContent: 'Use This Content',
        style: 'Style',
        styles: {
          realistic: 'Realistic',
          artistic: 'Artistic',
          cartoon: 'Cartoon',
          abstract: 'Abstract',
        },
      },

      // Accounts
      accounts: {
        addAccount: 'Add Account',
        connectAccount: 'Connect Account',
        removeAccount: 'Remove Account',
        noAccounts: 'No social media accounts connected',
        connectFirst: 'Connect your first social media account',
      },

      // Events
      events: {
        noUpcoming: 'No upcoming events',
        specialDays: 'Special Days',
        holidays: 'Holidays',
      },

      // Upload
      upload: {
        dropFiles: 'Drop files here',
        dragOrClick: 'Drag files here or click to select',
        supportedFormats: 'Supported: JPG, PNG, GIF, MP4, MOV',
      },

      // Theme
      theme: {
        toggle: 'Toggle Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
      },

      // Language
      language: {
        change: 'Change Language',
      },

      // Notifications
      notifications: {
        title: 'Notifications',
      },

      // Errors
      errors: {
        loadingFailed: 'Failed to load data',
        createFailed: 'Failed to create post',
        updateFailed: 'Failed to update',
        deleteFailed: 'Failed to delete',
        networkError: 'Network error. Please check your connection.',
        serverError: 'Server error. Please try again later.',
      },
    },
  },

  // Add other languages here
  es: {
    translation: {
      app: {
        name: 'Programador Social',
        tagline: 'Gestiona todas tus redes sociales en un solo lugar',
      },
      navigation: {
        dashboard: 'Panel',
        posts: 'Publicaciones',
        scheduled: 'Programadas',
        drafts: 'Borradores',
        history: 'Historial',
        calendar: 'Calendario',
        accounts: 'Cuentas',
        settings: 'Configuración',
        profile: 'Perfil',
      },
      // ... add more Spanish translations
    },
  },

  fr: {
    translation: {
      app: {
        name: 'Planificateur Social',
        tagline: 'Gérez tous vos médias sociaux en un seul endroit',
      },
      navigation: {
        dashboard: 'Tableau de bord',
        posts: 'Publications',
        scheduled: 'Programmées',
        drafts: 'Brouillons',
        history: 'Historique',
        calendar: 'Calendrier',
        accounts: 'Comptes',
        settings: 'Paramètres',
        profile: 'Profil',
      },
      // ... add more French translations
    },
  },

  ar: {
    translation: {
      app: {
        name: 'مجدول الوسائط الاجتماعية',
        tagline: 'إدارة جميع وسائل التواصل الاجتماعي في مكان واحد',
      },
      navigation: {
        dashboard: 'لوحة القيادة',
        posts: 'المنشورات',
        scheduled: 'مجدولة',
        drafts: 'المسودات',
        history: 'التاريخ',
        calendar: 'التقويم',
        accounts: 'الحسابات',
        settings: 'الإعدادات',
        profile: 'الملف الشخصي',
      },
      // ... add more Arabic translations
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'social-scheduler-language',
    },
  });

export default i18n;