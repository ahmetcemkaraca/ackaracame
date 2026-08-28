import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

interface RevealProps {
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'header' | 'li' | 'article';
}

const variants = {
  div: motion.div,
  section: motion.section,
  header: motion.header,
  li: motion.li,
  article: motion.article,
} as const;

export const Reveal = ({ children, delay = 0, className, as = 'div' }: PropsWithChildren<RevealProps>) => {
  const Component = variants[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
};
