require("dotenv").config();
console.log(
  "DATABASE_URL starts with:",
  process.env.DATABASE_URL
    ? process.env.DATABASE_URL.substring(0, 10)
    : "undefined",
);
console.log(
  "DIRECT_URL starts with:",
  process.env.DIRECT_URL
    ? process.env.DIRECT_URL.substring(0, 10)
    : "undefined",
);
