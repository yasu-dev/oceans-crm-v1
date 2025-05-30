import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';
import { useApp } from '../../contexts/AppContext';
import LoadingScreen from '../ui/LoadingScreen';

const Layout = () => {
  const { isLoading } = useApp();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Layout;