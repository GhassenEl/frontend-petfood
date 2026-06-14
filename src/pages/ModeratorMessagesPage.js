import React from 'react';
import { useSearchParams } from 'react-router-dom';
import HumanMessageInbox from '../components/HumanMessageInbox';

const ModeratorMessagesPage = () => {
  const [params] = useSearchParams();
  return (
    <HumanMessageInbox
      mode="moderator"
      initialPartnerId={params.get('to') || ''}
      initialRoleFilter={params.get('role') || 'all'}
    />
  );
};

export default ModeratorMessagesPage;
