from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("about/", views.about, name="about"),
    path("notes/<int:note_id>/edit/", views.edit_note, name="edit_note"),
    path("notes/<int:note_id>/delete/", views.delete_note, name="delete_note"),
    path("notes/<int:note_id>/restore/", views.restore_note, name="restore_note"),
    path("notes/<int:note_id>/delete-permanently/", views.delete_permanently, name="delete_permanently"),
    path("notes/<int:note_id>/archive/", views.archive_note, name="archive_note"),
    path("notes/<int:note_id>/toggle-important/", views.toggle_important_note, name="toggle_important_note"),
]
