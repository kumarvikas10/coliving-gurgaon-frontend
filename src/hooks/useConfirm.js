import { useState } from 'react';

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const [onCancel, setOnCancel] = useState(() => () => {});

  const confirm = (msg, confirmCallback, cancelCallback = () => {}) => {
    setMessage(msg);
    setOnConfirm(() => confirmCallback);
    setOnCancel(() => cancelCallback);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    onConfirm();
    close();
  };

  const handleCancel = () => {
    onCancel();
    close();
  };

  const close = () => {
    setIsOpen(false);
  };

  return { isOpen, message, confirm, handleConfirm, handleCancel, close };
};
