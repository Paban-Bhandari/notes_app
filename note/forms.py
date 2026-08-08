from django import forms
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.forms import UserCreationForm

User = get_user_model()


class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            "autocomplete": "email",
            "class": "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200",
            "placeholder": "you@example.com",
        }),
        label="Email",
    )

    class Meta:
        model = User
        fields = ("email", "password1", "password2")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        base_attrs = {
            "class": "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200",
        }

        self.fields["email"].widget.attrs.update({
            **base_attrs,
            "autocomplete": "email",
            "placeholder": "you@example.com",
        })
        self.fields["password1"].widget.attrs.update({
            **base_attrs,
            "autocomplete": "new-password",
            "placeholder": "Create a password",
        })
        self.fields["password2"].widget.attrs.update({
            **base_attrs,
            "autocomplete": "new-password",
            "placeholder": "Confirm your password",
        })

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("A user with this email address already exists.")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        email = self.cleaned_data["email"].strip().lower()
        user.email = email
        user.username = email
        if commit:
            user.save()
        return user


class EmailAuthenticationForm(forms.Form):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            "autocomplete": "email",
            "class": "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200",
            "placeholder": "you@example.com",
        }),
        label="Email",
    )
    password = forms.CharField(
        strip=False,
        widget=forms.PasswordInput(attrs={
            "autocomplete": "current-password",
            "class": "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200",
            "placeholder": "Enter your password",
        }),
        label="Password",
    )

    error_messages = {
        "invalid_login": "Please enter a correct email and password. Note that both fields may be case-sensitive.",
        "inactive": "This account is inactive.",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_cache = None

    def clean(self):
        email = self.cleaned_data.get("email")
        password = self.cleaned_data.get("password")

        if email and password:
            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                raise forms.ValidationError(self.error_messages["invalid_login"], code="invalid_login")

            self.user_cache = authenticate(username=user.username, password=password)
            if self.user_cache is None:
                raise forms.ValidationError(self.error_messages["invalid_login"], code="invalid_login")
            self.confirm_login_allowed(self.user_cache)

        return self.cleaned_data

    def confirm_login_allowed(self, user):
        if not user.is_active:
            raise forms.ValidationError(self.error_messages["inactive"], code="inactive")

    def get_user(self):
        return self.user_cache
