import { useState } from 'react';

const DEFAULT_AVATAR = 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';

export default function Avatar({ src, alt = 'User avatar', size = 'md', className = '' }) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-2xl',
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const imageSrc = error || !src ? DEFAULT_AVATAR : src;

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={() => setError(true)}
      className={`rounded-full object-cover shrink-0 border border-slate-200/80 bg-slate-100 ${selectedSize} ${className}`}
    />
  );
}
