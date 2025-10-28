import React from 'react';
import './DataModal.scss';

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: any;
}

const DataModal: React.FC<DataModalProps> = ({ isOpen, onClose, title, content }) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const [showRawJSON, setShowRawJSON] = React.useState<boolean>(false);

  if (!isOpen) return null;

  const parseJSON = (data: any) => {
    if (data === null || data === undefined || data === '') {
      return null;
    }

    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }

    if (typeof data === 'object') {
      return data;
    }

    return data;
  };

  const renderTPRTable = (tprData: any): React.ReactNode => {
    // Collect all unique timestamps from all sections
    const timestampSet = new Set<string>();
    const sections: { [category: string]: { [key: string]: Array<{ 기록시간: string; 값: string }> } } = {};

    // Categories to display hierarchically
    const categories = ['V/S', '중환자관리', '호흡기계', 'I/O', '삽관', '신경계', 'Ventilator'];

    // Process each category
    categories.forEach(category => {
      const categoryData = tprData[category];
      if (categoryData && typeof categoryData === 'object') {
        sections[category] = {};

        Object.entries(categoryData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            sections[category][key] = value;
            value.forEach((item: any) => {
              if (item['기록시간']) {
                timestampSet.add(item['기록시간']);
              }
            });
          }
        });
      }
    });

    // Sort timestamps
    const timestamps = Array.from(timestampSet).sort();

    if (timestamps.length === 0) {
      return <div className="json-value empty">시계열 데이터 없음</div>;
    }

    // Format timestamp for display - separate date and time
    const formatDate = (ts: string): string => {
      if (ts.length === 14) {
        return `${ts.slice(4, 6)}/${ts.slice(6, 8)}`;
      }
      return ts;
    };

    const formatTime = (ts: string): string => {
      if (ts.length === 14) {
        return `${ts.slice(8, 10)}:${ts.slice(10, 12)}`;
      }
      return ts;
    };

    // Category labels
    const categoryLabels: { [key: string]: string } = {
      'V/S': 'Vital Signs',
      '중환자관리': '중환자관리',
      '호흡기계': '호흡기계',
      'I/O': 'I/O',
      '삽관': '삽관',
      '신경계': '신경계',
      'Ventilator': 'Ventilator'
    };

    return (
      <div className="tpr-table-wrapper">
        <table className="tpr-table">
          <thead>
            <tr className="date-row">
              <th rowSpan={2}>항목</th>
              {timestamps.map(ts => (
                <th key={ts}>{formatDate(ts)}</th>
              ))}
            </tr>
            <tr className="time-row">
              {timestamps.map(ts => (
                <th key={ts}>{formatTime(ts)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(sections).map(([category, items]) => (
              <React.Fragment key={category}>
                <tr className="category-row">
                  <td className="category-label" colSpan={timestamps.length + 1}>
                    {categoryLabels[category] || category}
                  </td>
                </tr>
                {Object.entries(items).map(([itemKey, records]) => (
                  <tr key={`${category}-${itemKey}`} className="item-row">
                    <td className="item-label">{itemKey}</td>
                    {timestamps.map(ts => {
                      const record = records.find(r => r['기록시간'] === ts);
                      return (
                        <td key={ts} className="vital-value">
                          {record ? record['값'] : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderJSON = (data: any, level: number = 0): React.ReactNode => {
    const parsedData = parseJSON(data);

    if (parsedData === null || parsedData === undefined || parsedData === '') {
      return <div className="json-value empty">데이터 없음</div>;
    }

    if (typeof parsedData === 'object' && !Array.isArray(parsedData)) {
      // Check if this is 간호TPR data with V/S or other vital categories
      if (parsedData['V/S'] && typeof parsedData['V/S'] === 'object') {
        return (
          <div className="json-object">
            <div className="json-field">
              <span className="json-key">신장:</span>
              <span className="json-value">{parsedData['신장'] || '-'}</span>
            </div>
            <div className="json-field">
              <span className="json-key">체중:</span>
              <span className="json-value">{parsedData['체중'] || '-'}</span>
            </div>
            <div className="json-field">
              <span className="json-key">BSA:</span>
              <span className="json-value">{parsedData['BSA'] || '-'}</span>
            </div>
            <div className="json-field vital-signs">
              <span className="json-key">간호 기록:</span>
              {renderTPRTable(parsedData)}
            </div>
          </div>
        );
      }

      return (
        <div className="json-object" style={{ marginLeft: level > 0 ? '20px' : '0' }}>
          {Object.entries(parsedData).map(([key, value]) => (
            <div key={key} className="json-field">
              <span className="json-key">{key}:</span>
              <span className="json-value">{renderJSON(value, level + 1)}</span>
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(parsedData)) {
      // 배열의 모든 항목이 객체인지 확인
      const allObjects = parsedData.every(item => typeof item === 'object' && item !== null && !Array.isArray(item));

      if (allObjects && parsedData.length > 0) {
        // 모든 키 수집
        const allKeys = Array.from(new Set(parsedData.flatMap(item => Object.keys(item))));

        // "주/부" 컬럼이 있으면 정렬
        let sortedData = [...parsedData];
        if (allKeys.includes('주/부')) {
          sortedData.sort((a, b) => {
            if (a['주/부'] === '주' && b['주/부'] !== '주') return -1;
            if (a['주/부'] !== '주' && b['주/부'] === '주') return 1;
            return 0;
          });
        }

        return (
          <div className="json-table-wrapper">
            <table className="json-table">
              <thead>
                <tr>
                  {allKeys.map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr key={index}>
                    {allKeys.map(key => (
                      <td key={key}>{renderJSON(item[key], level + 1)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // 일반 배열 (객체가 아닌 경우)
      return (
        <div className="json-array" style={{ marginLeft: level > 0 ? '20px' : '0' }}>
          {parsedData.map((item, index) => (
            <div key={index} className="json-array-item">
              <span className="json-index">[{index}]</span>
              {renderJSON(item, level + 1)}
            </div>
          ))}
        </div>
      );
    }

    // 문자열에서 \r\n을 줄바꿈으로 처리
    const text = String(parsedData);
    // 이스케이프된 개행 문자를 실제 개행 문자로 변환
    const processedText = text.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\r/g, '\n');
    const lines = processedText.split('\n');

    if (lines.length > 1) {
      return (
        <span className="json-primitive multiline">
          {lines.map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </span>
      );
    }

    return <span className="json-primitive">{text}</span>;
  };

  const parsedContent = parseJSON(content);
  const isArray = Array.isArray(parsedContent);
  const isObjectArray = isArray && parsedContent.length > 0 && parsedContent.every(item => typeof item === 'object' && item !== null);

  // 배열을 정렬 (기준일자+기준시간 또는 처방적용일 역순)
  let sortedContent = parsedContent;
  if (isObjectArray) {
    sortedContent = [...parsedContent].sort((a, b) => {
      // 처방적용일이 있는 경우
      if (a['처방적용일'] || b['처방적용일']) {
        const dateA = Number(a['처방적용일']) || 0;
        const dateB = Number(b['처방적용일']) || 0;
        return dateB - dateA; // 역순 정렬 (큰 수가 위로)
      }
      // 기준일자+기준시간이 있는 경우
      if (a['기준일자'] || b['기준일자']) {
        const dateTimeA = Number(`${a['기준일자'] || '0'}${a['기준시간'] || '0'}`);
        const dateTimeB = Number(`${b['기준일자'] || '0'}${b['기준시간'] || '0'}`);
        return dateTimeB - dateTimeA; // 역순 정렬 (큰 수가 위로)
      }
      return 0;
    });
  }

  // 배열의 각 항목에 대한 라벨 생성
  const getItemLabel = (item: any, index: number): string => {
    if (typeof item === 'object' && item !== null) {
      // 처방적용일이 있으면 표시
      if (item['처방적용일']) {
        return `${item['처방적용일']} ${item['처방명'] || ''}`.trim();
      }
      // 기준일자와 기준시간이 있으면 표시
      if (item['기준일자'] && item['기준시간']) {
        return `${item['기준일자']} ${item['기준시간']}`;
      }
      // 첫 번째 키의 값을 라벨로 사용
      const firstKey = Object.keys(item)[0];
      const firstValue = item[firstKey];
      if (firstValue && String(firstValue).length < 30) {
        return String(firstValue);
      }
    }
    return `항목 ${index + 1}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <div className="header-actions">
            <button
              className={`json-toggle-button ${showRawJSON ? 'active' : ''}`}
              onClick={() => setShowRawJSON(!showRawJSON)}
            >
              {showRawJSON ? '포맷 보기' : 'JSON 보기'}
            </button>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>
        <div className={`modal-body ${isObjectArray && !showRawJSON ? 'with-navigator' : ''}`}>
          {showRawJSON ? (
            <pre className="raw-json">
              {JSON.stringify(parsedContent, null, 2)}
            </pre>
          ) : isObjectArray ? (
            <>
              <div className="modal-navigator">
                <div className="navigator-title">목록 ({sortedContent.length})</div>
                <ul className="navigator-list">
                  {sortedContent.map((item: any, index: number) => (
                    <li
                      key={index}
                      className={selectedIndex === index ? 'active' : ''}
                      onClick={() => setSelectedIndex(index)}
                    >
                      {getItemLabel(item, index)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-detail">
                {renderJSON(sortedContent[selectedIndex])}
              </div>
            </>
          ) : (
            renderJSON(content)
          )}
        </div>
      </div>
    </div>
  );
};

export default DataModal;
