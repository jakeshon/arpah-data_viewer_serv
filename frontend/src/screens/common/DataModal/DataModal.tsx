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

  const renderJSON = (data: any, level: number = 0): React.ReactNode => {
    const parsedData = parseJSON(data);

    if (parsedData === null || parsedData === undefined || parsedData === '') {
      return <div className="json-value empty">데이터 없음</div>;
    }

    if (typeof parsedData === 'object' && !Array.isArray(parsedData)) {
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
