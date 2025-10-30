from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import ExcelDataService


@api_view(['GET'])
def get_metadata(request):
    """컬럼 메타데이터 조회 API"""
    try:
        metadata = ExcelDataService.get_metadata()
        return Response({
            'success': True,
            'data': metadata
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_data(request):
    """데이터 조회 API (페이징 및 검색)"""
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 50))
        patient_no = request.GET.get('patient_no', '').strip()
        intervention_type = request.GET.get('intervention_type', '').strip()
        antibiotic = request.GET.get('antibiotic', '').strip()
        consultation = request.GET.get('consultation', '').strip()

        result = ExcelDataService.get_data(
            page=page,
            page_size=page_size,
            patient_no=patient_no if patient_no else None,
            intervention_type=intervention_type if intervention_type else None,
            antibiotic=antibiotic if antibiotic else None,
            consultation=consultation if consultation else None
        )
        return Response({
            'success': True,
            **result
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def update_data(request):
    """데이터 업데이트 API"""
    try:
        row_index = request.data.get('row_index')
        column_name = request.data.get('column_name')
        value = request.data.get('value')

        if row_index is None or column_name is None:
            return Response({
                'success': False,
                'error': 'row_index와 column_name이 필요합니다.'
            }, status=status.HTTP_400_BAD_REQUEST)

        ExcelDataService.update_data(row_index, column_name, value)

        return Response({
            'success': True,
            'message': '데이터가 성공적으로 업데이트되었습니다.'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
