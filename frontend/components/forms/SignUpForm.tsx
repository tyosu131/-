import React, { useState } from "react";
import { Box, Input, Button, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";

const SignUpForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      await axios.post("http://localhost:3001/api/signup", { name, email, password });
      toast({
        title: "Sign Up Successful",
        description: "You have successfully signed up.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.push("/top");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error signing up. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box width="400px">
      <Input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        mb={4}
        size="lg"
      />
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
      <Button onClick={handleSignUp} width="100%" size="lg" colorScheme="teal">
        Sign Up
      </Button>
    </Box>
  );
};

export default SignUpForm;
