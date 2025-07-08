
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const isAuthenticated = asyncHandler(async (req, res, next) => {
  // console.log("--- isAuthenticated middleware START ---");
  // console.log("req.session:", req.session);

  if (req.session && req.session.userId) {
    const findUser = await User.findById(req.session.userId).select(
      "-password"
    );
    if (!findUser) {
      req.session.destroy((err) => {
        if (err) console.error("Error destroying session", err);
      });
      res.status(401);
      throw new Error("Not authorized, user for session not found");
    }
    req.user = findUser;
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, no session found");
  }
});

module.exports = {
  isAuthenticated,
  // isAdmin
};
