import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export const adminMessageUrl = (userId) => {
  if (!userId) return '/admin/messages';
  return `/admin/messages?to=${encodeURIComponent(userId)}`;
};

export const moderatorMessageUrl = (userId, role = 'vendor') => {
  if (!userId) return '/moderator/messages';
  const params = new URLSearchParams({ to: userId });
  if (role) params.set('role', role);
  return `/moderator/messages?${params.toString()}`;
};

export const AdminMessageButton = ({ userId, label = 'Message', compact = false }) => {
  const navigate = useNavigate();
  if (!userId) return null;

  return (
    <button
      type="button"
      className={compact ? 'adm-btn adm-btn--ghost adm-btn--sm' : 'adm-btn adm-btn--primary adm-btn--sm'}
      onClick={() => navigate(adminMessageUrl(userId))}
      title="Envoyer un message direct"
    >
      <MessageCircle size={14} />
      {label}
    </button>
  );
};
