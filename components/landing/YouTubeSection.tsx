'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

// 샘플 영상 데이터 - 나중에 실제 유병재님 영상으로 변경 가능
const SAMPLE_VIDEOS = [
  {
    id: 'cqIZU2iQym4?si=N6iJbnOGT6eM7ja8',
    title: '[무공해] 샤이니 T랑, 아니 키랑.. 무조건 공감합니다',
    description: '무공해 레전드 영상 #1'
  },
  {
    id: 'dcJUPNvpnYI?si=cAwU3JJFKO7jWFUI',
    title: '[무공해] 해도해도 너무하지만 공감합니다',
    description: '무공해 레전드 영상 #2'
  },
  {
    id: 'UcqZ7-UP7qU?si=FaL97S21j54s4APS',
    title: '[무공해] 왜 그런진 몰라도 공감합니다',
    description: '무공해 레전드 영상 #3'
  }
];

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@KoreanCryingGuy';

const YouTubeSection = () => {
  return (
    <section className="py-16 px-6 bg-gradient-to-b from-white to-orange-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            유병재님의 유튜브 채널
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            더 많은 웃음과 공감이 궁금하다면?
          </p>

          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            채널 방문하기
            <ExternalLink className="w-5 h-5" />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_VIDEOS.map((video, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative pt-[56.25%]">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2">{video.title}</h3>
                <p className="text-sm text-gray-600">{video.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 text-sm text-gray-500 space-y-2"
        >
          <p>본 서비스는 팬메이드 프로젝트입니다. 문제가 되는 경우 연락 주시면 즉시 조치하겠습니다.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default YouTubeSection;
