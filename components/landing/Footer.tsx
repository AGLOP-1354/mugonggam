'use client';

import { motion } from 'framer-motion';
import { Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 서비스 소개 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-white mb-4">무공감</h3>
            <p className="text-sm text-gray-400">
              무조건 공감해주는 AI 챗봇
              <br />
              유병재님의 따뜻한 공감을 AI로 구현했습니다.
            </p>
          </motion.div>

          {/* 연락처 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <a
              href="mailto:ujh9208@gmail.com"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
              ujh9208@gmail.com
            </a>
          </motion.div>

          {/* 추가 정보 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold text-white mb-4">About</h4>
            <p className="text-sm text-gray-400">
              본 서비스는 팬메이드 프로젝트입니다.
              <br />
              문제가 되는 경우 연락 주시면
              <br />
              즉시 조치하겠습니다.
            </p>
          </motion.div>
        </div>

        {/* 하단 저작권 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-8 border-t border-gray-800 text-center"
        >
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-orange-500" />
            {currentYear} 무공감. Made with love for 유병재님
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
