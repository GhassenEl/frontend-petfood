import api from '../utils/api';
import { registerVendor } from './ecosystemService';
import { fetchVendorNotifications, markVendorNotificationRead } from './vendorService';
import {
  DEFAULT_VENDOR_SOCIAL_LINKS,
  DEMO_VENDOR_MARKETING,
} from '../utils/vendorMarketingDemoData';

const SOCIAL_STORAGE_KEY = 'petfoodtn:vendor:social-links';
const PARTNER_STORAGE_KEY = 'petfoodtn:vendor:partner-application';

const readSocialLinks = () => {
  try {
    const raw = localStorage.getItem(SOCIAL_STORAGE_KEY);
    if (!raw) return [...DEFAULT_VENDOR_SOCIAL_LINKS];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_VENDOR_SOCIAL_LINKS];
  } catch {
    return [...DEFAULT_VENDOR_SOCIAL_LINKS];
  }
};

const writeSocialLinks = (links) => {
  localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(links));
  return links;
};

export async function fetchVendorMarketingPack() {
  try {
    const res = await api.get('/ecosystem/vendor/marketing');
    const campaigns = res.data?.campaigns;
    if (Array.isArray(campaigns) && campaigns.length > 0) {
      return { ...res.data, source: 'api', socialLinks: readSocialLinks() };
    }
  } catch {
    /* demo */
  }
  return {
    ...DEMO_VENDOR_MARKETING,
    socialLinks: readSocialLinks(),
    source: 'demo',
  };
}

export function saveVendorSocialLinks(links) {
  writeSocialLinks(links);
  return links;
}

export async function fetchVendorMarketingNotifications() {
  const res = await fetchVendorNotifications();
  return res.data?.notifications || [];
}

export { markVendorNotificationRead };

export async function submitVendorPartnerApplication(body) {
  try {
    const data = await registerVendor({ ...body, applicationStatus: 'pending' });
    const record = {
      status: 'pending',
      submittedAt: new Date().toISOString(),
      shopName: body.shopName,
      reference: data?.reference || `VND-${Date.now().toString(36).slice(-6).toUpperCase()}`,
    };
    localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(record));
    return record;
  } catch (err) {
    const record = {
      status: 'pending',
      submittedAt: new Date().toISOString(),
      shopName: body.shopName,
      reference: `VND-DEMO-${Date.now().toString(36).slice(-4).toUpperCase()}`,
    };
    localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(record));
    if (err?.response?.status && err.response.status < 500) throw err;
    return record;
  }
}

export function getStoredPartnerApplication() {
  try {
    const raw = localStorage.getItem(PARTNER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEMO_VENDOR_MARKETING.partnerApplication;
  } catch {
    return DEMO_VENDOR_MARKETING.partnerApplication;
  }
}

export default {
  fetchVendorMarketingPack,
  saveVendorSocialLinks,
  fetchVendorMarketingNotifications,
  markVendorNotificationRead,
  submitVendorPartnerApplication,
  getStoredPartnerApplication,
};
