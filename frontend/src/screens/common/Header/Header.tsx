import React from 'react';
import logoImage from '../../../assets/images/logo.png';
import './Header.scss';

interface HeaderProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeMenu, onMenuChange }) => {
  const menuItems = [
    { id: 'dataviewer', label: '데이터 뷰어' },
    // 추가 메뉴 항목을 여기에 추가할 수 있습니다
  ];

  return (
    <header className="main-header">
      <div className="logo">
        <img src={logoImage} alt="Logo" className="logo-image" />
      </div>
      <nav className="menu-nav">
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li key={item.id} className={activeMenu === item.id ? 'active' : ''}>
              <button onClick={() => onMenuChange(item.id)}>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
