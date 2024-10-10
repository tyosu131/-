import { useState } from "react";
import debounce from "lodash.debounce";
import supabase from "../../backend/supabaseClient";
import { useToast } from "@chakra-ui/react";
import axios from "axios"; 

export const useUserEdit = () => {
  const [isEditing, setIsEditing] = useState({
    username: false,
    email: false,
    password: false,
  });

  // ユーザーデータを保持する状態
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "******", // 初期状態ではマスク
  });

  const toast = useToast();

  const handleEdit = (field: keyof typeof isEditing) => {
    setIsEditing((prevState) => ({ ...prevState, [field]: true }));
    if (field === "password") {
      setUserData((prevState) => ({ ...prevState, password: "" })); // パスワードを編集可能に
    }
  };

  const resetEditing = () => {
    setIsEditing({
      username: false,
      email: false,
      password: false,
    });
  };

  const handleSave = debounce(async (data: { username: string; email: string; password: string }) => {
    const { username, email, password } = data;
    try {
      // ユーザー情報の取得
      const { data: authData, error: userError } = await supabase.auth.getUser();
      if (userError || !authData?.user) {
        console.log("Failed to retrieve user information", userError);
        throw new Error("Failed to retrieve user information");
      }

      const userId = authData.user.id;

      if (!userId) {
        console.log("Failed to retrieve user ID");
        throw new Error("Failed to retrieve user ID");
      }

      // 現在の値と新しい値が同じかどうかを確認
      const isPasswordChanged = password && password !== "******" && password !== "";
      const isEmailChanged = email && email !== authData.user.email;
      const isUsernameChanged = username && username !== authData.user.user_metadata?.username;

      // 変更がない場合は処理をスキップ
      if (!isPasswordChanged && !isEmailChanged && !isUsernameChanged) {
        console.log("No changes detected");
        return;
      }

      // パスワードの更新（変更があった場合のみ）
      if (isPasswordChanged) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password,
        });
        if (passwordError) {
          if (passwordError.message.includes("New password should be different from the old password")) {
            console.log("Password is the same, skipping update.");
          } else {
            throw passwordError;
          }
        }
      }

      // メールアドレスの更新（変更があった場合のみ）
      if (isEmailChanged) {
        const { error: emailError } = await supabase.auth.updateUser({
          email,
        });
        if (emailError) {
          console.log("Email update error:", emailError);
          throw new Error("Failed to update email. Ensure the user session is valid.");
        }
      }

      // ユーザー名の更新（変更があった場合のみ）
      if (isUsernameChanged) {
        const { error: dbError } = await supabase
          .from("users")
          .update({ name: username, email }) // 名前（ユーザー名）とメールを更新
          .eq("uuid", userId);

        if (dbError) throw dbError;

        // Supabase Authのユーザー名も更新
        const { error: updateMetadataError } = await supabase.auth.updateUser({
          data: { username: username },
        });

        if (updateMetadataError) {
          throw updateMetadataError;
        }
      }

      // 成功時のトースト表示（実際に変更があった場合のみ）
      toast({
        title: "Saved!",
        description: `User data has been updated.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating user:", error.message);
        toast({
          title: "Error!",
          description: `Failed to update user data: ${error.message}`,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } else {
        console.error("Unexpected error:", error);
        toast({
          title: "Error!",
          description: `An unexpected error occurred.`,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } finally {
      resetEditing(); // 保存後に編集モードをリセット
    }
  }, 1000);

  return {
    isEditing,
    handleEdit,
    handleSave,
    userData,
    setUserData,
    resetEditing, // リセット関数をエクスポート
  };
};
