import * as bannerService from '../services/banner.service.js';
import { successResponse, createdResponse } from '../utils/response.js';

export const getActiveBanners = async (req, res, next) => {
  try {
    const banners = await bannerService.getActiveBanners(req.query.placement || 'home_hero');
    return successResponse(res, banners);
  } catch (error) {
    next(error);
  }
};

export const getAllBanners = async (req, res, next) => {
  try {
    const banners = await bannerService.getAllBanners();
    return successResponse(res, banners);
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const banner = await bannerService.createBanner(req.body);
    return createdResponse(res, banner);
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const banner = await bannerService.updateBanner(req.params.id, req.body);
    return successResponse(res, banner);
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    await bannerService.deleteBanner(req.params.id);
    return successResponse(res, { message: 'Banner deleted successfully' });
  } catch (error) {
    next(error);
  }
};
