import prisma from '../config/db.js';

export const getActiveBanners = async (placement = 'home_hero') => prisma.banner.findMany({
  where: { isActive: true, placement },
  orderBy: { sortOrder: 'asc' },
});

export const getAllBanners = async () => prisma.banner.findMany({
  orderBy: [{ placement: 'asc' }, { sortOrder: 'asc' }],
});

export const createBanner = async (data) => prisma.banner.create({
  data: {
    title: data.title || null,
    subtitle: data.subtitle || null,
    imageUrl: data.imageUrl,
    r2Key: data.r2Key || `banners/${Date.now()}.webp`,
    linkUrl: data.linkUrl || null,
    sortOrder: Number(data.sortOrder) || 0,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    placement: data.placement || 'home_hero',
  },
});

export const updateBanner = async (id, data) => {
  const updateData = { ...data };
  if (updateData.sortOrder !== undefined) updateData.sortOrder = Number(updateData.sortOrder);
  if (updateData.isActive !== undefined) updateData.isActive = Boolean(updateData.isActive);
  return prisma.banner.update({ where: { id }, data: updateData });
};

export const deleteBanner = async (id) => prisma.banner.delete({ where: { id } });

