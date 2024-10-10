import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  Button,
  Flex,
  Spacer,
  Divider,
  CloseButton,
  useToast,
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { useRouter } from "next/router";
import { useUserEdit } from "../../hooks/useUserEdit";
import axios from "axios"; // axios を使用
import supabase from "../../../backend/supabaseClient";

const UserSettings: React.FC = () => {
  const { isEditing, handleEdit, handleSave, userData, setUserData, resetEditing } = useUserEdit();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    setIsClient(true);

    // ユーザーデータを取得する
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (data.user) {
          setUserData({
            username: data.user.user_metadata?.username || "No username set",
            email: data.user.email || "",
            password: "******", // パスワードはマスクする
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchUserData();
  }, [setUserData, toast]);

  const saveUserData = async (updatedUserData: any) => {
    try {
      // Supabaseのユーザーセッションを取得し、トークンを取得
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session?.access_token) {
        throw new Error("No access token found");
      }

      // Supabaseのユーザー情報を更新するAPIリクエストをaxiosで行う
      const response = await axios.put("http://localhost:3001/api/update-user", updatedUserData, {
        headers: {
          Authorization: `Bearer ${session.access_token}`, // トークンを送信
        },
      });

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "User data updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setUserData({
          ...updatedUserData,
          password: "******", // パスワードは再度マスク
        });
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      toast({
        title: "Error",
        description: "Failed to update user data.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      resetEditing(); // 編集状態をリセット
    }
  };

  const handleClose = () => {
    router.push("/top");
  };

  if (!isClient) return null;

  return (
    <Box maxW="5xl" mx="auto" mt={10} p={8} boxShadow="lg" borderRadius="md" position="relative">
      <IconButton
        aria-label="Close"
        icon={<CloseButton />}
        onClick={handleClose}
        position="absolute"
        top={2}
        right={2}
        variant="ghost"
        size="lg"
      />
      <Box fontSize="2xl" fontWeight="bold" textAlign="center" mb={100}>
        Account Settings
      </Box>

      {/* User Name */}
      <FormControl mb={8}>
        <Flex alignItems="center">
          <FormLabel fontSize="lg" w="40%">User Name</FormLabel>
          {isEditing.username ? (
            <>
              <Input
                value={userData.username}
                onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                fontSize="lg"
                w="60%"
              />
              <Button onClick={() => saveUserData(userData)} ml={3} colorScheme="blue">
                Save
              </Button>
            </>
          ) : (
            <>
              <Box flex="1">{userData.username}</Box>
              <Spacer />
              <IconButton
                icon={<FaEdit />}
                aria-label="Edit username"
                onClick={() => handleEdit("username")}
              />
            </>
          )}
        </Flex>
        <Divider mt={2} />
      </FormControl>

      {/* Email */}
      <FormControl mb={8}>
        <Flex alignItems="center">
          <FormLabel fontSize="lg" w="40%">E-Mail</FormLabel>
          {isEditing.email ? (
            <>
              <Input
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                fontSize="lg"
                w="60%"
              />
              <Button onClick={() => saveUserData(userData)} ml={3} colorScheme="blue">
                Save
              </Button>
            </>
          ) : (
            <>
              <Box flex="1">{userData.email}</Box>
              <Spacer />
              <IconButton
                icon={<FaEdit />}
                aria-label="Edit email"
                onClick={() => handleEdit("email")}
              />
            </>
          )}
        </Flex>
        <Divider mt={2} />
      </FormControl>

      {/* Password */}
      <FormControl mb={8}>
        <Flex alignItems="center">
          <FormLabel fontSize="lg" w="40%">Password</FormLabel>
          {isEditing.password ? (
            <>
              <Input
                type="password"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                fontSize="lg"
                w="60%"
                placeholder="Enter new password"
              />
              <Button onClick={() => saveUserData(userData)} ml={3} colorScheme="blue">
                Save
              </Button>
            </>
          ) : (
            <>
              <Box flex="1">******</Box>
              <Spacer />
              <IconButton
                icon={<FaEdit />}
                aria-label="Edit password"
                onClick={() => handleEdit("password")}
              />
            </>
          )}
        </Flex>
        <Divider mt={2} />
      </FormControl>
    </Box>
  );
};

export default UserSettings;
