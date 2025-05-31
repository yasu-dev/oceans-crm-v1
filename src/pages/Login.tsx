import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // モックデータでのログイン処理
    if (email === 'oceans.kimura@gmail.com' && password === 'password123') {
      await login({
        id: '1',
        name: '木村安貴',
        email: 'oceans.kimura@gmail.com',
        role: 'スタッフ',
      });
      navigate('/dashboard');
    } else {
      setError('メールアドレスまたはパスワードが正しくありません');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-secondary-200/20">
          <div className="text-center mb-8">
            <img 
              src="/oceans.svg" 
              alt="OCEANS CRM" 
              className="h-16 mx-auto mb-4"
            />
            <p className="text-primary-700 text-sm font-medium">顧客管理システム</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-colors bg-white/50"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-primary-200 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-colors bg-white/50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-700"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-900 text-white py-3 rounded-lg font-medium hover:bg-primary-800 transition-all duration-200 disabled:bg-primary-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>

            <div className="text-center text-sm text-primary-600 mt-4 bg-primary-50/50 rounded-lg p-4">
              <p className="font-medium mb-2">テスト用アカウント:</p>
              <p>メール: oceans.kimura@gmail.com</p>
              <p>パスワード: password123</p>
            </div>
          </form>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-white/60 text-xs">
            © {new Date().getFullYear()} OCEANS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 