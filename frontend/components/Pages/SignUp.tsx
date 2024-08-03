import React, { useState } from 'react';
import { Box, Input, Button, useToast, Center, Text, Link } from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';

const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const { login } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      console.log("Signing up with", { name, email, password });
      const response = await axios.post('http://localhost:3001/api/signup', { name, email, password });
      console.log("Signup response:", response.data);
      login(response.data.token);
      router.push('/');  // トップページへリダイレクト
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Signup error:", error.response ? error.response.data : error.message);
        toast({
          title: 'Error',
          description: 'There was an error signing up. Please try again.',
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
        <Text fontSize="2xl" fontWeight="bold">Welcome!</Text>
        <Input
          placeholder="Please enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          my={4}
        />
        <Input
          placeholder="Please enter your e-mail address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          mb={4}
        />
        <Input
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          mb={4}
        />
        <Button onClick={handleSignUp} width="100%" colorScheme="blue">Sign Up</Button>
        <Text mt={4}>
          <Link color="blue.500" onClick={() => router.push('/login')}>Already have an account? Log in</Link>
        </Text>
      </Box>
    </Center>
  );
};

export default SignUp;
