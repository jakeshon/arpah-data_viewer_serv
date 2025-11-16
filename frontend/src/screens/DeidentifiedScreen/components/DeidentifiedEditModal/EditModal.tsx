import React, { useState, useEffect } from 'react';
import './EditModal.scss';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: any) => void;
  title: string;
  initialValue: any;
}

const DeidentifiedEditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, title, initialValue }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [showRawJSON, setShowRawJSON] = useState(false);

  useEffect(() => {
    setSelectedIndex(0);
    setIsEditMode(false);
    setEditedData(null);
    setShowRawJSON(false);
  }, [initialValue, isOpen]);

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

  const handleSave = () => {
    if (editedData) {
      console.log('저장할 데이터:', editedData);
      // 배열 객체를 그대로 전달 (JSON 문자열로 변환하지 않음)
      onSave(editedData);
    } else {
      console.warn('수정된 데이터가 없습니다. 원본 데이터를 저장합니다.');
      // 원본도 파싱해서 객체로 전달
      const parsedOriginal = parseJSON(initialValue);
      onSave(parsedOriginal || initialValue);
    }
    onClose();
    setIsEditMode(false);
    setEditedData(null);
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleFieldChange = (fieldName: string, newValue: string, currentItemData: any) => {
    const parsedContent = parseJSON(initialValue);
    if (!Array.isArray(parsedContent)) return;

    // editedData가 없으면 원본 데이터로 초기화
    const baseData = editedData ? JSON.parse(JSON.stringify(editedData)) : JSON.parse(JSON.stringify(parsedContent));

    console.log('필드 변경 시작:', {
      fieldName,
      selectedIndex,
      baseDataLength: baseData.length
    });

    console.log('전체 항목의 날짜/시간:');
    baseData.forEach((item: any, idx: number) => {
      console.log(`  [${idx}] 기준일자=${item['기준일자']}, 기준시간=${item['기준시간']}`);
    });
    console.log('현재 선택된 항목:', currentItemData['기준일자'], currentItemData['기준시간']);

    // sortedContent를 다시 만들어서 매핑 테이블 생성
    const sortedData = [...baseData].sort((a: any, b: any) => {
      if (a['처방적용일'] || b['처방적용일']) {
        const dateA = Number(a['처방적용일']) || 0;
        const dateB = Number(b['처방적용일']) || 0;
        return dateB - dateA;
      }
      if (a['기준일자'] || b['기준일자']) {
        const dateTimeA = Number(`${a['기준일자'] || '0'}${a['기준시간'] || '0'}`);
        const dateTimeB = Number(`${b['기준일자'] || '0'}${b['기준시간'] || '0'}`);
        return dateTimeB - dateTimeA;
      }
      return 0;
    });

    console.log('정렬된 항목:');
    sortedData.forEach((item: any, idx: number) => {
      console.log(`  sorted[${idx}] 기준일자=${item['기준일자']}, 기준시간=${item['기준시간']}`);
    });

    // sortedData[selectedIndex]의 날짜/시간을 가져와서 baseData에서 찾기
    const selectedSorted = sortedData[selectedIndex];
    const targetIndex = baseData.findIndex((item: any) =>
      item['기준일자'] === selectedSorted['기준일자'] &&
      item['기준시간'] === selectedSorted['기준시간']
    );

    console.log(`정렬된 데이터: selectedIndex=${selectedIndex} (${selectedSorted['기준일자']} ${selectedSorted['기준시간']}) → 원본 인덱스=${targetIndex}`);

    if (targetIndex === -1) {
      console.error('원본 데이터에서 항목을 찾을 수 없습니다.');
      return;
    }

    console.log(`필드 변경: [${targetIndex}].${fieldName} = `, newValue);
    baseData[targetIndex][fieldName] = newValue;
    setEditedData(baseData);
  };

  // 비식별화 패턴 하이라이트 렌더링
  const renderHighlightedText = (text: any): React.ReactNode => {
    if (!text) return '';

    const textStr = typeof text === 'string' ? text : String(text);
    const pattern = /<비식별화:([^>]+)>/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(textStr)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {textStr.substring(lastIndex, match.index)}
          </span>
        );
      }

      parts.push(
        <span key={`highlight-${match.index}`} className="deidentified-highlight">
          {match[0]}
        </span>
      );

      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < textStr.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {textStr.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : textStr;
  };

  // DataModal의 renderJSON 로직 (그대로 복사)
  const renderJSON = (data: any, level: number = 0, fieldKey?: string): React.ReactNode => {
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
              <span className="json-value">{renderJSON(value, level + 1, key)}</span>
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(parsedData)) {
      const allObjects = parsedData.every(item => typeof item === 'object' && item !== null && !Array.isArray(item));

      if (allObjects && parsedData.length > 0) {
        const allKeys = Array.from(new Set(parsedData.flatMap(item => Object.keys(item))));

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
                      <td key={key}>{renderJSON(item[key], level + 1, key)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

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

    // 의뢰내용과 회신내용은 하이라이트 적용
    if (fieldKey === '의뢰내용' || fieldKey === '회신내용') {
      const text = String(parsedData);
      const processedText = text.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\r/g, '\n');
      const lines = processedText.split('\n');

      if (lines.length > 1) {
        return (
          <span className="json-primitive multiline">
            {lines.map((line, index) => (
              <React.Fragment key={index}>
                {renderHighlightedText(line)}
                {index < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </span>
        );
      }

      return <span className="json-primitive">{renderHighlightedText(parsedData)}</span>;
    }

    // 일반 텍스트
    const text = String(parsedData);
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

  // 편집 모드에서 필드 값 렌더링
  const renderEditField = (fieldKey: string, currentItemValue: any, currentItem: any): React.ReactNode => {
    // editedData가 있으면 거기서 해당 항목을 찾아서 값 가져오기
    let displayValue = currentItemValue || '';

    if (editedData && Array.isArray(editedData)) {
      const editedItem = editedData.find((item: any) => {
        if (item['기준일자'] && item['기준시간'] && currentItem['기준일자'] && currentItem['기준시간']) {
          return item['기준일자'] === currentItem['기준일자'] && item['기준시간'] === currentItem['기준시간'];
        }
        if (item['처방적용일'] && currentItem['처방적용일']) {
          return item['처방적용일'] === currentItem['처방적용일'];
        }
        const firstKey = Object.keys(item)[0];
        if (firstKey && item[firstKey] === currentItem[firstKey]) {
          return true;
        }
        return false;
      });

      if (editedItem && editedItem[fieldKey] !== undefined) {
        displayValue = editedItem[fieldKey];
      }
    }

    return (
      <div className="edit-field-wrapper">
        <textarea
          className="edit-textarea"
          value={displayValue}
          onChange={(e) => handleFieldChange(fieldKey, e.target.value, currentItem)}
          rows={10}
        />
      </div>
    );
  };

  // 단일 항목 렌더링 (DataModal의 로직 기반, 편집 모드 추가)
  const renderSingleItem = (item: any): React.ReactNode => {
    if (typeof item !== 'object' || item === null) {
      return renderJSON(item);
    }

    return (
      <div className="json-object">
        {Object.entries(item).map(([key, value]) => {
          // 편집 모드이고 의뢰내용 또는 회신내용인 경우
          if (isEditMode && (key === '의뢰내용' || key === '회신내용')) {
            return (
              <div key={key} className="json-field">
                <span className="json-key">{key}:</span>
                <div className="json-value">
                  {renderEditField(key, value, item)}
                </div>
              </div>
            );
          }

          // 일반 필드 (하이라이트 적용됨)
          return (
            <div key={key} className="json-field">
              <span className="json-key">{key}:</span>
              <span className="json-value">{renderJSON(value, 0, key)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // 배열 항목 라벨 생성
  const getItemLabel = (item: any, index: number): string => {
    if (typeof item === 'object' && item !== null) {
      if (item['기준일자'] && item['기준시간']) {
        return `${item['기준일자']} ${item['기준시간']}`;
      }
      const firstKey = Object.keys(item)[0];
      const firstValue = item[firstKey];
      if (firstValue && String(firstValue).length < 30) {
        return String(firstValue);
      }
    }
    return `항목 ${index + 1}`;
  };

  const parsedContent = parseJSON(initialValue);

  // editedData가 있으면 사용, 없으면 원본 사용
  const displayData = editedData || parsedContent;
  const isArray = Array.isArray(displayData);
  const isObjectArray = isArray && displayData.length > 0 && displayData.every((item: any) => typeof item === 'object' && item !== null);

  // 배열 정렬 (DataModal과 동일)
  let sortedContent = displayData;
  if (isObjectArray) {
    sortedContent = [...displayData].sort((a: any, b: any) => {
      if (a['처방적용일'] || b['처방적용일']) {
        const dateA = Number(a['처방적용일']) || 0;
        const dateB = Number(b['처방적용일']) || 0;
        return dateB - dateA;
      }
      if (a['기준일자'] || b['기준일자']) {
        const dateTimeA = Number(`${a['기준일자'] || '0'}${a['기준시간'] || '0'}`);
        const dateTimeB = Number(`${b['기준일자'] || '0'}${b['기준시간'] || '0'}`);
        return dateTimeB - dateTimeA;
      }
      return 0;
    });
  }

  // 현재 선택된 항목 (정렬된 배열 기준)
  const currentItem = sortedContent && sortedContent[selectedIndex] ? sortedContent[selectedIndex] : null;

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
            <button
              className={`mode-toggle-button ${isEditMode ? 'active' : ''}`}
              onClick={handleEditToggle}
            >
              {isEditMode ? '보기 모드' : '수정'}
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
                {renderSingleItem(currentItem)}
              </div>
            </>
          ) : (
            renderJSON(initialValue)
          )}
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>닫기</button>
          {isEditMode && (
            <button className="save-button" onClick={handleSave}>저장</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeidentifiedEditModal;
