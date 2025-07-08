  const express = require("express");
  const dotenv = require("dotenv");
  const cors = require("cors");
  const session = require("express-session");
  const MongoStore = require("connect-mongo");
  const cron = require("node-cron");
  const { handleCheckOutLogic } = require("./controllers/empAttendance");
  const User = require("./models/User");

  dotenv.config();
  //DB connection
  const dbConnection = require("./db/connection");
  dbConnection();

  const app = express();
  app.set("trust proxy", 1);

  app.use(express.json());
  app.use(
    cors({
      origin: ["https://salescrm-employee.onrender.com", "https://salescrm-salesadmin.onrender.com", "http://localhost:3000/"],
          credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  //Session store
  const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
    autoRemove: "interval",
    autoRemoveInterval: 10,
  });

  // Session middleware
  app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: true,// must be true in production
      sameSite: "None", 
      //  domain: ".onrender.com", 
    },
  })
);

    app.get("/", (req, res) => {
    res.send("Server is running");
  });

  // Routes
  const authRoutes = require("./routes/authRoutes");
  const attendanceRoutes = require("./routes/attendanceRoutes");
  const leadRoutes = require("./routes/leadRoutes");
  const dashboard = require("./routes/dashboard");
  const recentLogs = require("./routes/recentLogs");

  app.use("/api/auth", authRoutes);
  app.use("/api/leads", leadRoutes);

  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/recentlogs", recentLogs);
  app.use("/api", dashboard);

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server running at port: ${port}`);

    //Midnight auto-checkout
    cron.schedule(
      "0 0 * * *",
      async () => {
        console.log("Running midnight auto-checkout job at 12:00 AM IST");

        const users = await User.find({});
        for (let user of users) {
          try {

            await handleCheckOutLogic(user._id, user);
            user.isActive = false;
        await user.save();
            console.log(`Auto checked out: ${user.firstName}`);
          } catch (err) {
            console.error(`Error auto-checking out ${user.firstName}:`, err);
          }
        }

        //Clear sessions daily if needed
        try {
          await sessionStore.clear();
          console.log("All sessions cleared successfully.");
        } catch (error) {
          console.error("Error clearing sessions:", error);
        }
      },

      
      { timezone: "Asia/Kolkata" }
    );

  });