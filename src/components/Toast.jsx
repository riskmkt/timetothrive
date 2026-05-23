import React from 'react';
import { Check } from 'lucide-react';

export default function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className="toast" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={16} color="white" /> {toast.message}
        </div>
      ))}
    </div>
  );
}