module.exports = {
  // ไม่ต้องใช้ root: true ใน Flat Config (แต่เราใช้ Legacy Config อยู่)
  env: {
    es6: true, // หรือ es2021 ถ้ารัน Node version ใหม่ๆ
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  parserOptions: {
    // ระบุเวอร์ชัน ECMAScript ที่ใหม่ขึ้น
    ecmaVersion: 2021, // ลองใช้ 2021 หรือ 2022
    sourceType: "script", // บอกว่าเป็นสคริปต์ Node.js (ไม่ใช่ module)
  },
  rules: {
    // ปิด Rules ที่จุกจิกเกินไป หรือขัดกับสไตล์ทั่วไป
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
    "max-len": ["warn", { code: 120 }], // อนุญาตให้ยาวขึ้นเป็น 120 ตัวอักษร (เตือนแทน Error)
    "object-curly-spacing": ["error", "always"], // บังคับให้มีเว้นวรรคใน {} เช่น { uid, disable }
    indent: ["error", 2], // บังคับย่อหน้า 2 spaces
    quotes: ["error", "double"], // บังคับใช้ double quotes

    // เพิ่ม Rules อื่นๆ ถ้าต้องการ
    "no-trailing-spaces": "error",
    "eol-last": ["error", "always"],
    "quote-props": ["error", "as-needed"],
  },
  // เพิ่ม globals เพื่อให้ ESLint รู้จักตัวแปรของ Node.js
  globals: {
    process: "readonly",
    exports: "writable",
    require: "readonly",
    module: "readonly",
    console: "readonly", // ทำให้รู้จัก console
  },
};
