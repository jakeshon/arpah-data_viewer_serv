from django.urls import path
from . import views

urlpatterns = [
    path('metadata/', views.get_metadata, name='get_metadata'),
    path('data/', views.get_data, name='get_data'),
    path('data/update/', views.update_data, name='update_data'),
    path('metadata/deidentified/', views.get_metadata_deidentified, name='get_metadata_deidentified'),
    path('data/deidentified/', views.get_data_deidentified, name='get_data_deidentified'),
    path('data/deidentified/update/', views.update_data_deidentified, name='update_data_deidentified'),
    path('data/deidentified/update-by-patient/', views.update_data_deidentified_by_patient, name='update_data_deidentified_by_patient'),
]
