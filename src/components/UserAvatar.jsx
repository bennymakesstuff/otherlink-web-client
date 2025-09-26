import { authStore } from '../stores/authStore';

export const UserAvatar = (props) => {
  const user = () => authStore.user;
  const size = props.size || 32; // Default size in pixels

  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size * 0.4}px`, // Font size for initials
  };

  return (
    <div class="user-avatar-container">
      {user()?.avatar_url ? (
        <img 
          src={user().avatar_url} 
          alt={`${user()?.first_name || 'User'}'s avatar`}
          class="user-avatar"
          style={avatarStyle}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      
      {/* Fallback placeholder - shown when no avatar or image fails to load */}
      <div 
        class="user-avatar-placeholder"
        style={{
          ...avatarStyle,
          display: user()?.avatar_url ? 'none' : 'flex'
        }}
        title={user()?.first_name && user()?.last_name 
          ? `${user().first_name} ${user().last_name}` 
          : 'User Avatar'
        }
      >
        {user()?.first_name?.[0] || ''}
        {user()?.last_name?.[0] || ''}
      </div>
    </div>
  );
};
