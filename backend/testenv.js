import dotenv from "dotenv"
dotenv.config()
console.log("Email: |" + process.env.ADMIN_EMAIL + "|")
console.log("Pass: |" + process.env.ADMIN_PASSWORD + "|")
