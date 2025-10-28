from django.conf import settings
from typing import List, Dict, Any
import json
import os


class ExcelDataService:
    """JSON data service (previously Excel-based, now JSON-based)"""

    _cached_data = None

    @staticmethod
    def _load_json_data() -> Dict[str, Any]:
        """Load and cache JSON data"""
        if ExcelDataService._cached_data is None:
            json_file_path = str(settings.DATA_FILE_PATH)

            if not os.path.exists(json_file_path):
                raise FileNotFoundError(f"JSON file not found: {json_file_path}")

            with open(json_file_path, 'r', encoding='utf-8') as f:
                ExcelDataService._cached_data = json.load(f)

        return ExcelDataService._cached_data

    @staticmethod
    def _save_json_data(data: Dict[str, Any]):
        """Save data to JSON file and update cache"""
        json_file_path = str(settings.DATA_FILE_PATH)

        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        # Update cache
        ExcelDataService._cached_data = data

    @staticmethod
    def get_metadata() -> List[Dict[str, Any]]:
        """Get column metadata from JSON columns"""
        data = ExcelDataService._load_json_data()
        columns = data.get('columns', [])

        # Generate metadata from column names
        metadata = []

        # Find the position of 기본정보 column
        basic_info_index = -1
        if '기본정보' in columns:
            basic_info_index = columns.index('기본정보')

        # Add columns before 기본정보
        for i, col_name in enumerate(columns):
            if i == basic_info_index:
                # Insert 진료과 and 병동 before 기본정보
                metadata.append({
                    'col_id': '진료과',
                    'col_name': '진료과',
                    'desc': '기본정보에서 추출',
                    'hide': 'N'
                })
                metadata.append({
                    'col_id': '병동',
                    'col_name': '병동',
                    'desc': '기본정보에서 추출',
                    'hide': 'N'
                })

            metadata.append({
                'col_id': col_name,
                'col_name': col_name,
                'desc': '',
                'hide': 'N'
            })

        # If 기본정보 not found, add them at the end
        if basic_info_index == -1:
            metadata.append({
                'col_id': '진료과',
                'col_name': '진료과',
                'desc': '기본정보에서 추출',
                'hide': 'N'
            })
            metadata.append({
                'col_id': '병동',
                'col_name': '병동',
                'desc': '기본정보에서 추출',
                'hide': 'N'
            })

        return metadata

    @staticmethod
    def get_data(page: int = 1, page_size: int = 50, patient_no: str = None, intervention_type: str = None, antibiotic: str = None) -> Dict[str, Any]:
        """Get paginated and filtered data from JSON"""
        data = ExcelDataService._load_json_data()
        all_data = data.get('data', [])

        # Extract 진료과 and 병동 from 기본정보 and add to each record
        enriched_data = []
        for item in all_data:
            enriched_item = item.copy()

            # Extract from 기본정보
            basic_info = item.get('기본정보', {})
            if isinstance(basic_info, str):
                try:
                    basic_info = json.loads(basic_info)
                except:
                    basic_info = {}

            enriched_item['진료과'] = basic_info.get('진료과', '')
            enriched_item['병동'] = basic_info.get('병동', '')
            enriched_data.append(enriched_item)

        # Apply search filters
        filtered_data = enriched_data
        if patient_no:
            filtered_data = [
                item for item in filtered_data
                if item.get('환자번호') and str(item.get('환자번호')).strip() == patient_no
            ]

        if intervention_type:
            filtered_data = [
                item for item in filtered_data
                if item.get('중재활동분류') and intervention_type in str(item.get('중재활동분류'))
            ]

        if antibiotic:
            # Search prescription name in antibiotic administration history
            filtered_data = [
                item for item in filtered_data
                if item.get('항생제투약이력') and ExcelDataService._search_antibiotic(item.get('항생제투약이력'), antibiotic)
            ]

        # Pagination
        total = len(filtered_data)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_data = filtered_data[start_idx:end_idx]

        return {
            'data': paginated_data,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size
        }

    @staticmethod
    def _search_antibiotic(antibiotic_history: Any, search_term: str) -> bool:
        """Search prescription name in antibiotic administration history (case insensitive)"""
        try:
            if isinstance(antibiotic_history, str):
                data = json.loads(antibiotic_history)
            else:
                data = antibiotic_history

            if isinstance(data, dict) and '항생제투약' in data:
                search_term_lower = search_term.lower()
                for record in data['항생제투약']:
                    if '처방명' in record and search_term_lower in str(record['처방명']).lower():
                        return True
            return False
        except:
            return False

    @staticmethod
    def update_data(row_index: int, column_name: str, value: Any) -> bool:
        """Update specific cell data in JSON"""
        try:
            # Load current data
            json_data = ExcelDataService._load_json_data()
            all_data = json_data.get('data', [])

            # Check row index validity
            if row_index < 0 or row_index >= len(all_data):
                raise ValueError(f"Invalid row_index: {row_index}")

            # Check column name validity
            columns = json_data.get('columns', [])
            if column_name not in columns:
                raise ValueError(f"Column '{column_name}' not found")

            # Update value (중재활동분류 stored as comma-separated string)
            if column_name == '중재활동분류':
                if isinstance(value, list):
                    # Convert array to "4, 5" format string
                    cell_value = ', '.join(map(str, value)) if value else ''
                else:
                    cell_value = value
            else:
                cell_value = value

            # Update data
            all_data[row_index][column_name] = cell_value

            # Save to file
            ExcelDataService._save_json_data(json_data)

            return True

        except Exception as e:
            print(f"Data update error: {str(e)}")
            raise e
