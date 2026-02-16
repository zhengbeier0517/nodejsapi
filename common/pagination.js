const { query } = require("express-validator");

/**
 * Parse pagination query parameters with sane defaults.
 * Ensures returned values are positive integers.
 */
const parsePagination = (input = {}, defaults = { page: 1, pageSize: 10 }) => {
  const parsePositiveInt = (value, fallback) => {
    const num = parseInt(value, 10);
    return Number.isInteger(num) && num > 0 ? num : fallback;
  };

  const page = parsePositiveInt(input.page, defaults.page);
  const pageSize = parsePositiveInt(input.pageSize, defaults.pageSize);

  return { page, pageSize };
};

/**
 * Validators for pagination query params.
 */
const paginationValidators = () => [
  query("page").optional().bail().isInt({ min: 1 }).withMessage("page must be int"),
  query("pageSize").optional().bail().isInt({ min: 1 }).withMessage("pageSize must be int"),
];

module.exports = { parsePagination, paginationValidators };
