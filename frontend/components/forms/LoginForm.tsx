// frontend/components/forms/LoginForm.tsx
import React, { useState } from "react";
import { Box, Input, Button, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3001/api/login", { email, password });
      localStorage.setItem("token", response.data.accessToken);
      toast({
        title: "Login Successful",
        description: "You have successfully logged in.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/"); // ログイン後にトップページにリダイレクト
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid email or password. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box width="400px">
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        mb={4}
        size="lg"
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        mb={6}
        size="lg"
      />
      <Button onClick={handleLogin} width="100%" size="lg" colorScheme="teal">
        Log In
      </Button>
    </Box>
  );
};

export default LoginForm;
