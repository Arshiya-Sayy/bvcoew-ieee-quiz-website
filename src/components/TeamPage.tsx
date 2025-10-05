import React from 'react';
import { motion } from 'motion/react';
import { Users, Code, PenTool, Zap, Star, Github, Linkedin } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  description: string;
  skills: string[];
  social?: {
    github?: string;
    linkedin?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Arshiya Nissar Sayyed',
    role: 'Website Developer',
    photo: '/AS.jpeg',
    description: 'Full-stack developer passionate about creating engaging web experiences',
    skills: ['React', 'TypeScript', 'Node.js', 'Supabase']
  },
  {
    id: '2',
    name: 'Swarali Gosavi',
    role: 'Quiz Question Setter',
    photo: '/SG.jpeg',
    description: 'IEEE expert responsible for crafting challenging and educational quiz questions',
    skills: ['IEEE Standards', 'Content Creation', 'Technical Writing']
  },
  {
    id: '3',
    name: 'Preeti Birajdar',
    role: 'Quiz Question Setter',
    photo: '/PB.jpeg',
    description: 'Creative designer focused on user experience and visual aesthetics',
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping']
  },
  {
    id: '4',
    name: 'Ameya Nimkar',
    role: 'Quiz Question Setter',
    photo: '/AN.jpeg',
    description: 'Coordinating team efforts and ensuring project success',
    skills: ['Project Planning', 'Team Leadership', 'Quality Assurance']
  }
];

export const TeamPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    },
    hover: { 
      y: -10,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">Our Team</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Meet the passionate individuals behind the IEEE Day 2025 Quiz Platform
          </p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.id}
              variants={cardVariants}
              whileHover="hover"
              className="group"
            >
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:border-blue-400/50 transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  {/* Profile Photo */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-blue-400/30 group-hover:ring-blue-400/60 transition-all duration-300">
                      <ImageWithFallback
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Name and Role */}
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {member.name}
                  </h3>
                  <div className="mb-4">
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-500/20 text-blue-300 border-blue-400/30"
                    >
                      {member.role}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {member.description}
                  </p>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {member.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-white/5 text-gray-300 border-white/20"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Social Links (if available) */}
                  {member.social && (
                    <div className="flex justify-center space-x-2">
                      {member.social.github && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 text-gray-400 hover:text-white"
                        >
                          <Github className="w-4 h-4" />
                        </Button>
                      )}
                      {member.social.linkedin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 text-gray-400 hover:text-white"
                        >
                          <Linkedin className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-white/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-3">
                Ready to Join the Challenge?
              </h3>
              <p className="text-gray-300 mb-6">
                Test your IEEE knowledge and compete with fellow engineers from around the world!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  Take Quiz
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  View Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};