// frontend/pages/top.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Top from '../components/pages/top';

const TopPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return <Top />;
};

export default TopPage;
