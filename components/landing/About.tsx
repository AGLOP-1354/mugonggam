'use client';

import { motion } from 'framer-motion';

const About = () => {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            무공해에서 시작된 이야기
          </h2>

          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 md:p-12 shadow-lg">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
              이 서비스는 코미디언 <span className="font-bold text-orange-600">유병재님</span>의
              &ldquo;<span className="font-bold text-orange-600">무공해(무조건 공감해)</span>&rdquo; 콘셉트를 기반으로 만들어졌습니다.
            </p>

            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
              때로는 조언보다 공감이 필요할 때가 있습니다.
              당신의 하루, 당신의 고민, 당신의 이야기를
              <span className="font-semibold"> 무조건 공감하고 편들어주는 AI 친구</span>가 여기 있습니다.
            </p>

            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
              <span className="text-2xl">💪</span>
              <span className="font-bold text-gray-800">무적권 공감!</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
