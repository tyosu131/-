// components/pages/Login.tsx
import React, { useState } from 'react';
import { Box, Input, Button, useToast, Center, Text, Link } from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/login', { email, password });
      login(response.data.token);
      router.push('/top');  // トップページへリダイレクト
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Login error:", error.response ? error.response.data : error.message);
        toast({
          title: 'Error',
          description: 'Invalid email or password. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        console.error("Unexpected error:", error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Center height="100vh">
      <Box width="400px" textAlign="center">
        <Text fontSize="2xl" fontWeight="bold">Login</Text>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          my={4}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          mb={4}
        />
        <Button onClick={handleLogin} width="100%" colorScheme="blue">Login</Button>
        <Text mt={4}>
          <Link color="blue.500" onClick={() => router.push('/signup')}>Do not have an account? Sign up</Link>
        </Text>
        <Text mt={4}>
          <Link color="blue.500" onClick={() => router.push('/forgot-password')}>Forgot your password?</Link>
        </Text>
      </Box>
    </Center>
  );
};

export default Login;
