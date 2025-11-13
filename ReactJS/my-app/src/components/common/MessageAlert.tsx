import React from 'react';

interface MessageAlertProps {
  message: { type: 'success' | 'error'; text: string } | null;
}

const MessageAlert: React.FC<MessageAlertProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className={`p-4 rounded-lg ${
      message.type === 'success' 
        ? 'bg-green-50 text-green-700 border border-green-200' 
        : 'bg-red-50 text-red-700 border border-red-200'
    }`}>
      {message.text}
    </div>
  );
};

export default MessageAlert;



