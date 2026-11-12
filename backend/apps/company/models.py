# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Branches(models.Model):
    id = models.BigAutoField(primary_key=True)
    company = models.ForeignKey('Companies', models.DO_NOTHING)
    name = models.CharField(max_length=180)
    address = models.TextField(blank=True, null=True)
    location_id = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"company"."branches"'


class Branding(models.Model):
    company = models.OneToOneField('Companies', models.DO_NOTHING, primary_key=True)
    banner_url = models.TextField(blank=True, null=True)
    slogan = models.CharField(max_length=250, blank=True, null=True)
    benefits = models.JSONField(blank=True, null=True)
    social_links = models.JSONField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"company"."branding"'


class Companies(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=250)
    slug = models.CharField(unique=True, max_length=200)
    industry_id = models.BigIntegerField(blank=True, null=True)
    website = models.TextField(blank=True, null=True)
    logo_url = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    company_size = models.CharField(max_length=60, blank=True, null=True)
    location_id = models.BigIntegerField(blank=True, null=True)
    verification_status = models.CharField(max_length=30)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"company"."companies"'


class Members(models.Model):
    id = models.BigAutoField(primary_key=True)
    company = models.ForeignKey(Companies, models.DO_NOTHING)
    user_id = models.BigIntegerField()
    member_role = models.CharField(max_length=30)
    status = models.CharField(max_length=30, blank=True, null=True)
    joined_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"company"."members"'
        unique_together = (('company', 'user_id'),)


class VerificationRequests(models.Model):
    id = models.BigAutoField(primary_key=True)
    company = models.ForeignKey(Companies, models.DO_NOTHING)
    submitted_by = models.BigIntegerField(blank=True, null=True)
    legal_name = models.CharField(max_length=250, blank=True, null=True)
    tax_code = models.CharField(max_length=30, blank=True, null=True)
    document_url = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30)
    reviewed_by = models.BigIntegerField(blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"company"."verification_requests"'
