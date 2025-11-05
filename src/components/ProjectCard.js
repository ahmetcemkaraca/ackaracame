import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Tag } from 'lucide-react';

const ProjectCard = ({ project }) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'mimari':
        return '🏗️';
      case 'yazilim':
        return '💻';
      default:
        return '📁';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'mimari':
        return 'bg-blue-100 text-blue-800';
      case 'yazilim':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      className="card group cursor-pointer"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/project/${project.id}`}>
        {/* Proje Görseli */}
        <div className="relative overflow-hidden">
          {project.images && project.images.length > 0 ? (
            <img
              src={project.images[0]}
              alt={project.title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <span className="text-6xl">{getCategoryIcon(project.category)}</span>
            </div>
          )}
          
          {/* Kategori Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(project.category)}`}>
              {project.category === 'mimari' ? 'Mimari' : 'Yazılım'}
            </span>
          </div>
          
          {/* Öne Çıkan Badge */}
          {project.featured && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                ⭐ Öne Çıkan
              </span>
            </div>
          )}
        </div>

        {/* Proje Bilgileri */}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 text-secondary-800 group-hover:text-primary-600 transition-colors duration-200">
            {project.title}
          </h3>
          
          <p className="text-secondary-600 mb-4 line-clamp-3">
            {project.description}
          </p>

          {/* Teknolojiler */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.slice(0, 3).map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-md"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-md">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Alt Bilgiler */}
          <div className="flex items-center justify-between text-sm text-secondary-500">
            <div className="flex items-center space-x-4">
              {project.year && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{project.year}</span>
                </div>
              )}
              
              {project.semester && (
                <div className="flex items-center space-x-1">
                  <Tag className="w-4 h-4" />
                  <span>{project.semester}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center text-primary-600 group-hover:text-primary-700 transition-colors duration-200">
              <span className="text-sm font-medium">Detayları Gör</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProjectCard;
