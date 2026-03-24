import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-[0.25rem] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-bold font-sans text-foreground">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh] font-serif">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end p-4 border-t border-border gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
