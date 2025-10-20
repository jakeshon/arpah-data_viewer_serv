import React, { useState } from 'react';
import { DataItem, MetadataItem } from '../../../types';
import DataModal from '../../common/DataModal/DataModal';
import InterventionModal from '../../common/InterventionModal/InterventionModal';
import EditModal from '../../common/EditModal/EditModal';
import { dataService } from '../../../services/api';
import './DataTable.scss';

interface DataTableProps {
  data: DataItem[];
  metadata: MetadataItem[];
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  metadata,
  onPageChange,
  currentPage,
  totalPages
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState<any>(null);

  const [interventionModalOpen, setInterventionModalOpen] = useState(false);
  const [currentInterventionRow, setCurrentInterventionRow] = useState<number | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditRow, setCurrentEditRow] = useState<number | null>(null);
  const [editModalTitle, setEditModalTitle] = useState('');

  // 메타데이터에서 컬럼 정보 추출 (col_id와 col_name 사용)
  const columns = metadata.length > 0
    ? metadata.filter(meta => meta.hide !== 'Y').map(meta => ({
      id: meta.col_id,
      name: meta.col_name || meta.col_id
    }))
    : data.length > 0
      ? Object.keys(data[0]).filter(key => key !== 'null').map(key => ({ id: key, name: key }))
      : [];

  const handleCellClick = (columnName: string, content: any) => {
    setModalTitle(columnName);
    setModalContent(content);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const hasData = (value: any): boolean => {
    return value !== null && value !== undefined && value !== '' && value !== '{}';
  };

  // 중재활동분류 값을 파싱 (배열, 문자열, 숫자 처리)
  const parseInterventionCategories = (value: any): number[] => {
    if (!value && value !== 0) return [];
    if (Array.isArray(value)) return value;

    // 숫자 타입인 경우 (엑셀에서 숫자로 저장된 경우)
    if (typeof value === 'number') {
      return [value];
    }

    if (typeof value === 'string') {
      // 먼저 쉼표나 숫자로만 구성된 문자열인지 확인
      // 예: "5", "5, 6", "1,2,3"
      const trimmed = value.trim();
      if (/^[\d,\s]+$/.test(trimmed)) {
        // 쉼표로 구분된 문자열 처리
        return trimmed.split(',').map(v => parseInt(v.trim())).filter(n => !isNaN(n));
      }

      // JSON 형식인 경우
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // 중재활동분류 표시 텍스트 생성
  const getInterventionText = (categories: number[]): string => {
    if (categories.length === 0) return '';
    return categories.join(', ');
  };

  const handleInterventionClick = (rowIndex: number) => {
    setCurrentInterventionRow(rowIndex);
    setInterventionModalOpen(true);
  };

  const handleInterventionSave = async (selectedCategories: number[]) => {
    if (currentInterventionRow !== null) {
      try {
        // 데이터를 업데이트합니다
        data[currentInterventionRow]['중재활동분류'] = selectedCategories;

        // API 호출하여 백엔드에 저장
        await dataService.updateData(
          currentInterventionRow,
          '중재활동분류',
          selectedCategories
        );

        console.log('중재활동분류 저장 완료');
      } catch (error) {
        console.error('중재활동분류 저장 실패:', error);
        alert('저장에 실패했습니다.');
      }
    }
  };

  const handleEditClick = (rowIndex: number, columnName: string) => {
    setCurrentEditRow(rowIndex);
    setEditModalTitle(columnName);
    setEditModalOpen(true);
  };

  const handleEditSave = async (value: string) => {
    if (currentEditRow !== null) {
      try {
        // 데이터를 업데이트합니다
        data[currentEditRow]['중재가이드작성'] = value;

        // API 호출하여 백엔드에 저장
        await dataService.updateData(
          currentEditRow,
          '중재가이드작성',
          value
        );

        console.log('중재가이드작성 저장 완료');
      } catch (error) {
        console.error('중재가이드작성 저장 실패:', error);
        alert('저장에 실패했습니다.');
      }
    }
  };

  return (
    <div className="data-table-container">
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => {
                  // 중재활동분류 필드 처리
                  if (col.id === '중재활동분류') {
                    const rawValue = row[col.id];
                    const categories = parseInterventionCategories(rawValue);
                    const displayText = getInterventionText(categories);

                    // 디버깅: 원본 값과 파싱된 값 출력
                    if (rowIndex === 0) {
                      console.log('중재활동분류 원본값:', rawValue, '타입:', typeof rawValue);
                      console.log('파싱된 categories:', categories);
                      console.log('표시 텍스트:', displayText);
                    }

                    return (
                      <td key={colIndex}>
                        <div
                          className="intervention-cell"
                          onClick={() => handleInterventionClick(rowIndex)}
                        >
                          {displayText || '-'}
                        </div>
                      </td>
                    );
                  }

                  // 중재가이드작성 필드 처리
                  if (col.id === '중재가이드작성') {
                    const value = row[col.id] || '';
                    return (
                      <td key={colIndex}>
                        <button
                          className="guide-button"
                          onClick={() => handleEditClick(rowIndex, col.name)}
                        >
                          {value ? '보기/수정' : '작성'}
                        </button>
                      </td>
                    );
                  }

                  // 일반 필드 처리
                  return (
                    <td key={colIndex}>
                      {col.id === '환자번호' || col.id === '환자순번' || col.id === '중재일자' ? (
                        <span className={'patient-id'}>{row[col.id]}</span>
                      ) : hasData(row[col.id]) ? (
                        <button
                          className="cell-button"
                          onClick={() => handleCellClick(col.name, row[col.id])}
                        >
                          {col.name}
                        </button>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DataModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        content={modalContent}
      />

      <InterventionModal
        isOpen={interventionModalOpen}
        onClose={() => setInterventionModalOpen(false)}
        onSave={handleInterventionSave}
        initialValue={
          currentInterventionRow !== null
            ? parseInterventionCategories(data[currentInterventionRow]?.['중재활동분류'])
            : []
        }
      />

      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
        title={editModalTitle}
        initialValue={
          currentEditRow !== null
            ? (data[currentEditRow]?.['중재가이드작성'] || '')
            : ''
        }
      />

      <div className="pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </button>
        <span className="page-info">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default DataTable;
