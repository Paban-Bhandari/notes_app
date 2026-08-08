from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("about/", views.about, name="about"),
    path("folders/", views.folder_list, name="folder_list"),
    path("folders/create/", views.create_folder, name="create_folder"),
    path("folders/<int:folder_id>/", views.folder_detail, name="folder_detail"),
    path("folders/<int:folder_id>/delete/", views.delete_folder, name="delete_folder"),
    path("notes/<int:note_id>/edit/", views.edit_note, name="edit_note"),
    path("notes/<int:note_id>/delete/", views.delete_note, name="delete_note"),
    path("notes/<int:note_id>/archive/", views.archive_note, name="archive_note"),
    path("notes/<int:note_id>/toggle-important/", views.toggle_important_note, name="toggle_important_note"),
]
