# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class CompanyFollows(models.Model):
    user_id = models.BigIntegerField(primary_key=True)  # The composite primary key (user_id, company_id) found, that is not supported. The first column is selected.
    company_id = models.BigIntegerField()
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"interaction"."company_follows"'
        unique_together = (('user_id', 'company_id'),)


class CompanyReviews(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField()
    company_id = models.BigIntegerField()
    rating = models.IntegerField()
    title = models.CharField(max_length=180, blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"interaction"."company_reviews"'


class Conversations(models.Model):
    id = models.BigAutoField(primary_key=True)
    firebase_thread_id = models.CharField(unique=True, max_length=250, blank=True, null=True)
    candidate_user_id = models.BigIntegerField(blank=True, null=True)
    company_id = models.BigIntegerField(blank=True, null=True)
    last_message_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"interaction"."conversations"'


class JobAlerts(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField()
    keyword = models.CharField(max_length=200, blank=True, null=True)
    location_id = models.BigIntegerField(blank=True, null=True)
    frequency = models.CharField(max_length=30, blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"interaction"."job_alerts"'


class JobComparisons(models.Model):
    user_id = models.BigIntegerField(primary_key=True)  # The composite primary key (user_id, job_id) found, that is not supported. The first column is selected.
    job_id = models.BigIntegerField()
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"interaction"."job_comparisons"'
        unique_together = (('user_id', 'job_id'),)


class Notifications(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField()
    type = models.CharField(max_length=60)
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True, null=True)
    payload = models.JSONField(blank=True, null=True)
    read_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"interaction"."notifications"'


class Reports(models.Model):
    id = models.BigAutoField(primary_key=True)
    reporter_id = models.BigIntegerField()
    target_type = models.CharField(max_length=40)
    target_id = models.BigIntegerField()
    reason = models.CharField(max_length=120)
    details = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"interaction"."reports"'


class SavedJobs(models.Model):
    user_id = models.BigIntegerField(primary_key=True)  # The composite primary key (user_id, job_id) found, that is not supported. The first column is selected.
    job_id = models.BigIntegerField()
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"interaction"."saved_jobs"'
        unique_together = (('user_id', 'job_id'),)


class SearchHistory(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField(blank=True, null=True)
    keyword = models.TextField(blank=True, null=True)
    filters = models.JSONField(blank=True, null=True)
    searched_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"interaction"."search_history"'
