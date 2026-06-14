import React from 'react';
import { useSearchParams } from 'react-router-dom';
import HumanMessageInbox from '../components/HumanMessageInbox';

const AdminMessages = () => {
  const [params] = useSearchParams();
  const initialPartnerId = params.get('to') || '';
  const initialRoleFilter = params.get('role') || 'all';

  return (
    <HumanMessageInbox
      mode="admin"
      initialPartnerId={initialPartnerId}
      initialRoleFilter={initialRoleFilter}
    />
  );
};

export default AdminMessages;
