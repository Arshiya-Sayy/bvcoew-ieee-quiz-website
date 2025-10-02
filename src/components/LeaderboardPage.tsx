import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Crown, Star, Zap, Clock, Users, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useAuth } from '../App';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  score: number;
  xp: number;
  badges: string[];
  timeSpent?: number;
}

export const LeaderboardPage: React.FC = () => {
  const { user, session } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7f978717/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const users = await response.json();
        setLeaderboard(users);
      } else {
        toast.error('Failed to load leaderboard');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Error loading leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchLeaderboard(), 30000);
    return () => clearInterval(interval);
  }, [session]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-300" />;
      case 3:
        return <Medal className="w-8 h-8 text-orange-400" />;
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {rank}
          </div>
        );
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-black';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-black';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white';
    }
  };

  const badgeColors = {
    'Perfect Score': 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
    'IEEE Expert': 'bg-purple-500/20 text-purple-400 border-purple-400/30',
    'IEEE Scholar': 'bg-blue-500/20 text-blue-400 border-blue-400/30',
    'IEEE Enthusiast': 'bg-green-500/20 text-green-400 border-green-400/30',
    'Speed Demon': 'bg-red-500/20 text-red-400 border-red-400/30'
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
            />
            <p className="text-white mt-4">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="w-16 h-16 text-yellow-400" />
            </motion.div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            IEEE Day <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Leaderboard</span>
          </h1>
          <p className="text-xl text-gray-300 mb-6">Champions of IEEE Knowledge</p>
          
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={() => fetchLeaderboard(true)}
              disabled={refreshing}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              {refreshing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
            
            <div className="flex items-center space-x-2 text-gray-300">
              <Users className="w-4 h-4" />
              <span>{leaderboard.length} participants</span>
            </div>
          </div>
        </motion.div>

        {leaderboard.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-md mx-auto">
              <CardContent className="p-8">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Results Yet</h3>
                <p className="text-gray-400">Be the first to complete the IEEE Day quiz and claim the top spot!</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {/* 2nd Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <Card className="bg-gradient-to-br from-gray-300/20 to-gray-500/20 border-gray-300/30 w-full">
                      <CardContent className="p-6 text-center">
                        <div className="mb-4">
                          <Medal className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <div className="text-3xl font-bold text-gray-300">2nd</div>
                        </div>
                        <Avatar className="w-16 h-16 mx-auto mb-3">
                          <AvatarImage src={leaderboard[1].avatar} alt={leaderboard[1].name} />
                          <AvatarFallback>{leaderboard[1].name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-white font-semibold text-lg">{leaderboard[1].name}</h3>
                        <p className="text-gray-300 text-2xl font-bold">{leaderboard[1].score} pts</p>
                        <p className="text-gray-400 text-sm">{leaderboard[1].xp} XP</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* 1st Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <Card className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-yellow-400/30 w-full transform scale-110">
                      <CardContent className="p-6 text-center">
                        <div className="mb-4">
                          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
                          <div className="text-4xl font-bold text-yellow-400">1st</div>
                        </div>
                        <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-yellow-400">
                          <AvatarImage src={leaderboard[0].avatar} alt={leaderboard[0].name} />
                          <AvatarFallback>{leaderboard[0].name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-white font-bold text-xl">{leaderboard[0].name}</h3>
                        <p className="text-yellow-400 text-3xl font-bold">{leaderboard[0].score} pts</p>
                        <p className="text-yellow-300 text-sm">{leaderboard[0].xp} XP</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* 3rd Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <Card className="bg-gradient-to-br from-orange-400/20 to-orange-600/20 border-orange-400/30 w-full">
                      <CardContent className="p-6 text-center">
                        <div className="mb-4">
                          <Medal className="w-12 h-12 text-orange-400 mx-auto mb-2" />
                          <div className="text-3xl font-bold text-orange-400">3rd</div>
                        </div>
                        <Avatar className="w-16 h-16 mx-auto mb-3">
                          <AvatarImage src={leaderboard[2].avatar} alt={leaderboard[2].name} />
                          <AvatarFallback>{leaderboard[2].name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-white font-semibold text-lg">{leaderboard[2].name}</h3>
                        <p className="text-orange-400 text-2xl font-bold">{leaderboard[2].score} pts</p>
                        <p className="text-orange-300 text-sm">{leaderboard[2].xp} XP</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Full Leaderboard */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
                  Complete Rankings
                </CardTitle>
                <CardDescription className="text-gray-300">
                  All participants ranked by score, XP, and completion time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <AnimatePresence>
                    {leaderboard.map((participant, index) => (
                      <motion.div
                        key={participant.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 ${
                          participant.id === user?.id 
                            ? 'bg-blue-500/20 border border-blue-500/30' 
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {/* Rank */}
                        <div className="flex-shrink-0">
                          {getRankIcon(participant.rank)}
                        </div>

                        {/* Avatar and Info */}
                        <div className="flex items-center space-x-3 flex-1">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={participant.avatar} alt={participant.name} />
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-white font-semibold">{participant.name}</h3>
                              {participant.id === user?.id && (
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            
                            {/* Badges */}
                            {participant.badges.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {participant.badges.slice(0, 3).map((badge) => (
                                  <Badge
                                    key={badge}
                                    className={`text-xs ${badgeColors[badge as keyof typeof badgeColors] || 'bg-gray-500/20 text-gray-400'}`}
                                  >
                                    <Star className="w-3 h-3 mr-1" />
                                    {badge}
                                  </Badge>
                                ))}
                                {participant.badges.length > 3 && (
                                  <Badge className="text-xs bg-gray-500/20 text-gray-400">
                                    +{participant.badges.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center space-x-6 text-right">
                          <div className="hidden sm:block">
                            <div className="text-white font-bold text-lg">{participant.score}</div>
                            <div className="text-gray-400 text-sm">Score</div>
                          </div>
                          
                          <div className="hidden md:block">
                            <div className="text-blue-400 font-semibold">{participant.xp}</div>
                            <div className="text-gray-400 text-sm">XP</div>
                          </div>
                          
                          <div className="hidden lg:block">
                            <div className="flex items-center text-gray-300">
                              <Clock className="w-4 h-4 mr-1" />
                              <span className="text-sm">{formatTime(participant.timeSpent)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};