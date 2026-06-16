import api from '../utils/api';
import { getPets } from './userService';
import { getLoyaltyAccount } from './loyaltyService';
import { fetchSmartLoyalty } from './ecosystemService';
import {
  DEMO_COMMUNITY_POSTS,
  DEMO_COMMUNITY_MEMBERS,
  DEMO_LOYALTY,
  DEMO_ORDERS,
  DEMO_NUTRITION_PETS,
} from '../utils/clientDemoData';
import { computeUserReputation, rankCommunityMembers } from '../utils/userReputationEngine';
import { generateSmartLoyaltyRewards } from '../utils/smartLoyaltyRewards';

let localPosts = [];

export async function loadCommunityPack() {
  let posts = [];
  let members = [];

  try {
    const res = await api.get('/community/feed');
    posts = res.data?.posts || res.data || [];
  } catch {
    posts = [];
  }

  try {
    const res = await api.get('/community/members');
    members = res.data?.members || res.data || [];
  } catch {
    members = [];
  }

  if (!posts.length) posts = [...DEMO_COMMUNITY_POSTS, ...localPosts];
  else posts = [...posts, ...localPosts];

  if (!members.length) members = DEMO_COMMUNITY_MEMBERS;

  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  let loyalty = DEMO_LOYALTY;
  try {
    const acc = await getLoyaltyAccount();
    if (acc?.points != null) loyalty = acc;
  } catch {
    /* démo */
  }

  let orders = DEMO_ORDERS;
  try {
    const res = await api.get('/orders');
    if (res.data?.length) orders = res.data;
  } catch {
    /* démo */
  }

  let pets = DEMO_NUTRITION_PETS.slice(0, 1);
  try {
    const p = await getPets();
    if (p?.length) pets = p;
  } catch {
    /* démo */
  }

  let smartApi = null;
  try {
    smartApi = await fetchSmartLoyalty();
  } catch {
    /* fallback local */
  }

  const myMember = members.find((m) => m.id === 'u-me') || members[0];
  const myPosts = posts.filter((p) => p.authorId === 'u-me' || p.authorName === 'Vous');
  const myReputation = computeUserReputation({
    ...myMember,
    posts: myPosts,
  });

  const leaderboard = rankCommunityMembers(members);
  const petProfile = pets[0] || { type: 'dog' };
  const tier = loyalty.points >= 200 ? 'gold' : loyalty.points >= 100 ? 'silver' : 'standard';

  const smartRewards = generateSmartLoyaltyRewards({
    points: loyalty.points ?? 0,
    orders,
    posts: myPosts,
    petProfile,
    tier,
  });

  return {
    posts,
    members,
    myReputation,
    leaderboard: leaderboard.slice(0, 8),
    loyalty,
    smartRewards: smartApi?.rewards?.length
      ? { ...smartRewards, rewards: smartApi.rewards, aiSummary: smartApi.summary || smartRewards.aiSummary }
      : smartRewards,
    petProfile,
  };
}

export function addCommunityPost({ type, content, productName, rating }) {
  const post = {
    id: `local-${Date.now()}`,
    type,
    authorId: 'u-me',
    authorName: 'Vous',
    authorAvatar: '👤',
    content: String(content || '').trim(),
    productName: productName || null,
    rating: rating || null,
    likes: 0,
    comments: 0,
    createdAt: new Date().toISOString(),
  };
  localPosts = [post, ...localPosts];
  return post;
}

export default loadCommunityPack;
