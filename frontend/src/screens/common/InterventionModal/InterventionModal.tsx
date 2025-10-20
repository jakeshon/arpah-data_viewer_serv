import React, { useState, useEffect } from 'react';
import './InterventionModal.scss';

interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedCategories: number[]) => void;
  initialValue: number[];
}

const INTERVENTION_CATEGORIES = [
  { id: 1, label: '중재필요없음' },
  { id: 2, label: '병합처방 중재' },
  { id: 3, label: '장기투여 중재' },
  { id: 4, label: '경구전환' },
  { id: 5, label: '하강치료' },
  { id: 6, label: '미생물 검사 기반 중재' },
  { id: 7, label: '가이드라인에 맞는 처방' },
  { id: 8, label: '치료약물 모니터링' },
  { id: 9, label: '기타' },
];

const InterventionModal: React.FC<InterventionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialValue
}) => {
  const [selectedCategories, setSelectedCategories] = useState<number[]>(initialValue);

  useEffect(() => {
    setSelectedCategories(initialValue);
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const handleToggle = (id: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(id)) {
        return prev.filter(catId => catId !== id);
      } else {
        return [...prev, id].sort((a, b) => a - b);
      }
    });
  };

  const handleSave = () => {
    onSave(selectedCategories);
    onClose();
  };

  return (
    <div className="intervention-modal-overlay" onClick={onClose}>
      <div className="intervention-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="intervention-modal-header">
          <h2>중재활동분류</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="intervention-modal-body">
          <div className="intervention-list">
            {INTERVENTION_CATEGORIES.map(category => (
              <label key={category.id} className="intervention-item">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleToggle(category.id)}
                />
                <span className="checkbox-custom"></span>
                <span className="category-label">
                  {category.id}. {category.label}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="intervention-modal-footer">
          <button className="cancel-button" onClick={onClose}>취소</button>
          <button className="save-button" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default InterventionModal;
