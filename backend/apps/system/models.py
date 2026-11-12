# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AuditLogs(models.Model):
    id = models.BigAutoField(primary_key=True)
    actor_id = models.BigIntegerField(blank=True, null=True)
    action = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=100, blank=True, null=True)
    entity_id = models.BigIntegerField(blank=True, null=True)
    changes = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"system"."audit_logs"'


class EmailTemplates(models.Model):
    id = models.BigAutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=80)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    is_active = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"system"."email_templates"'


class Industries(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(unique=True, max_length=150)
    slug = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = '"system"."industries"'


class Locations(models.Model):
    id = models.BigAutoField(primary_key=True)
    province = models.CharField(max_length=120)
    district = models.CharField(max_length=120, blank=True, null=True)
    ward = models.CharField(max_length=120, blank=True, null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"system"."locations"'


class ModerationCases(models.Model):
    id = models.BigAutoField(primary_key=True)
    reviewer_id = models.BigIntegerField(blank=True, null=True)
    target_type = models.CharField(max_length=40)
    target_id = models.BigIntegerField()
    status = models.CharField(max_length=30)
    reason = models.TextField(blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"system"."moderation_cases"'


class Settings(models.Model):
    key = models.CharField(primary_key=True, max_length=100)
    value = models.JSONField()
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"system"."settings"'


class Skills(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(unique=True, max_length=120)
    category = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"system"."skills"'
