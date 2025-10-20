import React from 'react';
import './Loading.scss';

const Loading: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>데이터를 불러오는 중...</p>
    </div>
  );
};

export default Loading;
