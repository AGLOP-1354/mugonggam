'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { toPng } from 'html-to-image';

import { useUIStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/Button';

import ShareImageGenerator from './ShareImageGenerator';

const ShareModal = () => {
  const { isShareModalOpen, closeShareModal } = useUIStore();
  const { currentSession } = useChatStore();
  const { user } = useUserStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isShareModalOpen) return null;

  const handleGenerateImage = async () => {
    if (!containerRef.current) return;

    setIsGenerating(true);
    try {
      const dataUrl = await toPng(containerRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
      });
      setImageUrl(dataUrl);
      toast.success('이미지가 생성되었습니다!');
    } catch (error) {
      console.error('Image generation failed:', error);
      toast.error('이미지 생성에 실패했습니다');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.download = `mugonggam-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();

    if (user?.role === 'member') {
      useUserStore.getState().incrementShareCount();
    }

    toast.success('이미지가 다운로드되었습니다!');
  };

  const handleShare = async () => {
    if (!imageUrl) return;

    if (navigator.share) {
      try {
        const blob = await fetch(imageUrl).then((r) => r.blob());
        const file = new File([blob], 'mugonggam.png', { type: 'image/png' });
        await navigator.share({
          title: '무공감 - 무조건 공감해주는 AI',
          text: '무공감과 나눈 대화를 공유합니다!',
          files: [file],
        });

        // 회원이면 경험치 증가
        if (user?.role === 'member') {
          useUserStore.getState().incrementShareCount();
        }

        toast.success('공유되었습니다!');
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      handleCopyUrl();
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('https://mugonggam.app');
    setCopied(true);
    toast.success('링크가 복사되었습니다!');
    setTimeout(() => setCopied(false), 2000);
  };

  const messagesToShare = currentSession?.messages.slice(-6) || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 overflow-y-auto"
        onClick={closeShareModal}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9 }}
          className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              대화 공유하기
            </h2>
            <button
              onClick={closeShareModal}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="hidden">
            <div ref={containerRef}>
              <ShareImageGenerator
                messages={messagesToShare}
                nickname={user?.nickname || '게스트'}
              />
            </div>
          </div>

          {imageUrl && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">미리보기</p>
              <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
                <img
                  src={imageUrl}
                  alt="공유 이미지"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            {!imageUrl ? (
              <Button
                onClick={handleGenerateImage}
                disabled={isGenerating || messagesToShare.length === 0}
                size="lg"
                className="w-full"
              >
                {isGenerating ? '생성 중...' : '이미지 생성하기'}
              </Button>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    다운로드
                  </Button>
                  <Button
                    onClick={handleShare}
                    size="lg"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    공유하기
                  </Button>
                </div>
                <Button
                  onClick={handleCopyUrl}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      링크 복사 완료!
                    </>
                  ) : (
                    '무공감 링크 복사'
                  )}
                </Button>
              </>
            )}
          </div>

          <div className="mt-6 p-4 bg-orange-50 rounded-2xl">
            <p className="text-sm text-gray-700">
              💡 <strong>팁:</strong> 생성된 이미지를 인스타그램 스토리, 틱톡, 카카오톡 등에 공유해보세요!
            </p>
          </div>

          {messagesToShare.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              공유할 대화가 없습니다. 먼저 대화를 시작해보세요!
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareModal;
