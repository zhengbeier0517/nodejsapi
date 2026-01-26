var express = require("express");
var router = express.Router();

const { body, param, query } = require("express-validator");
const { commonValidate } = require("../middleware/expressValidator");
const { authenticate } = require("../middleware/authentication");
const usercontroller = require("../controller/userController");

/**
 * @openapi
 * '/api/users/login':
 *  post:
 *     tags:
 *     - Users
 *     summary: User login (design only)
 *     description: Validate credentials and issue JWT (implementation pending).
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - userName
 *              - password
 *            properties:
 *              userName:
 *                type: string
 *              password:
 *                type: string
 *     responses:
 *      200:
 *        description: Login success (token returned)
 *      400:
 *        description: Bad Request
 *      401:
 *        description: Unauthorized
 *      501:
 *        description: Not implemented
 */
router.post(
  "/login",
  commonValidate([
    body("userName").notEmpty().withMessage("userName is required"),
    body("password").notEmpty().withMessage("password is required"),
  ]),
  usercontroller.loginAsync
);

/**
 * @openapi
 * '/api/users':
 *  post:
 *     tags:
 *     - Users
 *     summary: Create a new user (assign a role)
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - userName
 *              - password
 *              - email
 *              - firstName
 *              - lastName
 *            properties:
 *              userName:
 *                type: string
 *              password:
 *                type: string
 *              email:
 *                type: string
 *              firstName:
 *                type: string
 *              lastName:
 *                type: string
 *              address:
 *                type: string
 *              gender:
 *                type: string
 *                enum: [male, female, other]
 *              phone:
 *                type: string
 *              dob:
 *                type: string
 *                format: date
 *              avatar:
 *                type: string
 *              bio:
 *                type: string
 *              role:
 *                type: string
 *                enum: [super admin, admin, teacher, student]
 *     responses:
 *      200:
 *        description: Created
 *      400:
 *        description: Validation error
 */
router.post(
  "/",
  authenticate,
  commonValidate([
    body("userName").notEmpty().withMessage("userName is required"),
    body("password")
      .notEmpty()
      .isLength({ min: 8 })
      .withMessage("password must be at least 8 characters"),
    body("email").notEmpty().isEmail().withMessage("email invalid"),
    body("firstName").notEmpty().withMessage("firstName is required"),
    body("lastName").notEmpty().withMessage("lastName is required"),
    body("address").optional().isString().trim(),
    body("gender")
      .optional()
      .isString()
      .trim()
      .isIn(["male", "female", "other"])
      .withMessage("gender must be one of: male, female, other"),
    body("phone")
      .optional()
      .matches(/^[0-9]+$/)
      .withMessage("phone must be numeric"),
    body("dob").optional().isISO8601().toDate().withMessage("dob must be date"),
    body("avatar").optional().isString().trim(),
    body("bio").optional().isString().trim(),
    body("role")
      .optional()
      .isString()
      .trim()
      .isIn(["super admin", "admin", "teacher", "student"])
      .withMessage("invalid role"),
  ]),
  usercontroller.addUserAsync
);

/**
 * @openapi
 * '/api/users':
 *  get:
 *     tags:
 *     - Users
 *     summary: List users (basic profile fields)
 *     parameters:
 *      - name: page
 *        in: query
 *        required: false
 *        schema:
 *          type: integer
 *          minimum: 1
 *      - name: pageSize
 *        in: query
 *        required: false
 *        schema:
 *          type: integer
 *          minimum: 1
 *     responses:
 *      200:
 *        description: List returned
 */
router.get(
  "/",
  authenticate,
  commonValidate([
    query("page").optional().isInt({ min: 1 }).withMessage("page must be int"),
    query("pageSize")
      .optional()
      .isInt({ min: 1 })
      .withMessage("pageSize must be int"),
  ]),
  usercontroller.listAsync
);

/**
 * @openapi
 * '/api/users/{ids}':
 *  delete:
 *     tags:
 *     - Users
 *     summary: Delete users by id list
 *     parameters:
 *      - name: ids
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *          example: 1,2,3
 *        description: Comma separated user ids
 *     responses:
 *      200:
 *        description: Deleted
 *      404:
 *        description: Not Found
 */
router.delete(
  "/:ids",
  authenticate,
  commonValidate([
    param("ids")
      .notEmpty()
      .custom(value => {
        const arr = value.split(",");
        return arr.every(id => Number.isInteger(+id));
      })
      .withMessage("ids must be comma-separated integers"),
  ]),
  usercontroller.delUserAsync
);

/**
 * @openapi
 * '/api/users/{idOrName}':
 *  get:
 *     tags:
 *     - Users
 *     summary: Get user profile by id or userName
 *     parameters:
 *      - name: idOrName
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *     responses:
 *      200:
 *        description: User returned
 *      404:
 *        description: Not Found
 */
router.get(
  "/:idOrName",
  authenticate,
  commonValidate([
    param("idOrName").notEmpty().withMessage("idOrName is required"),
  ]),
  usercontroller.getProfileAsync
);

/**
 * @openapi
 * '/api/users/{id}':
 *  put:
 *     tags:
 *     - Users
 *     summary: Update basic user information (with optional password change)
 *     description: Update profile fields that exist on the User table.
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: integer
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            properties:
 *              userName:
 *                type: string
 *              email:
 *                type: string
 *              password:
 *                type: string
 *              firstName:
 *                type: string
 *              lastName:
 *                type: string
 *              phone:
 *                type: string
 *              address:
 *                type: string
 *              gender:
 *                type: string
 *                enum: [male, female, other]
 *              dob:
 *                type: string
 *                format: date
 *              avatar:
 *                type: string
 *              bio:
 *                type: string
 *     responses:
 *      200:
 *        description: Updated
 *      400:
 *        description: Validation error
 *      404:
 *        description: Not Found
 */
router.put(
  "/:id",
  authenticate,
  commonValidate([
    param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
    body("userName").optional().isString().trim(),
    body("email").optional().isEmail().withMessage("email invalid"),
    body("password")
      .optional()
      .isString()
      .isLength({ min: 8 })
      .withMessage("password must be at least 8 characters"),
    body("firstName").optional().isString().trim(),
    body("lastName").optional().isString().trim(),
    body("phone")
      .optional()
      .matches(/^[0-9]+$/)
      .withMessage("phone must be numeric"),
    body("address").optional().isString().trim(),
    body("gender")
      .optional()
      .isString()
      .trim()
      .isIn(["male", "female", "other"])
      .withMessage("gender must be one of: male, female, other"),
    body("dob")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("dob must be a valid date"),
    body("avatar").optional().isString().trim(),
    body("bio").optional().isString().trim(),
  ]),
  usercontroller.updateProfileAsync
);

module.exports = router;
