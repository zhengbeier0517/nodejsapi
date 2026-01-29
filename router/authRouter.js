const express = require("express");
const router = express.Router();

const { body, query } = require("express-validator");
const { commonValidate } = require("../middleware/expressValidator");
const { authenticate } = require("../middleware/authentication");

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
 *               - firstName
 *               - lastName
 *               - userName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 default: John
 *               lastName:
 *                 type: string
 *                 default: Doe
 *               userName:
 *                 type: string
 *                 default: johndoe
 *               email:
 *                 type: string
 *                 default: john.doe@example.com
 *               password:
 *                 type: string
 *                 default: 12345678
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
    body("firstName").notEmpty().withMessage("First name is required").bail().isLength({ max: 255 }).withMessage("First name must be at most 255 characters").bail().isAlpha().withMessage("First name can only contain letters"),
    body("lastName").notEmpty().withMessage("Last name is required").bail().isLength({ max: 255 }).withMessage("Last name must be at most 255 characters").bail().isAlpha().withMessage("Last name can only contain letters"),
    body("userName").notEmpty().withMessage("Username is required").bail().isLength({ max: 255 }).withMessage("Username must be at most 255 characters").bail().matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),
    body("email").notEmpty().withMessage("Email is required").bail().isLength({ max: 255 }).withMessage("Email must be at most 255 characters").bail().isEmail().withMessage("Email must be valid"),
    body("password").notEmpty().withMessage("Password is required").bail().isLength({ min: 8 }).withMessage("Password must be at least 8 characters").bail().isLength({ max: 255 }).withMessage("Password must be at most 255 characters"),
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
    body("userName").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ]),
  authController.login
);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 default: REFRESH_TOKEN
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/refresh",
  commonValidate([
    body("refreshToken").notEmpty().withMessage("Refresh token is required"),
  ]),
  authController.refresh
);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 default: REFRESH_TOKEN
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post(
  "/logout",
  authenticate,
  authController.logout
);

module.exports = router;
