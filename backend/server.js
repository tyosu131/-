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

// ユーザー登録API
server.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("uuid")
      .eq("email", email)
      .single();

    if (existingUser) {
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
  } catch (error) {
    console.error("Failed to create user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// ユーザー情報更新API
server.put("/api/update-user", authenticate, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // セッションからユーザー情報の取得
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      return res.status(401).json({ error: "Session is missing or invalid" });
    }

    const accessToken = sessionData.session.access_token;

    // Supabaseからユーザー情報の取得
    const { data: user, error: getUserError } = await supabase.auth.getUser(accessToken);

    if (getUserError || !user) {
      return res.status(500).json({ error: "Failed to retrieve user metadata ID" });
    }

    // ユーザー名とパスワードの更新
    const updates = { name: username };
    if (password && password !== "******") {
      updates.password = password;
    }

    // DB側のユーザーデータ更新
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("email", email);

    if (error) throw error;

    // Supabase Authでメールアドレスやパスワードの更新
    const authUpdates = {};
    if (email) authUpdates.email = email;
    if (password && password !== "******") authUpdates.password = password;

    const { error: authError } = await supabase.auth.updateUser(authUpdates, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (authError) throw authError;

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Failed to update user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// ログインAPI
server.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
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
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Login failed" });
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
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const newToken = generateAccessToken(user);
    res.status(200).json({ token: newToken });
  });
});

// ノート取得API
server.get("/api/notes/:date", authenticate, async (req, res) => {
  const { date } = req.params;

  try {
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
  } catch (error) {
    console.error("Failed to fetch note:", error);
    res.status(500).json({ error: "Failed to fetch note" });
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
  } catch (error) {
    console.error("Failed to save note:", error);
    res.status(500).json({ error: "Failed to save note" });
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
