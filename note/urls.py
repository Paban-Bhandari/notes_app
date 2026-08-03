from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("notes/<int:note_id>/edit/", views.edit_note, name="edit_note"),
    path("notes/<int:note_id>/delete/", views.delete_note, name="delete_note"),
]