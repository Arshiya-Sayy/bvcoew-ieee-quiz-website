import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Trophy, Users, Clock, Zap, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface HomePageProps {
  setCurrentPage: (page: string) => void;
}

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  score: number;
  xp: number;
  badges: string[];
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
  const { user, session } = useAuth();
  const targetTimeMs = new Date().getTime() + (5 * 24 * 60 * 60 * 1000); 

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

   // IEEE Day countdown (October 7th, 2025)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const ieeeDay = new Date('2025-10-07T00:00:00');
      
      const distance = ieeeDay.getTime() - now.getTime();

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        // IEEE Day has passed - reset countdown to all zeros
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    };

    // Update immediately
    updateCountdown();
    
    // Update every second
    const interval = setInterval(updateCountdown, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);
  
  // Fetch top 5 users for leaderboard preview
  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        if (session?.access_token) {
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7f978717/leaderboard`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const users = await response.json();
            setTopUsers(users.slice(0, 5));
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, [session]);

  const timeBoxVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    hover: { scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }
  };

  const badgeColors = {
    'Perfect Score': 'bg-yellow-500/20 text-yellow-400',
    'IEEE Expert': 'bg-purple-500/20 text-purple-400',
    'IEEE Scholar': 'bg-blue-500/20 text-blue-400',
    'IEEE Enthusiast': 'bg-green-500/20 text-green-400',
    'Speed Demon': 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* IEEE Day Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 mb-12"
        >
          <div className="absolute inset-0 bg-black/30" />
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJRUVFJTIwZWxlY3Ryb25pY3MlMjBlbmdpbmVlcmluZyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzU5Mzg1Mzc0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="IEEE Technology"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          
          <div className="relative z-10 px-8 py-16 text-center text-white">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <Zap className="w-20 h-20 text-yellow-400" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              IEEE DAY 2025
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Celebrating innovation, advancing technology for humanity, and connecting engineers worldwide
            </p>

            {/* Countdown Timer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  variants={timeBoxVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-300 uppercase tracking-wide">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setCurrentPage('quiz')}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300"
              >
                <Play className="w-6 h-6 mr-2" />
                Start IEEE Quiz Challenge
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="w-6 h-6 mr-2 text-yellow-400" />
                  Your Progress
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Track your IEEE knowledge journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
                    <div className="text-3xl font-bold text-blue-400">{user?.xp || 0}</div>
                    <div className="text-sm text-gray-300">Total XP</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg">
                    <div className="text-3xl font-bold text-green-400">{user?.score || 0}</div>
                    <div className="text-sm text-gray-300">Best Score</div>
                  </div>
                </div>

                {/* User Badges */}
                {user?.badges && user.badges.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3">Your Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.badges.map((badge, index) => (
                        <motion.div
                          key={badge}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Badge 
                            className={`${badgeColors[badge as keyof typeof badgeColors] || 'bg-gray-500/20 text-gray-400'} border-0`}
                          >
                            {badge}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30"
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="w-8 h-8 text-purple-400" />
                    <div>
                      <h4 className="text-white font-semibold">Ready for the Challenge?</h4>
                      <p className="text-sm text-gray-300">Test your IEEE knowledge and climb the leaderboard!</p>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Users Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
                    Top Performers
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage('leaderboard')}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View All
                  </Button>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Current leaderboard champions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                        <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-600 rounded mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : topUsers.length > 0 ? (
                  <div className="space-y-3">
                    {topUsers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-orange-500 text-black' :
                            'bg-blue-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                              {user.score} pts
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400">
                              {user.xp} XP
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No quiz results yet!</p>
                    <p className="text-sm text-gray-500">Be the first to complete the challenge</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};