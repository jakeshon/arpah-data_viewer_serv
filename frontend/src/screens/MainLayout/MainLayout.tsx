import React, { useState } from 'react';
import Header from '../common/Header/Header';
import DataViewerScreen from '../DataViewerScreen/DataViewerScreen';
import DeidentifiedScreen from '../DeidentifiedScreen/DeidentifiedScreen';
import './MainLayout.scss';

const MainLayout: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('dataviewer');

  const handleMenuChange = (menu: string) => {
    setActiveMenu(menu);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dataviewer':
        return <DataViewerScreen />;
      case 'deidentified':
        return <DeidentifiedScreen />;
      default:
        return <DataViewerScreen />;
    }
  };

  return (
    <div className="main-layout">
      <Header activeMenu={activeMenu} onMenuChange={handleMenuChange} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default MainLayout;
