import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, MessageCircle, CheckCircle, User, AtSign, Instagram, Linkedin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';

export const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7f978717/contact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Message sent successfully!');
        setFormData({ name: user?.name || '', email: user?.email || '', message: '' });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Error sending message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-8 pb-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto px-4"
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
            <CardContent className="p-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Message Sent!</h2>
              <p className="text-gray-300 text-lg mb-8">
                Thank you for reaching out! We'll get back to you soon.
              </p>
              
              <Button
                onClick={() => setIsSubmitted(false)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Send Another Message
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Mail className="w-16 h-16 text-blue-400" />
            </motion.div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Us</span>
          </h1>
          <p className="text-xl text-gray-300">
            Have questions about IEEE Day or the quiz? We'd love to hear from you!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageCircle className="w-6 h-6 mr-2 text-blue-400" />
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white flex items-center">
                      <AtSign className="w-4 h-4 mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us how we can help you..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 resize-none"
                    />
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* IEEE Day Info */}
            <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400/30">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">About IEEE Day</h3>
                <p className="text-gray-300 mb-4">
                  IEEE Day is celebrated annually on the first Tuesday in October to commemorate the first time in history when engineers worldwide and IEEE members gathered to share their technical ideas in 1884.
                </p>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• <strong>When:</strong> First Tuesday of October</p>
                  <p>• <strong>Theme:</strong> Advancing Technology for Humanity</p>
                  <p>• <strong>Purpose:</strong> Celebrate engineering achievements</p>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Information */}
            <Card className="bg-gradient-to-br from-green-500/20 to-teal-500/20 border-green-400/30">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Quiz Information</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>10 challenging questions about IEEE</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Real-time leaderboard rankings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>XP points and achievement badges</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>10-minute time limit</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Need Help?</h3>
                <p className="text-gray-300 mb-4">
                  If you're experiencing technical issues with the quiz or have questions about IEEE Day, don't hesitate to reach out!
                </p>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Technical support for quiz issues</p>
                  <p>• IEEE membership information</p>
                  <p>• Event coordination assistance</p>
                  <p>• General IEEE Day inquiries</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Follow Us Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Connect <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">With Us</span>
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  Follow our IEEE Student Branch for updates, events, and tech insights!
                </p>
                
                {/* Social Media Icons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
                  {/* Instagram */}
                  <motion.a
                    href="https://www.instagram.com/ieee_bvcoew?igsh=MWwwaWR2cThpcHl4dg=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-400/20 hover:border-pink-400/40 transition-all duration-300 w-48 sm:w-auto"
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"
                        animate={{ 
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <div className="relative p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full border border-pink-400/30 group-hover:border-pink-400/60 transition-all duration-300">
                        <Instagram className="w-8 h-8 text-pink-400 group-hover:text-pink-300 transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-white group-hover:text-pink-300 transition-colors duration-300">Instagram</h3>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">@ieee_studentbranch</p>
                    </div>
                  </motion.a>

                  {/* LinkedIn */}
                  <motion.a
                    href="https://www.linkedin.com/in/bvcoew-ieee-student-branch-092983383?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 w-48 sm:w-auto"
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"
                        animate={{ 
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1
                        }}
                      />
                      <div className="relative p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-400/30 group-hover:border-blue-400/60 transition-all duration-300">
                        <Linkedin className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">LinkedIn</h3>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">IEEE Student Branch</p>
                    </div>
                  </motion.a>
                </div>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-gray-400 text-sm mt-8"
                >
                  Stay connected for the latest IEEE updates, tech news, and community events!
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20"
              animate={{
                x: [0, Math.random() * 100, 0],
                y: [0, Math.random() * 100, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};