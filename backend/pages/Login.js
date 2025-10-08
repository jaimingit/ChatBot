const { UserModel } = require('../mongodb');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });  

    if (!user) {
      return res.status(404).json({ message: "User not found, please register" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    return res.status(200).json({ message: "Login Successful", token, userId: user._id });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
