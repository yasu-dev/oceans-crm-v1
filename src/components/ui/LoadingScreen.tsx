import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="w-20 h-20 mb-6 relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-t-blue-700 border-r-blue-300 border-b-teal-500 border-l-transparent rounded-full"
          />
        </div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-medium text-gray-800"
        >
          脱毛サロン顧客管理
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-500 mt-2"
        >
          データを読み込んでいます...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;