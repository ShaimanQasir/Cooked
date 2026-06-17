from django.apps import AppConfig


class UserprofileConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.userProfile'

    def ready(self):
        import app.userProfile.signals
