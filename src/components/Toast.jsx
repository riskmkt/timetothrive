import React from 'react';
import { Check } from 'lucide-react';

export default function Toast({ toasts, message }) {
  const items = Array.isArray(toasts)
    ? toasts
    : message
      ? [{ id: 'single-toast', message }]
      : [];

  if (items.length === 0) return null;

  return (
    <div className="toast-container">
      {items.map(toast => (
        <div key={toast.id} className="toast" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={16} color="white" /> {toast.message}
        </div>
      ))}
    </div>
  );
}
