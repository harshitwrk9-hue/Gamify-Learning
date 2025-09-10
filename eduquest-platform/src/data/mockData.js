// Mock data for EduQuest platform

export const currentUser = {
  id: 1,
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80",
  level: 12,
  xp: 2850,
  xpToNextLevel: 3000,
  streak: 7,
  joinDate: "2024-01-15",
  completedCourses: [1, 3],
  currentCourses: [2, 4],
  badges: [1, 2, 3, 5, 7, 8],
  weeklyGoal: 5,
  weeklyProgress: 3,
  // Gamification enhancements
  coins: 1250,
  gems: 45,
  powerUps: {
    xpBooster: 2,
    streakProtector: 1,
    timeFreeze: 0
  },
  currentTitle: "Knowledge Seeker",
  availableTitles: ["Novice Learner", "Knowledge Seeker", "Study Master"],
  dailyQuestProgress: {
    lessonsCompleted: 2,
    quizzesTaken: 1,
    streakMaintained: true
  },
  achievements: {
    totalEarned: 15,
    recentlyUnlocked: ["Speed Demon", "Perfect Score"]
  },
  socialStats: {
    friendsCount: 12,
    coursesCompleted: 5,
  certificatesEarned: 2
  }
};

export const courses = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    description: "Learn the basics of JavaScript programming",
    category: "Programming",
    difficulty: "Beginner",
    duration: "4 weeks",
    lessons: 12,
    completedLessons: 12,
    progress: 100,
    instructor: "Sarah Chen",
    rating: 4.8,
    students: 1250,
    thumbnail: "/api/placeholder/300/200",
    color: "#3B82F6",
    xpReward: 500
  },
  {
    id: 2,
    title: "Advanced React Patterns",
    description: "Master advanced React concepts and patterns",
    category: "Programming",
    difficulty: "Advanced",
    duration: "6 weeks",
    lessons: 18,
    completedLessons: 8,
    progress: 44,
    instructor: "Mike Rodriguez",
    rating: 4.9,
    students: 890,
    thumbnail: "/api/placeholder/300/200",
    color: "#10B981",
    xpReward: 800
  },
  {
    id: 3,
    title: "Data Structures & Algorithms",
    description: "Essential computer science concepts",
    category: "Computer Science",
    difficulty: "Intermediate",
    duration: "8 weeks",
    lessons: 24,
    completedLessons: 24,
    progress: 100,
    instructor: "Dr. Emily Watson",
    rating: 4.7,
    students: 2100,
    thumbnail: "/api/placeholder/300/200",
    color: "#8B5CF6",
    xpReward: 700
  },
  {
    id: 4,
    title: "Machine Learning Basics",
    description: "Introduction to ML concepts and applications",
    category: "Data Science",
    difficulty: "Intermediate",
    duration: "10 weeks",
    lessons: 20,
    completedLessons: 3,
    progress: 15,
    instructor: "Prof. David Kim",
    rating: 4.6,
    students: 1580,
    thumbnail: "/api/placeholder/300/200",
    color: "#F59E0B",
    xpReward: 900
  },
  {
    id: 5,
    title: "UI/UX Design Principles",
    description: "Create beautiful and functional user interfaces",
    category: "Design",
    difficulty: "Beginner",
    duration: "5 weeks",
    lessons: 15,
    completedLessons: 0,
    progress: 0,
    instructor: "Lisa Park",
    rating: 4.8,
    students: 950,
    thumbnail: "/api/placeholder/300/200",
    color: "#EF4444",
    xpReward: 600
  },
  {
    id: 6,
    title: "Calculus I",
    description: "Fundamental concepts of differential calculus",
    category: "Mathematics",
    difficulty: "Intermediate",
    duration: "12 weeks",
    lessons: 30,
    completedLessons: 0,
    progress: 0,
    instructor: "Dr. Robert Taylor",
    rating: 4.5,
    students: 1200,
    thumbnail: "/api/placeholder/300/200",
    color: "#06B6D4",
    xpReward: 800
  }
];

export const lessons = {
  2: [ // Advanced React Patterns course
    {
      id: 1,
      title: "Higher-Order Components",
      description: "Learn to create reusable component logic",
      duration: "25 min",
      type: "video",
      completed: true,
      xpReward: 50
    },
    {
      id: 2,
      title: "Render Props Pattern",
      description: "Share code between components using render props",
      duration: "30 min",
      type: "video",
      completed: true,
      xpReward: 50
    },
    {
      id: 3,
      title: "Context API Deep Dive",
      description: "Advanced usage of React Context",
      duration: "35 min",
      type: "video",
      completed: true,
      xpReward: 60
    },
    {
      id: 4,
      title: "Custom Hooks Mastery",
      description: "Build powerful custom hooks",
      duration: "40 min",
      type: "video",
      completed: false,
      xpReward: 70
    }
  ]
};

export const quizzes = {
  2: { // Advanced React Patterns course
    1: {
      id: 1,
      lessonId: 1,
      title: "Higher-Order Components Quiz",
      questions: [
        {
          id: 1,
          question: "What is a Higher-Order Component (HOC)?",
          options: [
            "A component that renders other components",
            "A function that takes a component and returns a new component",
            "A component with higher performance",
            "A component that uses hooks"
          ],
          correctAnswer: 1,
          explanation: "A Higher-Order Component is a function that takes a component and returns a new component with additional props or behavior."
        },
        {
          id: 2,
          question: "Which of the following is a benefit of HOCs?",
          options: [
            "Code reusability",
            "Separation of concerns",
            "Enhanced component composition",
            "All of the above"
          ],
          correctAnswer: 3,
          explanation: "HOCs provide all these benefits by allowing you to extract common logic and reuse it across multiple components."
        },
        {
          id: 3,
          question: "What should you avoid when creating HOCs?",
          options: [
            "Mutating the original component",
            "Using displayName",
            "Passing props",
            "Using React.forwardRef"
          ],
          correctAnswer: 0,
          explanation: "You should never mutate the original component. Instead, create a new component that wraps the original."
        }
      ]
    }
  }
};

export const badges = [
  {
    id: 1,
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "🎯",
    category: "Achievement",
    rarity: "Common",
    xpReward: 50,
    unlockedAt: "2024-01-16"
  },
  {
    id: 2,
    name: "Quick Learner",
    description: "Complete 5 lessons in one day",
    icon: "⚡",
    category: "Speed",
    rarity: "Uncommon",
    xpReward: 100,
    unlockedAt: "2024-01-20"
  },
  {
    id: 3,
    name: "Course Conqueror",
    description: "Complete your first course",
    icon: "🏆",
    category: "Achievement",
    rarity: "Rare",
    xpReward: 200,
    unlockedAt: "2024-02-15"
  },
  {
    id: 4,
    name: "Streak Master",
    description: "Maintain a 30-day learning streak",
    icon: "🔥",
    category: "Consistency",
    rarity: "Epic",
    xpReward: 500,
    unlockedAt: null
  },
  {
    id: 5,
    name: "Quiz Champion",
    description: "Score 100% on 10 quizzes",
    icon: "🧠",
    category: "Knowledge",
    rarity: "Rare",
    xpReward: 300,
    unlockedAt: "2024-02-28"
  },
  {
    id: 6,
    name: "Quiz Master",
    description: "Score 100% on 20 different quizzes",
    icon: "🎯",
    category: "Achievement",
    rarity: "Uncommon",
    xpReward: 150,
    unlockedAt: null
  },
  {
    id: 7,
    name: "Night Owl",
    description: "Complete lessons after 10 PM",
    icon: "🦉",
    category: "Special",
    rarity: "Common",
    xpReward: 75,
    unlockedAt: "2024-01-25"
  },
  {
    id: 8,
    name: "Early Bird",
    description: "Complete lessons before 7 AM",
    icon: "🐦",
    category: "Special",
    rarity: "Common",
    xpReward: 75,
    unlockedAt: "2024-02-10"
  }
];

export const leaderboard = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50&q=80",
    xp: 2850,
    level: 12,
    streak: 7,
    coursesCompleted: 2
  },
  {
    id: 2,
    name: "Emma Davis",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50&q=80",
    xp: 3200,
    level: 14,
    streak: 12,
    coursesCompleted: 3
  },
  {
    id: 3,
    name: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50&q=80",
    xp: 2950,
    level: 13,
    streak: 5,
    coursesCompleted: 2
  },
  {
    id: 4,
    name: "Sarah Wilson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50&q=80",
    xp: 2700,
    level: 11,
    streak: 15,
    coursesCompleted: 2
  },
  {
    id: 5,
    name: "David Rodriguez",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50&q=80",
    xp: 2600,
    level: 11,
    streak: 3,
    coursesCompleted: 1
  },
  {
    id: 6,
    name: "Lisa Park",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50&q=80",
    xp: 2400,
    level: 10,
    streak: 8,
    coursesCompleted: 1
  },
  {
    id: 7,
    name: "James Taylor",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50&q=80",
    xp: 2200,
    level: 9,
    streak: 4,
    coursesCompleted: 1
  },
  {
    id: 8,
    name: "Anna Martinez",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&h=50&q=80",
    xp: 2100,
    level: 9,
    streak: 6,
    coursesCompleted: 1
  }
];

export const achievements = [
  {
    id: 1,
    title: "Welcome to EduQuest!",
    description: "You've successfully created your account",
    date: "2024-01-15",
    xpEarned: 50,
    type: "milestone"
  },
  {
    id: 2,
    title: "First Lesson Complete",
    description: "Completed 'Introduction to Variables' in JavaScript Fundamentals",
    date: "2024-01-16",
    xpEarned: 25,
    type: "lesson"
  },
  {
    id: 3,
    title: "Quiz Master",
    description: "Scored 100% on Higher-Order Components Quiz",
    date: "2024-02-28",
    xpEarned: 100,
    type: "quiz"
  },
  {
    id: 4,
    title: "Course Completed",
    description: "Finished JavaScript Fundamentals course",
    date: "2024-02-15",
    xpEarned: 500,
    type: "course"
  }
];

export const categories = [
  {
    id: 1,
    name: "Programming",
    icon: "💻",
    color: "#3B82F6",
    courseCount: 15
  },
  {
    id: 2,
    name: "Data Science",
    icon: "📊",
    color: "#10B981",
    courseCount: 8
  },
  {
    id: 3,
    name: "Design",
    icon: "🎨",
    color: "#EF4444",
    courseCount: 12
  },
  {
    id: 4,
    name: "Mathematics",
    icon: "📐",
    color: "#8B5CF6",
    courseCount: 10
  },
  {
    id: 5,
    name: "Computer Science",
    icon: "🖥️",
    color: "#F59E0B",
    courseCount: 6
  },
  {
    id: 6,
    name: "Business",
    icon: "💼",
    color: "#06B6D4",
    courseCount: 9
  }
];

export const challenges = [
  {
    id: 1,
    title: "Daily Learner",
    description: "Complete at least one lesson today",
    type: "daily",
    progress: 1,
    target: 1,
    xpReward: 50,
    coinReward: 25,
    completed: true,
    expiresAt: "2024-03-15T23:59:59Z",
    difficulty: "easy",
    icon: "📚"
  },
  {
    id: 2,
    title: "Quiz Streak",
    description: "Take 3 quizzes this week",
    type: "weekly",
    progress: 2,
    target: 3,
    xpReward: 200,
    coinReward: 100,
    gemReward: 5,
    completed: false,
    expiresAt: "2024-03-17T23:59:59Z",
    difficulty: "medium",
    icon: "🧠"
  },
  {
    id: 3,
    title: "Course Explorer",
    description: "Start 2 new courses this month",
    type: "monthly",
    progress: 1,
    target: 2,
    xpReward: 500,
    coinReward: 300,
    gemReward: 15,
    completed: false,
    expiresAt: "2024-03-31T23:59:59Z",
    difficulty: "hard",
    icon: "🚀"
  },
  {
    id: 4,
    title: "Speed Demon",
    description: "Complete 5 lessons in under 2 hours",
    type: "daily",
    progress: 3,
    target: 5,
    xpReward: 150,
    coinReward: 75,
    powerUpReward: "xpBooster",
    completed: false,
    expiresAt: "2024-03-15T23:59:59Z",
    difficulty: "hard",
    icon: "⚡"
  },
  {
    id: 5,
    title: "Perfect Score",
    description: "Get 100% on 3 consecutive quizzes",
    type: "weekly",
    progress: 2,
    target: 3,
    xpReward: 300,
    coinReward: 150,
    gemReward: 10,
    completed: false,
    expiresAt: "2024-03-17T23:59:59Z",
    difficulty: "legendary",
    icon: "🏆"
  }
];

// Daily Quests - Reset every day
export const dailyQuests = [
  {
    id: 1,
    title: "Morning Study",
    description: "Complete a lesson before 10 AM",
    progress: 1,
    target: 1,
    xpReward: 75,
    coinReward: 30,
    completed: true,
    icon: "🌅",
    timeBonus: true
  },
  {
    id: 2,
    title: "Quiz Master",
    description: "Take any quiz and score above 80%",
    progress: 0,
    target: 1,
    xpReward: 100,
    coinReward: 50,
    completed: false,
    icon: "🎯"
  },
  {
    id: 3,
    title: "Social Learner",
    description: "Participate in forum discussion",
    progress: 0,
    target: 1,
    xpReward: 60,
    coinReward: 25,
    completed: false,
    icon: "💬"
  }
];

// Power-ups and boosters
export const powerUps = [
  {
    id: 1,
    name: "XP Booster",
    description: "Double XP for next 3 lessons",
    icon: "⚡",
    cost: 100, // coins
    duration: "3 lessons",
    effect: "2x XP multiplier"
  },
  {
    id: 2,
    name: "Streak Protector",
    description: "Protects your streak for one day",
    icon: "🛡️",
    cost: 150,
    duration: "1 day",
    effect: "Streak protection"
  },
  {
    id: 3,
    name: "Time Freeze",
    description: "Pause quiz timer for 30 seconds",
    icon: "⏰",
    cost: 75,
    duration: "30 seconds",
    effect: "Timer pause"
  },
  {
    id: 4,
    name: "Hint Master",
    description: "Get 3 free hints in quizzes",
    icon: "💡",
    cost: 80,
    duration: "3 hints",
    effect: "Free quiz hints"
  }
];

// Achievement tiers and rewards
export const achievementTiers = {
  bronze: { multiplier: 1, color: "#CD7F32", icon: "🥉" },
  silver: { multiplier: 1.5, color: "#C0C0C0", icon: "🥈" },
  gold: { multiplier: 2, color: "#FFD700", icon: "🥇" },
  platinum: { multiplier: 3, color: "#E5E4E2", icon: "💎" },
  legendary: { multiplier: 5, color: "#9966CC", icon: "👑" }
};

// Community features removed

// All community data removed