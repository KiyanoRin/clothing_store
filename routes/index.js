require("dotenv").config();
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { Account, User } = require("../models/db");
const jwt = require("jsonwebtoken");
const saltRound = 10;
const JWT_SECRET = process.env.JWT_SECRET;
router.get("/login", (req, res) => {
  res.render("login");
});

// Login
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await User.findOne({
      where: { phone },
      include: [{ model: Account }],
    });
    try {
      const result = await bcrypt.compare(password, user.account.password);
      if (result) {
        const { name, account } = user;
        const { role, accountId } = account;
        const token = await jwt.sign(
          { accountId, name, phone, role },
          JWT_SECRET
        );
        res.cookie("token", token, {
          maxAge: 5000,
          expires: new Date(2023, 08, 12),
          secure: false,
          httpOnly: true,
          sameSite: "strict",
        });
        res.status(200).json(token);
      } else res.json("Invalid phone or password");
    } catch (error) {
      res.json(error);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Register
router.post("/register", async (req, res) => {
  const { name, phone, password, email, address, role } = req.body;
  let vaitro = role || "potential customer";
  try {
    console.log(name, phone, password, email, address);
    const hashedPassword = await bcrypt.hash(password, saltRound);
    const newRecord = {
      name: name,
      phone: phone,
      account: {
        password: hashedPassword,
        email: email,
        address: address,
        role: vaitro,
      },
    };
    console.log(hashedPassword);
    await User.create(newRecord, {
      include: [Account],
    });
    const user = await User.findOne({
      where: { phone: phone },
      include: [{ model: Account }],
    });
    const { account } = user;
    const { accountId } = account;
    const token = await jwt.sign({ accountId, name, phone, role }, JWT_SECRET);
    res.cookie("token", token, {
      maxAge: 5000,
      expires: new Date(2023, 08, 12),
      secure: false,
      httpOnly: true,
      // sameSite: "strict",
    });
    res.status(200).json(token);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

module.exports = router;
