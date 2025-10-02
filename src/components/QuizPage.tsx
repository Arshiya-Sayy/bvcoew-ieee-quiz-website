import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Zap, User, CheckCircle, XCircle, Trophy, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '../App';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface QuizPageProps {
  setCurrentPage: (page: string) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  points: number;
}

interface Answer {
  questionId: number;
  selectedOption: number;
}

export const QuizPage: React.FC<QuizPageProps> = ({ setCurrentPage }) => {
  const { user, session, updateUser } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [energy, setEnergy] = useState(100);

  // Fetch questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7f978717/quiz/questions`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const questionsData = await response.json();
          setQuestions(questionsData);
          setQuizStartTime(Date.now());
        } else {
          toast.error('Failed to load quiz questions');
          setCurrentPage('home');
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast.error('Error loading quiz');
        setCurrentPage('home');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [session, setCurrentPage]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmitQuiz();
    }
  }, [timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) {
      toast.error('Please select an answer');
      return;
    }

    // Add answer to answers array
    const newAnswer: Answer = {
      questionId: questions[currentQuestionIndex].id,
      selectedOption
    };
    setAnswers(prev => [...prev, newAnswer]);

    // Reduce energy for wrong answers (we don't know if it's correct yet, but add visual feedback)
    setEnergy(prev => Math.max(prev - 5, 0));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    
    try {
      const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
      const finalAnswers = selectedOption !== null ? [
        ...answers,
        { questionId: questions[currentQuestionIndex].id, selectedOption }
      ] : answers;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7f978717/quiz/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: finalAnswers,
          timeSpent
        })
      });

      if (response.ok) {
        const resultData = await response.json();
        setResults(resultData);
        setShowResults(true);
        updateUser(resultData.user);
        toast.success('Quiz completed successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Error submitting quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="min-h-screen pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-8">
              <CardContent>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="inline-block mb-6"
                >
                  <Trophy className="w-20 h-20 text-yellow-400" />
                </motion.div>

                <h1 className="text-4xl font-bold text-white mb-4">Quiz Complete!</h1>
                <p className="text-xl text-gray-300 mb-8">Great job on completing the IEEE Day challenge!</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg"
                  >
                    <div className="text-3xl font-bold text-green-400 mb-2">{results.score}</div>
                    <div className="text-white font-semibold">Final Score</div>
                    <div className="text-sm text-gray-300">{results.correctAnswers}/{results.totalQuestions} correct</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg"
                  >
                    <div className="text-3xl font-bold text-blue-400 mb-2">+{results.xpEarned}</div>
                    <div className="text-white font-semibold">XP Earned</div>
                    <div className="text-sm text-gray-300">Total XP: {results.user.xp}</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg"
                  >
                    <div className="text-3xl font-bold text-purple-400 mb-2">{results.earnedBadges.length}</div>
                    <div className="text-white font-semibold">New Badges</div>
                    <div className="text-sm text-gray-300">Achievements unlocked</div>
                  </motion.div>
                </div>

                {results.earnedBadges.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8"
                  >
                    <h3 className="text-xl font-semibold text-white mb-4">New Badges Earned!</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {results.earnedBadges.map((badge: string, index: number) => (
                        <motion.div
                          key={badge}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <Badge className="bg-yellow-500/20 text-yellow-400 px-4 py-2 text-lg border border-yellow-400/30">
                            <Star className="w-4 h-4 mr-2" />
                            {badge}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <Button
                    onClick={() => setCurrentPage('leaderboard')}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mr-4"
                  >
                    View Leaderboard
                  </Button>
                  <Button
                    onClick={() => setCurrentPage('home')}
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-blue-600 text-white">
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-white font-semibold">{user?.name}</div>
                <div className="text-sm text-gray-300">XP: {user?.xp}</div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Energy Bar */}
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                    initial={{ width: '100%' }}
                    animate={{ width: `${energy}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-sm text-yellow-400 font-semibold">{energy}%</span>
              </div>

              {/* Timer */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                timeLeft < 60 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-semibold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {currentQuestion?.points} Points
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {currentQuestion?.question}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion?.options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedOption === index
                          ? 'border-blue-500 bg-blue-500/20 text-white'
                          : 'border-white/30 bg-white/5 text-gray-300 hover:border-white/50 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedOption === index
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-400'
                        }`}>
                          {selectedOption === index && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleNextQuestion}
            disabled={selectedOption === null || submitting}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 px-8"
          >
            {submitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
            ) : currentQuestionIndex === questions.length - 1 ? (
              'Submit Quiz'
            ) : (
              'Next Question'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};