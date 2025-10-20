export interface DataItem {
  [key: string]: any;
}

export interface MetadataItem {
  [key: string]: any;
}

export interface DataResponse {
  success: boolean;
  data: DataItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface MetadataResponse {
  success: boolean;
  data: MetadataItem[];
}
