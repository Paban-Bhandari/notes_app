from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from .models import Note


User = get_user_model()


class NoteCreateTests(TestCase):
    def test_can_create_note_from_home_page(self):
        user = User.objects.create_user(email="test@example.com", username="test@example.com", password="password123")
        self.client.login(username="test@example.com", password="password123")

        response = self.client.post(
            reverse("home"),
            {"title": "Test note", "content": "Hello from the browser"},
        )

        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse("home"))
        self.assertTrue(Note.objects.filter(title="Test note", owner=user).exists())
