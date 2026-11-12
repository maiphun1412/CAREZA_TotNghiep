# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AuthTokens(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey('Users', models.DO_NOTHING)
    purpose = models.CharField(max_length=30)
    token_hash = models.CharField(unique=True, max_length=128)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"auth"."auth_tokens"'


class LoginEvents(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey('Users', models.DO_NOTHING, blank=True, null=True)
    email_attempt = models.CharField(max_length=254, blank=True, null=True)
    success = models.BooleanField()
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"auth"."login_events"'


class Permissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"auth"."permissions"'


class RolePermissions(models.Model):
    role = models.OneToOneField('Roles', models.DO_NOTHING, primary_key=True)  # The composite primary key (role_id, permission_id) found, that is not supported. The first column is selected.
    permission = models.ForeignKey(Permissions, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = '"auth"."role_permissions"'
        unique_together = (('role', 'permission'),)


class Roles(models.Model):
    id = models.BigAutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=60)
    name = models.CharField(max_length=120)
    scope = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = '"auth"."roles"'


class UserRoles(models.Model):
    user = models.OneToOneField('Users', models.DO_NOTHING, primary_key=True)  # The composite primary key (user_id, role_id) found, that is not supported. The first column is selected.
    role = models.ForeignKey(Roles, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = '"auth"."user_roles"'
        unique_together = (('user', 'role'),)


class Users(models.Model):
    id = models.BigAutoField(primary_key=True)
    full_name = models.CharField(max_length=160)
    email = models.CharField(max_length=254)
    password_hash = models.CharField(max_length=255, blank=True, null=True)
    account_type = models.CharField(max_length=20)
    phone = models.CharField(max_length=30, blank=True, null=True)
    avatar_url = models.TextField(blank=True, null=True)
    email_verified_at = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"auth"."users"'

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

