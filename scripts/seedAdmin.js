/**
 * One-time script to create an admin user for login.
 * Admin is the user whose email matches ADMIN_EMAIL in .env.
 * Run: node scripts/seedAdmin.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");

const ATLASDB_URL = process.env.ATLASDB_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";

async function seedAdmin() {
    if (!ADMIN_EMAIL) {
        console.log("Set ADMIN_EMAIL in .env and run again.");
        process.exit(1);
    }
    await mongoose.connect(ATLASDB_URL);
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
        console.log("Admin user already exists.");
        console.log("Login with: Username =", existing.username, ", Password = (the one you set when you signed up)");
        await mongoose.disconnect();
        process.exit(0);
    }
    const user = new User({ username: ADMIN_USERNAME, email: ADMIN_EMAIL });
    await User.register(user, ADMIN_PASSWORD);
    console.log("Admin user created.");
    console.log("Username:", ADMIN_USERNAME);
    console.log("Password:", ADMIN_PASSWORD);
    console.log("Email:", ADMIN_EMAIL);
    console.log("You can change ADMIN_USERNAME and ADMIN_PASSWORD in .env and run this script again only if you delete this user first.");
    await mongoose.disconnect();
    process.exit(0);
}

seedAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
});
