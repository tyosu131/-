import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../backend/supabaseClient';

export const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true); // 認証されている
      } else {
        router.push('/login'); // 認証されていない場合、ログインページにリダイレクト
      }
    };

    checkUser();
  }, [router]);

  return isAuthenticated;
};
