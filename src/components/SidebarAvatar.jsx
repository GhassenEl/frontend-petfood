import React from 'react';
import SafeImage from './SafeImage';
import { getRoleAvatar } from '../utils/platformImages';

/** Avatar sidebar — image locale si URL absente ou cassée */
const SidebarAvatar = ({ user, role = 'client', className, style }) => (
  <SafeImage
    src={user?.avatarUrl || user?.photo || user?.imageUrl}
    fallback={getRoleAvatar(role)}
    alt={user?.name || role}
    className={className}
    style={style}
  />
);

export default SidebarAvatar;
