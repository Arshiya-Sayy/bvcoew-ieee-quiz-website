import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createClient } from "@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Quiz questions data
const quizQuestions = [
  {
    id: 1,
    question: "What does IEEE stand for?",
    options: ["Institute of Electrical and Electronics Engineers", "International Electrical Engineers", "Institute of Electronic Engineers", "International Electronics Engineers"],
    correctAnswer: 0,
    points: 10
  },
  {
    id: 2,
    question: "When was IEEE founded?",
    options: ["1963", "1884", "1950", "1975"],
    correctAnswer: 0,
    points: 10
  },
  {
    id: 3,
    question: "What is the IEEE motto?",
    options: ["Advancing Technology for Humanity", "Engineering the Future", "Innovation Through Technology", "Technology for All"],
    correctAnswer: 0,
    points: 10
  },
  {
    id: 4,
    question: "How many IEEE members are there worldwide approximately?",
    options: ["200,000", "300,000", "400,000", "500,000"],
    correctAnswer: 2,
    points: 10
  },
  {
    id: 5,
    question: "What is IEEE's most cited publication?",
    options: ["IEEE Spectrum", "IEEE Transactions", "IEEE Computer", "IEEE Communications"],
    correctAnswer: 1,
    points: 10
  },
  {
    id: 6,
    question: "In how many countries does IEEE operate?",
    options: ["150+", "160+", "170+", "180+"],
    correctAnswer: 2,
    points: 10
  },
  {
    id: 7,
    question: "What does IEEE Day celebrate?",
    options: ["First IEEE meeting", "First telegraph message", "IEEE founding", "First electrical patent"],
    correctAnswer: 1,
    points: 10
  },
  {
    id: 8,
    question: "Which IEEE standard defines Ethernet?",
    options: ["802.3", "802.11", "802.15", "802.16"],
    correctAnswer: 0,
    points: 15
  },
  {
    id: 9,
    question: "What is IEEE's vision?",
    options: ["Engineering Excellence", "Global Technology Leadership", "IEEE will be essential to the global technical community", "Innovation for Tomorrow"],
    correctAnswer: 2,
    points: 15
  },
  {
    id: 10,
    question: "Which programming language was developed by IEEE member?",
    options: ["Java", "Python", "C++", "JavaScript"],
    correctAnswer: 2,
    points: 15
  }
];

// User signup endpoint
app.post("/make-server-7f978717/auth/signup", async (c) => {
  try {
    const { name, email, password, membershipType } = await c.req.json();
    
    if (!name || !email || !password) {
      return c.json({ error: "Name, email, and password are required" }, 400);
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true
    });

    if (error) {
      console.log("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user data in KV store
    const userData = {
      id: data.user.id,
      name,
      email,
      membershipType: membershipType || 'non-ieee-member',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      xp: 0,
      score: 0,
      badges: [],
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${data.user.id}`, userData);

    return c.json({ 
      message: "User created successfully", 
      user: { id: data.user.id, name, email, avatar: userData.avatar }
    });
  } catch (error) {
    console.log("Signup error:", error);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// User login endpoint - this creates a session that the frontend can use
app.post("/make-server-7f978717/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Use service role to verify user exists and password is correct
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("Login error:", error);
      return c.json({ error: error.message }, 400);
    }

    // Fetch user data from KV store
    const userData = await kv.get(`user:${data.user.id}`);
    
    if (!userData) {
      return c.json({ error: "User data not found" }, 404);
    }
    
    return c.json({ 
      message: "Login successful",
      user: userData,
      session: data.session
    });
  } catch (error) {
    console.log("Login error:", error);
    return c.json({ error: "Internal server error during login" }, 500);
  }
});

// Get user data endpoint
app.get("/make-server-7f978717/auth/user", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Fetch user data from KV store
    const userData = await kv.get(`user:${user.id}`);
    
    if (!userData) {
      return c.json({ error: "User data not found" }, 404);
    }
    
    return c.json({ user: userData });
  } catch (error) {
    console.log("User fetch error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Check if user can take quiz today
app.get("/make-server-7f978717/quiz/check-eligibility", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user data to check last quiz attempt
    const userData = await kv.get(`user:${user.id}`);
    
    if (!userData) {
      return c.json({ error: "User data not found" }, 404);
    }

    // Check if user has attempted quiz today
    if (userData.lastQuizAt) {
      const lastQuizDate = new Date(userData.lastQuizAt);
      const today = new Date();
      
      // Reset time to beginning of day for comparison
      lastQuizDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      if (lastQuizDate.getTime() === today.getTime()) {
        return c.json({ 
          canTakeQuiz: false, 
          message: "You have already attempted today's quiz. Please try again tomorrow.",
          lastAttempt: userData.lastQuizAt
        });
      }
    }

    return c.json({ canTakeQuiz: true });
  } catch (error) {
    console.log("Quiz eligibility check error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get quiz questions
app.get("/make-server-7f978717/quiz/questions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user can take quiz today
    const userData = await kv.get(`user:${user.id}`);
    
    if (userData && userData.lastQuizAt) {
      const lastQuizDate = new Date(userData.lastQuizAt);
      const today = new Date();
      
      // Reset time to beginning of day for comparison
      lastQuizDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      if (lastQuizDate.getTime() === today.getTime()) {
        return c.json({ 
          error: "You have already attempted today's quiz. Please try again tomorrow." 
        }, 429);
      }
    }

    // Return shuffled questions without correct answers
    const shuffledQuestions = quizQuestions
      .sort(() => Math.random() - 0.5)
      .map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        points: q.points
      }));

    return c.json(shuffledQuestions);
  } catch (error) {
    console.log("Questions fetch error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Submit quiz answers
app.post("/make-server-7f978717/quiz/submit", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { answers, timeSpent } = await c.req.json();
    
    if (!answers || !Array.isArray(answers)) {
      return c.json({ error: "Invalid answers format" }, 400);
    }

    // Calculate score
    let totalScore = 0;
    let correctCount = 0;
    let xpEarned = 0;
    const earnedBadges = [];

    answers.forEach(answer => {
      const question = quizQuestions.find(q => q.id === answer.questionId);
      if (question && question.correctAnswer === answer.selectedOption) {
        totalScore += question.points;
        correctCount++;
        xpEarned += question.points * 2; // XP is double the points
      }
    });

    // Award badges based on performance
    if (correctCount === quizQuestions.length) {
      earnedBadges.push("Perfect Score");
      xpEarned += 100; // Bonus XP for perfect score
    } else if (correctCount >= 8) {
      earnedBadges.push("IEEE Expert");
      xpEarned += 50;
    } else if (correctCount >= 6) {
      earnedBadges.push("IEEE Scholar");
      xpEarned += 25;
    } else if (correctCount >= 4) {
      earnedBadges.push("IEEE Enthusiast");
      xpEarned += 10;
    }

    if (timeSpent && timeSpent < 120) { // Less than 2 minutes
      earnedBadges.push("Speed Demon");
      xpEarned += 30;
    }

    // Update user data
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      userData.score = Math.max(userData.score, totalScore); // Keep highest score
      userData.xp += xpEarned;
      userData.badges = [...new Set([...userData.badges, ...earnedBadges])]; // Avoid duplicates
      userData.lastQuizAt = new Date().toISOString();
      userData.timeSpent = timeSpent;
      
      await kv.set(`user:${user.id}`, userData);
    }

    return c.json({
      score: totalScore,
      correctAnswers: correctCount,
      totalQuestions: quizQuestions.length,
      xpEarned,
      earnedBadges,
      user: userData
    });
  } catch (error) {
    console.log("Quiz submit error:", error);
    return c.json({ error: "Internal server error during quiz submission" }, 500);
  }
});

// Get leaderboard
app.get("/make-server-7f978717/leaderboard", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get all users from KV store
    const userKeys = await kv.getByPrefix("user:");
    const users = userKeys
      .filter(userData => userData.score > 0) // Only users who have taken the quiz
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score; // Higher score first
        if (b.xp !== a.xp) return b.xp - a.xp; // Higher XP second
        return new Date(a.lastQuizAt || a.createdAt).getTime() - new Date(b.lastQuizAt || b.createdAt).getTime(); // Earlier completion time third
      })
      .map((user, index) => ({
        rank: index + 1,
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        score: user.score,
        xp: user.xp,
        badges: user.badges,
        timeSpent: user.timeSpent || null
      }));

    return c.json(users);
  } catch (error) {
    console.log("Leaderboard fetch error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Contact form submission
app.post("/make-server-7f978717/contact", async (c) => {
  try {
    const { name, email, message } = await c.req.json();
    
    if (!name || !email || !message) {
      return c.json({ error: "Name, email, and message are required" }, 400);
    }

    // Store contact message in KV store
    const contactData = {
      id: crypto.randomUUID(),
      name,
      email,
      message,
      createdAt: new Date().toISOString()
    };

    await kv.set(`contact:${contactData.id}`, contactData);

    return c.json({ message: "Contact form submitted successfully" });
  } catch (error) {
    console.log("Contact form error:", error);
    return c.json({ error: "Internal server error during contact form submission" }, 500);
  }
});

// Health check endpoint
app.get("/make-server-7f978717/health", (c) => {
  return c.json({ status: "ok" });
});

Deno.serve(app.fetch);