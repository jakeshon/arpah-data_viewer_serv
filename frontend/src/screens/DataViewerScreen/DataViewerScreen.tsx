import React, { useEffect, useState } from 'react';
import { dataService } from '../../services/api';
import { DataItem, MetadataItem } from '../../types';
import DataTable from './components/DataTable';
import Loading from '../common/Loading/Loading';
import ErrorMessage from '../common/ErrorMessage/ErrorMessage';
import './DataViewerScreen.scss';

const DataViewerScreen: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [metadata, setMetadata] = useState<MetadataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

  const loadMetadata = async () => {
    try {
      const response = await dataService.getMetadata();
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
      const response = await dataService.getData(page, pageSize);

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

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="data-viewer-screen">
      <DataTable
        data={data}
        metadata={metadata}
        onPageChange={handlePageChange}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
};

export default DataViewerScreen;
