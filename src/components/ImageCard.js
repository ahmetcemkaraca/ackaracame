import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ImageCard = ({ linkTo, imageUrl, title, ariaLabel, aspectRatio = 'aspect-[4/3]' }) => {
  return (
    <Link to={linkTo}>
      <motion.div
        className={`group relative flex ${aspectRatio} flex-col justify-end overflow-hidden rounded-xl p-4 transition-all duration-300 hover:shadow-2xl`}
        variants={itemVariants}
      >
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundImage: `url("${imageUrl || '/placeholder.jpg'}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10">
          <h3 className="text-white text-xl font-bold leading-tight">
            {title}
          </h3>
        </div>
      </motion.div>
    </Link>
  );
};

export default ImageCard;
