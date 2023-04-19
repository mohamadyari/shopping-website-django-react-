from django.db.models.signals import pre_save
from django.contrib.auth.models import User


def updateUser(sender, instance, **kwargs):
    user = instance

    if user.email != "":
        user.username = user.email

    # print(f'{user.username} updated !;-) ')
pre_save.connect(receiver=updateUser, sender=User)
 