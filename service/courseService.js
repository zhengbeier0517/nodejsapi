const { Course, User, Category, Role } = require('../models');
const { Op } = require('sequelize');
const { UserFriendlyException } = require('../common/commonError');

// Helper function to validate if user has teacher role
const validateTeacherRole = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          where: { name: 'teacher' },
          required: false,
        },
      ],
    });

    if (!user) {
      throw new UserFriendlyException('User not found');
    }

    const hasTeacherRole = user.roles && user.roles.length > 0;
    if (!hasTeacherRole) {
      throw new UserFriendlyException(
        'User must have Teacher role to be assigned as course teacher',
      );
    }

    return user;
  } catch (error) {
    if (error instanceof UserFriendlyException) {
      throw error;
    }
    throw new UserFriendlyException(
      `Failed to validate teacher: ${error.message}`,
    );
  }
};

const getList = async (page = 1, pageSize = 10, filters = {}) => {
  // Input validation: ensure page and pageSize are positive integers, cap pageSize at 100
  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(Math.max(1, parseInt(pageSize, 10) || 10), 100);

  const offset = (page - 1) * pageSize;
  const where = {};

  if (filters.title) {
    where.title = { [Op.like]: `%${filters.title}%` };
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters.teacherId) {
    where.teacherId = filters.teacherId;
  }
  // If active is strictly provided (true/false), use it. Default might be handled by caller or assumed true.
  if (filters.active !== undefined) {
    where.active = filters.active;
  }

  const { count, rows } = await Course.findAndCountAll({
    where,
    limit: pageSize,
    offset: offset,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
        required: false,
      },
      {
        model: User,
        as: 'teacher',
        attributes: ['id', 'userName', 'email', 'avatar'],
        required: false,
      },
    ],
  });

  return {
    isSuccess: true,
    data: {
      total: count,
      rows: rows,
      page: page,
      pageSize: pageSize,
    },
  };
};

const getOne = async (id) => {
  const course = await Course.findByPk(id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
        required: false,
      },
      {
        model: User,
        as: 'teacher',
        attributes: ['id', 'userName', 'email', 'avatar'],
        required: false,
      },
    ],
  });

  if (!course) {
    throw new UserFriendlyException('Course not found');
  }

  return { isSuccess: true, data: course };
};

const create = async (payload) => {
  // CRITICAL: Validate Teacher has Teacher role (per business requirements)
  if (payload.teacherId) {
    await validateTeacherRole(payload.teacherId);
  }

  // Validate Category Exists
  if (payload.categoryId) {
    const category = await Category.findByPk(payload.categoryId);
    if (!category) {
      throw new UserFriendlyException('Category not found');
    }
    // Check if category is active
    if (!category.active) {
      throw new UserFriendlyException(
        'Cannot assign course to inactive category',
      );
    }
  }

  const course = await Course.create({
    title: payload.title,
    description: payload.description,
    categoryId: payload.categoryId,
    teacherId: payload.teacherId,
    status: payload.status || 'draft',
    coverImage: payload.coverImage,
    active: true,
  });

  // Fetch the created course with associations for consistent response
  // Use required: false to allow null teachers/categories
  const createdCourse = await Course.findByPk(course.id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
        required: false,
      },
      {
        model: User,
        as: 'teacher',
        attributes: ['id', 'userName', 'email', 'avatar'],
        required: false,
      },
    ],
  });

  return { isSuccess: true, data: createdCourse };
};

const update = async (id, payload) => {
  const course = await Course.findByPk(id);
  if (!course) throw new UserFriendlyException('Course not found');

  // CRITICAL: Validate Teacher has Teacher role if teacherId is being changed
  if (payload.teacherId && payload.teacherId !== course.teacherId) {
    await validateTeacherRole(payload.teacherId);
  }

  // Validate Category Exists if categoryId is being changed
  if (payload.categoryId && payload.categoryId !== course.categoryId) {
    const category = await Category.findByPk(payload.categoryId);
    if (!category) {
      throw new UserFriendlyException('Category not found');
    }
    if (!category.active) {
      throw new UserFriendlyException(
        'Cannot assign course to inactive category',
      );
    }
  }

  await course.update({
    title: payload.title ?? course.title,
    description: payload.description ?? course.description,
    categoryId: payload.categoryId ?? course.categoryId,
    teacherId: payload.teacherId ?? course.teacherId,
    status: payload.status ?? course.status,
    active: payload.active ?? course.active,
    // Allow clearing cover via update (set to null), but actual file upload via dedicated endpoint
    coverImage:
      payload.coverImage !== undefined ? payload.coverImage : course.coverImage,
  });

  // Reload with associations for consistent response
  await course.reload({
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
        required: false,
      },
      {
        model: User,
        as: 'teacher',
        attributes: ['id', 'userName', 'email', 'avatar'],
        required: false,
      },
    ],
  });

  return { isSuccess: true, data: course };
};

const remove = async (id) => {
  const course = await Course.findByPk(id);
  if (!course) throw new UserFriendlyException('Course not found');

  await course.destroy();
  return { isSuccess: true };
};

const updateCover = async (id, filePath) => {
  const course = await Course.findByPk(id);
  if (!course) throw new UserFriendlyException('Course not found');

  await course.update({ coverImage: filePath });
  return { isSuccess: true, data: { coverImage: filePath } };
};

module.exports = {
  getList,
  getOne,
  create,
  update,
  remove,
  updateCover,
};
