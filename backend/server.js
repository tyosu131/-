require("dotenv").config({ path: "./.env.local" });
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const supabase = require("./supabaseClient");
const { validateEmail, generateAccessToken, generateRefreshToken } = require('./authUtils');
const authenticate = require('./authMiddleware');

const server = express();

// CORS設定
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

server.use(cors(corsOptions));
server.use(express.json());
server.use(cookieParser());

// JWT_SECRETの確認
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set. Please set it in your .env.local file.");
  process.exit(1);
}

// エラーハンドリング用のミドルウェアを設定（エラーを詳細にログ出力）
server.use((err, req, res, next) => {
  console.error("Unhandled error occurred:", err.stack); // スタックトレースをログ出力
  res.status(500).json({ error: "Internal server error", details: err.message });
});

// ユーザー登録API
server.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    console.log("Signup process started for:", email);
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("uuid")
      .eq("email", email)
      .single();

    if (checkError || existingUser) {
      console.log("Email already exists or an error occurred:", checkError || existingUser);
      return res.status(409).json({ error: "Email already exists" });
    }

    const { data, error } = await supabase
      .from("users")
      .insert([{ name: username, email, password }])
      .select();

    if (error) throw error;

    if (!data || !data[0]) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    const token = generateAccessToken(data[0]);
    const refreshToken = generateRefreshToken(data[0]);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ token });
    console.log("User created successfully:", data[0].id);
  } catch (error) {
    console.error("Failed to create user:", error.stack);
    res.status(500).json({ error: "Failed to create user", details: error.message });
  }
});

// ユーザー情報更新API
server.put("/api/update-user", authenticate, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    console.log("Attempting to update user...");
    
    // authenticateミドルウェアでJWTから取得されたユーザーIDを利用
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID not found" });
    }

    const updates = { name: username };
    if (password && password !== "******") {
      updates.password = password;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("uuid", userId);

    if (updateError) throw updateError;

    const authUpdates = {};
    if (email) authUpdates.email = email;
    if (password && password !== "******") authUpdates.password = password;

    const { error: authError } = await supabase.auth.updateUser(authUpdates);

    if (authError) throw authError;

    res.status(200).json({ message: "User updated successfully" });
    console.log("User updated successfully:", userId);
  } catch (error) {
    console.error("Failed to update user:", error.stack);
    res.status(500).json({ error: "Failed to update user", details: error.message });
  }
});

// ログインAPI
server.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    console.log("Login attempt for:", email);
    const { session, error } = await supabase.auth.signIn({
      email,
      password,
    });

    if (error || !session || !session.user) {
      return res.status(500).json({
        error: "Failed to login: " + (error?.message || "Unknown error"),
      });
    }

    const token = generateAccessToken(session.user);
    const refreshToken = generateRefreshToken(session.user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ token, user: session.user });
    console.log("User logged in successfully:", session.user.id);
  } catch (error) {
    console.error("Login failed:", error.stack);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

// トークンリフレッシュAPI
server.post("/api/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(403).json({ error: "Refresh token not provided" });
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Invalid refresh token:", err.stack);
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const newToken = generateAccessToken(user);
    res.status(200).json({ token: newToken });
    console.log("Token refreshed successfully for user:", user.id);
  });
});

// ノート取得API
server.get("/api/notes/:date", authenticate, async (req, res) => {
  const { date } = req.params;

  try {
    console.log("Fetching notes for date:", date);
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("uuid")
      .eq("uuid", req.user.id)
      .single();

    if (userError || !userRecord) {
      throw new Error(`Failed to find user with UUID: ${req.user.id}`);
    }

    const userId = userRecord.uuid;

    if (!isValidDate(date)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("date", date)
      .eq("userid", userId);

    if (error) throw new Error(`Supabase error: ${error.message}`);

    res.json(data || []);
    console.log("Notes fetched successfully for user:", userId);
  } catch (error) {
    console.error("Failed to fetch note:", error.stack);
    res.status(500).json({ error: "Failed to fetch note", details: error.message });
  }
});

// ノート保存API
server.post("/api/notes/:date", authenticate, async (req, res) => {
  const { date } = req.params;
  const { note, exercises } = req.body;

  if (!isValidDate(date)) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  try {
    console.log("Saving note for date:", date);
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("uuid")
      .eq("uuid", req.user.id)
      .single();

    if (userError || !userRecord) {
      throw new Error(`Failed to find user with UUID: ${req.user.id}`);
    }

    const userId = userRecord.uuid;

    const exercisesToSave = exercises.map(exercise => ({
      exercise: exercise.exercise || "",
      sets: exercise.sets.map(set => ({
        weight: set.weight || "",
        reps: set.reps || "",
        rest: set.rest || ""
      }))
    }));

    const { error } = await supabase
      .from("notes")
      .upsert([{
        date,
        note,
        exercises: JSON.stringify(exercisesToSave),
        userid: userId,
      }]);

    if (error) throw new Error(`Supabase error: ${error.message}`);

    res.status(200).json({ message: "Note saved successfully" });
    console.log("Note saved successfully for user:", userId);
  } catch (error) {
    console.error("Failed to save note:", error.stack);
    res.status(500).json({ error: "Failed to save note", details: error.message });
  }
});

// 日付の検証関数
const isValidDate = (date) => {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  return re.test(date);
};

const port = process.env.PORT || 3001;
server.listen(port, (err) => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${port}`);
});
