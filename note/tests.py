from django.test import TestCase
from django.urls import reverse

from .models import Note


class NoteCreateTests(TestCase):
    def test_can_create_note_from_home_page(self):
        response = self.client.post(
            reverse("home"),
            {"title": "Test note", "content": "Hello from the browser"},
        )

        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse("home"))
        self.assertTrue(Note.objects.filter(title="Test note").exists())
