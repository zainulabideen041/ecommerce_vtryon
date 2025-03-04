const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

// REGISTER USER CONTROLLER
const register = async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message: "User already registered with this email address",
      });

    const hashPass = await bcrypt.hash(password, 12);

    const newUser = new User({ userName, email, password: hashPass });
    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
    });
  }
};

// LOGIN USER CONTROLLER
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.json({
        success: false,
        message: "Invalid Credentials",
      });

    const matchPass = await bcrypt.compare(password, user.password);

    if (!matchPass)
      return res.json({
        success: false,
        message: "Invalid Credentials",
      });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
    });
  }
};

// AUTH CHECK MIDDLEWARE
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded_user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded_user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: "Unauthorized User" });
  }
};

//LOGOUT USER CONTROLLER
const logout = async (req, res) => {
  res
    .clearCookie("token")
    .json({ success: true, message: "Logged out Successfully" });
};

module.exports = { register, login, logout, authMiddleware };
