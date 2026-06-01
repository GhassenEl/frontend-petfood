const API_BASE = process.env.API_BASE_URL || 'http://localhost:5002';

/** @param {import('@playwright/test').APIRequestContext} request */
async function loginClientApi(request) {
  const res = await request.post(`${API_BASE}/api/auth/login`, {
    data: { email: 'client@petfood.tn', password: 'MonChat123!' },
  });
  const body = await res.json();
  if (!body.token) throw new Error('Login API échoué');
  return { token: body.token, user: body.user };
}

/** @param {import('@playwright/test').APIRequestContext} request */
async function ensureWalletBalance(request, token, minBalance = 200) {
  const headers = { Authorization: `Bearer ${token}` };
  const walletRes = await request.get(`${API_BASE}/api/wallet`, { headers });
  const wallet = await walletRes.json();
  const balance = wallet.balance ?? 0;
  if (balance < minBalance) {
    await request.post(`${API_BASE}/api/wallet/topup`, {
      headers,
      data: { amount: minBalance - balance + 50, paymentMethod: 'demo' },
    });
  }
}

function localDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

module.exports = { loginClientApi, ensureWalletBalance, localDateStr, API_BASE };
