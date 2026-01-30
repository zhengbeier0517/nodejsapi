var express = require("express");
var router = express.Router();

const { body, param, query } = require("express-validator");
const { commonValidate } = require("../middleware/expressValidator");
const { authenticate } = require("../middleware/authentication");
const userController = require("../controller/userController");

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
    body("userName").notEmpty().bail().withMessage("userName is required"),
    body("password")
      .notEmpty()
      .bail()
      .isLength({ min: 8 })
      .withMessage("password must be at least 8 characters"),
    body("email").notEmpty().bail().isEmail().withMessage("email invalid"),
    body("firstName").notEmpty().bail().withMessage("firstName is required"),
    body("lastName").notEmpty().bail().withMessage("lastName is required"),
    body("address").optional().bail().isString().trim(),
    body("gender")
      .optional()
      .bail()
      .isString()
      .trim()
      .isIn(["male", "female", "other"])
      .withMessage("gender must be one of: male, female, other"),
    body("phone")
      .optional()
      .bail()
      .matches(/^[0-9]+$/)
      .withMessage("phone must be numeric"),
    body("dob").optional().bail().isISO8601().toDate().withMessage("dob must be date"),
    body("avatar").optional().bail().isString().trim(),
    body("bio").optional().bail().isString().trim(),
    body("role")
      .optional()
      .bail()
      .isString()
      .trim()
      .isIn(["super admin", "admin", "teacher", "student"])
      .withMessage("invalid role"),
  ]),
  userController.addUserAsync
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
    query("page").optional().bail().isInt({ min: 1 }).withMessage("page must be int"),
    query("pageSize")
      .optional()
      .bail()
      .isInt({ min: 1 })
      .withMessage("pageSize must be int"),
  ]),
  userController.listAsync
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
      .bail()
      .custom(value => {
        const arr = value.split(",");
        return arr.every(id => Number.isInteger(+id));
      })
      .withMessage("ids must be comma-separated integers"),
  ]),
  userController.delUserAsync
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
    param("idOrName").notEmpty().bail().withMessage("idOrName is required"),
  ]),
  userController.getProfileAsync
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
    param("id").isInt({ min: 1 }).bail().withMessage("id must be a positive integer"),
    body("userName").optional().bail().isString().trim(),
    body("email").optional().bail().isEmail().withMessage("email invalid"),
    body("password")
      .optional()
      .bail()
      .isString()
      .isLength({ min: 8 })
      .withMessage("password must be at least 8 characters"),
    body("firstName").optional().bail().isString().trim(),
    body("lastName").optional().bail().isString().trim(),
    body("phone")
      .optional()
      .bail()
      .matches(/^[0-9]+$/)
      .withMessage("phone must be numeric"),
    body("address").optional().bail().isString().trim(),
    body("gender")
      .optional()
      .bail()
      .isString()
      .trim()
      .isIn(["male", "female", "other"])
      .withMessage("gender must be one of: male, female, other"),
    body("dob")
      .optional()
      .bail()
      .isISO8601()
      .toDate()
      .withMessage("dob must be a valid date"),
    body("avatar").optional().bail().isString().trim(),
    body("bio").optional().bail().isString().trim(),
  ]),
  userController.updateProfileAsync
);

module.exports = router;
