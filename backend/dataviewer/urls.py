from django.urls import path
from . import views

urlpatterns = [
    path('metadata/', views.get_metadata, name='get_metadata'),
    path('data/', views.get_data, name='get_data'),
    path('data/update/', views.update_data, name='update_data'),
]
