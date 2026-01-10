const express = require("express");
const router = express.Router();

const { body } = require("express-validator");
const { commonValidate } = require("../middleware/expressValidator");

const authController = require("../controller/authController");

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - password
 *               - email
 *               - otp
 *             properties:
 *               userName:
 *                 type: string
 *                 default: johndoe
 *               password:
 *                 type: string
 *                 default: 12345678
 *               email:
 *                 type: string
 *                 default: johndoe@example.com
 *               otp:
 *                 type: string
 *                 default: 123456
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request
 *       409:
 *         description: Conflict
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/register",
  commonValidate([
    body("userName").notEmpty().withMessage("userName is required").bail().matches(/^[a-zA-Z0-9_]+$/).withMessage("userName can only contain letters, numbers, and underscores"),
    body("password").notEmpty().withMessage("password is required").bail().isLength({ min: 8 }).withMessage("password must be at least 8 characters"),
    body("email").notEmpty().withMessage("email is required").bail().isEmail().withMessage("email must be valid"),
    body("otp").notEmpty().withMessage("otp is required"),
  ]),
  authController.register
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *                 default: johndoe
 *               password:
 *                 type: string
 *                 default: 12345678
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/login",
  commonValidate([
    body("userName").notEmpty().withMessage("userName is required").matches(/^[a-zA-Z0-9_]+$/).withMessage("userName can only contain letters, numbers, and underscores"),
    body("password").notEmpty().withMessage("password is required").isLength({ min: 8 }).withMessage("password must be at least 8 characters"),
  ]),
  authController.login
);

module.exports = router;
