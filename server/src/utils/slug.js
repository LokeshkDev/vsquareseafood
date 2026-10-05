import slugify from 'slugify';

export const generateSlug = (name) => {
  return slugify(name, {
    lower: true,
    strict: true
  });
};

export const generateUniqueSlug = async (name, checkExistsFn) => {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 2;

  while (await checkExistsFn(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
