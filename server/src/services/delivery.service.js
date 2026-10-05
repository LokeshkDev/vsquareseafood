import prisma from '../config/db.js';

export const calculateDeliveryCharge = async ({ amount, pincode, location }) => {
  const rules = await prisma.deliveryRule.findMany({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
  });

  if (rules.length === 0) {
    if (amount >= 999) return { charge: 0, ruleName: 'Default Free Delivery (>₹999)' };
    return { charge: 49, ruleName: 'Standard Flat Delivery' };
  }

  for (const rule of rules) {
    const min = rule.minAmount ? Number(rule.minAmount) : 0;
    const max = rule.maxAmount ? Number(rule.maxAmount) : Infinity;
    const charge = Number(rule.charge);

    switch (rule.strategy) {
      case 'PINCODE':
        if (pincode && rule.pincode === pincode) return { charge, ruleName: rule.name };
        break;
      case 'PRICE':
        if (amount >= min && amount <= max) return { charge, ruleName: rule.name };
        break;
      case 'FREE_ABOVE_AMOUNT':
        if (amount >= min) return { charge: 0, ruleName: rule.name };
        break;
      case 'LOCATION':
        if (location && rule.location && location.toLowerCase().includes(rule.location.toLowerCase())) {
          return { charge, ruleName: rule.name };
        }
        break;
      case 'FLAT':
        return { charge, ruleName: rule.name };
      default:
        break;
    }
  }

  return { charge: 49, ruleName: 'Default Delivery' };
};

export const getDeliveryRules = async () => prisma.deliveryRule.findMany({ orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }] });
export const createDeliveryRule = async (data) => prisma.deliveryRule.create({ data });
export const updateDeliveryRule = async (id, data) => prisma.deliveryRule.update({ where: { id }, data });
export const deleteDeliveryRule = async (id) => prisma.deliveryRule.delete({ where: { id } });
