'use client';

import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl">
        🤗
      </div>

      <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                y: [0, -8, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
