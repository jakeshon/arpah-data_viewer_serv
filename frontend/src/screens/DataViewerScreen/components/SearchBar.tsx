import React, { useState, useEffect } from 'react';
import './SearchBar.scss';

interface SearchBarProps {
  onSearch: (patientNo: string, interventionType: string, antibiotic: string, consultation: string) => void;
  currentPatientNo?: string;
  currentInterventionType?: string;
  currentAntibiotic?: string;
  currentConsultation?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  currentPatientNo = '',
  currentInterventionType = '',
  currentAntibiotic = '',
  currentConsultation = ''
}) => {
  const [patientNo, setPatientNo] = useState(currentPatientNo);
  const [interventionType, setInterventionType] = useState(currentInterventionType);
  const [antibiotic, setAntibiotic] = useState(currentAntibiotic);
  const [consultation, setConsultation] = useState(currentConsultation);

  useEffect(() => {
    setPatientNo(currentPatientNo);
    setInterventionType(currentInterventionType);
    setAntibiotic(currentAntibiotic);
    setConsultation(currentConsultation);
  }, [currentPatientNo, currentInterventionType, currentAntibiotic, currentConsultation]);

  const handleSearch = () => {
    onSearch(patientNo, interventionType, antibiotic, consultation);
  };

  const handleReset = () => {
    setPatientNo('');
    setInterventionType('');
    setAntibiotic('');
    setConsultation('');
    onSearch('', '', '', '');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar">
      <div className="search-bar__container">
        <div className="search-bar__field">
          <label htmlFor="patient-no">환자번호</label>
          <input
            id="patient-no"
            type="text"
            value={patientNo}
            onChange={(e) => setPatientNo(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="환자번호 입력"
          />
        </div>
        <div className="search-bar__field">
          <label htmlFor="intervention-type">중재활동분류</label>
          <input
            id="intervention-type"
            type="text"
            value={interventionType}
            onChange={(e) => setInterventionType(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="중재활동분류 입력"
          />
        </div>
        <div className="search-bar__field">
          <label htmlFor="antibiotic">항생제</label>
          <input
            id="antibiotic"
            type="text"
            value={antibiotic}
            onChange={(e) => setAntibiotic(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="항생제 처방명 입력"
          />
        </div>
        <div className="search-bar__field">
          <label htmlFor="consultation">협진기록</label>
          <input
            id="consultation"
            type="text"
            value={consultation}
            onChange={(e) => setConsultation(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="협진기록 내용 입력"
          />
        </div>
        <div className="search-bar__buttons">
          <button className="search-bar__button search-bar__button--search" onClick={handleSearch}>
            검색
          </button>
          <button className="search-bar__button search-bar__button--reset" onClick={handleReset}>
            초기화
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
