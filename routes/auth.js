const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const requireAuth = require("../middlewares/requireAuth");
// const requireAuth = require("../middlewares/requireAuth");
// const upload = require("../configs/cloundinary-setup");

const salt = 10;

//LOGIN
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ message: "Invalid email. Try again" });
      }

      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid password. Try again" });
      }

      req.session.currentUser = user._id;
      req.session.currentUser_isAdmin = user.isAdmin;
      req.session.currentUser_isSeller = user.isSeller;
      res.redirect("/api/auth/isLoggedIn");
    })
    .catch(next);
});

//SIGNUP
router.post("/signup", (req, res, next) => {
  const { name, email, password } = req.body;
  // console.log(req.body)

  if (!email || !password) {
    res.status(400).json({ message: 'Provide username and password' });
    return;
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test((password))) {
    res.status(400).json({ message: 'Please make your password at least 6 characters, that contains at least one uppercase, one lowercase and one number digit in it, for security purposes.' });
    return;
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        return res.status(400).json({ message: "Email already taken" });
      }

      const hashedPassword = bcrypt.hashSync(password, salt);
      const newUser = { email, name, password: hashedPassword };

      User.create(newUser)
        .then((newUser) => {
          /* Login on signup */
          req.session.currentUser = newUser._id;
          req.session.currentUser_isAdmin = newUser.isAdmin;
          req.session.currentUser_isSeller = newUser.isSeller;
          res.redirect("/api/auth/isLoggedIn");
        })
        .catch(next);
    })
    .catch(next);
});



//CHECK is Logged in
router.get("/isLoggedIn", (req, res, next) => {
  // console.log(req.session.currentUser, "i am here")
  if (!req.session.currentUser)
    return res.status(401).json({ message: "Unauthorized" });

  User.findById(req.session.currentUser)
    .select("-password")
    .then((userDocument) => {
      res.status(200).json(userDocument);
    })
    .catch(next);
});

//LOGOUT
router.delete("/logout", (req, res, next) => {
  if (req.session.currentUser) {
    req.session.destroy((err) => {
      if (err) res.status(500).json(err);
      res.status(200).json({ message: "Successfully disconnected." });
    });
  } else {
    res.status(200).json({ message: "no session" });
  }
});

//PROFILE
router.get("/:id", requireAuth, (req, res, next) => {
  User.findById(req.params.id)
    .select("-password")
    .then(user => res.status(200).json(user))
    .catch(err => res.status(400).json({ message: "User not found" }))
})

router.patch("/profile", requireAuth, (req, res, next) => {
  if (req.body.password) {
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test((req.body.password))) {
      res.status(400).json({ message: 'Please make your password at least 6 characters, that contains at least one uppercase, one lowercase and one number digit in it, for security purposes.' });
      return;
    }

    req.body.password = bcrypt.hashSync(req.body.password, salt)
  }
  User.findByIdAndUpdate(req.session.currentUser, req.body, { new: true })
    .then(updatedUser => res.status(200).json(updatedUser))
    .catch(err => res.status(400).json({ message: "Failure to update profile" }))

})

module.exports = router;
