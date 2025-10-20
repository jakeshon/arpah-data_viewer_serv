import React, { useState, useEffect } from 'react';
import './EditModal.scss';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title: string;
  initialValue: string;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, title, initialValue }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="edit-modal-body">
          <textarea
            className="edit-textarea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="중재 가이드를 작성해주세요..."
            rows={10}
          />
        </div>
        <div className="edit-modal-footer">
          <button className="cancel-button" onClick={onClose}>취소</button>
          <button className="save-button" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
