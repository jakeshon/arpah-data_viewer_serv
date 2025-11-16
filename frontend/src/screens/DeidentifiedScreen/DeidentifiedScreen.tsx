import React, { useEffect, useState } from 'react';
import { dataService } from '../../services/api';
import { DataItem, MetadataItem } from '../../types';
import DeidentifiedDataTable from './components/DeidentifiedDataTable';
import SearchBar from '../DataViewerScreen/components/SearchBar';
import Loading from '../common/Loading/Loading';
import ErrorMessage from '../common/ErrorMessage/ErrorMessage';
import './DeidentifiedScreen.scss';

const DeidentifiedScreen: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [metadata, setMetadata] = useState<MetadataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [patientNo, setPatientNo] = useState('');
  const [interventionType, setInterventionType] = useState('');
  const [antibiotic, setAntibiotic] = useState('');
  const [consultation, setConsultation] = useState('');
  const pageSize = 50;

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, patientNo, interventionType, antibiotic, consultation]);

  const loadMetadata = async () => {
    try {
      const response = await dataService.getMetadataDeidentified();
      if (response.success) {
        setMetadata(response.data);
      }
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  };

  const loadData = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dataService.getDataDeidentified(page, pageSize, patientNo, interventionType, antibiotic, consultation);

      if (response.success) {
        setData(response.data);
        setTotalPages(response.total_pages);
      }
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (searchInstitution: string, searchPatientNo: string, searchInterventionType: string, searchAntibiotic: string, searchConsultation: string) => {
    // 비식별화 탭에서는 기관 검색을 사용하지 않음
    setPatientNo(searchPatientNo);
    setInterventionType(searchInterventionType);
    setAntibiotic(searchAntibiotic);
    setConsultation(searchConsultation);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="deidentified-screen">
      <SearchBar
        onSearch={handleSearch}
        currentPatientNo={patientNo}
        currentInterventionType={interventionType}
        currentAntibiotic={antibiotic}
        currentConsultation={consultation}
        showInstitution={false}
      />
      <DeidentifiedDataTable
        data={data}
        metadata={metadata}
        onPageChange={handlePageChange}
        currentPage={currentPage}
        totalPages={totalPages}
        onDataRefresh={() => loadData(currentPage)}
      />
    </div>
  );
};

export default DeidentifiedScreen;
