const { Category } = require('../models');
const { Op } = require('sequelize');
const { UserFriendlyException } = require('../common/commonError');

const buildTree = (rows, parentId = null) =>
  rows
    .filter((x) => x.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((x) => ({
      id: x.id,
      name: x.name,
      description: x.description,
      parentId: x.parentId,
      sortOrder: x.sortOrder,
      active: x.active,
      children: buildTree(rows, x.id),
    }));

const getTree = async () => {
  const rows = await Category.findAll({ raw: true });
  return { isSuccess: true, data: buildTree(rows) };
};

const ensureUnique = async (name, parentId, excludeId) => {
  const exists = await Category.findOne({
    where: {
      name,
      parentId: parentId || null,
      ...(excludeId && { id: { [Op.ne]: excludeId } }),
    },
  });
  if (exists) throw new UserFriendlyException('Name must be unique within the same level');
};

const create = async (payload) => {
  await ensureUnique(payload.name, payload.parentId);
  const created = await Category.create({
    name: payload.name,
    description: payload.description,
    parentId: payload.parentId || null,
    sortOrder: payload.sortOrder ?? 0,
    active: payload.active ?? true,
  });
  return { isSuccess: true, data: created };
};

const update = async (id, payload) => {
  const existing = await Category.findByPk(id);
  if (!existing) throw new UserFriendlyException('Category not found');
  if (payload.parentId === id) throw new UserFriendlyException('Parent cannot be self');
  await ensureUnique(payload.name ?? existing.name, payload.parentId ?? existing.parentId, id);
  await existing.update({
    name: payload.name ?? existing.name,
    description: payload.description ?? existing.description,
    parentId: payload.parentId ?? existing.parentId,
    sortOrder: payload.sortOrder ?? existing.sortOrder,
    active: payload.active ?? existing.active,
  });
  return { isSuccess: true, data: existing };
};

const remove = async (id) => {
  const existing = await Category.findByPk(id);
  if (!existing) throw new UserFriendlyException('Category not found');
  const child = await Category.findOne({ where: { parentId: id } });
  if (child) throw new UserFriendlyException('Cannot delete category with children');
  await existing.destroy();
  return { isSuccess: true };
};

const toggleActive = async (id, active) => {
  const existing = await Category.findByPk(id);
  if (!existing) throw new UserFriendlyException('Category not found');
  await existing.update({ active });
  return { isSuccess: true };
};

const updateSort = async (id, sortOrder) => {
  const existing = await Category.findByPk(id);
  if (!existing) throw new UserFriendlyException('Category not found');
  await existing.update({ sortOrder });
  return { isSuccess: true };
};

module.exports = {
  getTree,
  create,
  update,
  remove,
  toggleActive,
  updateSort,
};
