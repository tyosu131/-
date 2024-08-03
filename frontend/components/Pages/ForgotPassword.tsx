// components/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import { Box, Input, Button, Center, Text, Link } from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handlePasswordReset = async () => {
    try {
      await axios.post('http://localhost:3001/api/forgot-password', { email });
      // パスワードリセット成功メッセージを表示するか、リダイレクトする
    } catch (error) {
      // エラーメッセージを表示する
    }
  };

  return (
    <Center height="100vh">
      <Box width="400px" textAlign="center">
        <Text fontSize="2xl" fontWeight="bold">Did you forget your password?</Text>
        <Text mb={4}>Please enter the email address you used to create your account</Text>
        <Input
          placeholder="Please enter your e-mail address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          mb={4}
        />
        <Button onClick={handlePasswordReset} width="100%" colorScheme="blue">Request a password reset</Button>
        <Text mt={4}>
          <Link color="blue.500" onClick={() => router.push('/login')}>Return to login</Link>
        </Text>
      </Box>
    </Center>
  );
};

export default ForgotPassword;
