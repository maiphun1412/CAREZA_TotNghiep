# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Coupons(models.Model):
    id = models.BigAutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=50)
    discount_percent = models.IntegerField(blank=True, null=True)
    valid_until = models.DateTimeField(blank=True, null=True)
    max_uses = models.IntegerField(blank=True, null=True)
    used_count = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"billing"."coupons"'


class Orders(models.Model):
    id = models.BigAutoField(primary_key=True)
    order_code = models.CharField(unique=True, max_length=80)
    user_id = models.BigIntegerField()
    company_id = models.BigIntegerField(blank=True, null=True)
    plan = models.ForeignKey('Plans', models.DO_NOTHING)
    coupon = models.ForeignKey(Coupons, models.DO_NOTHING, blank=True, null=True)
    total_vnd = models.BigIntegerField()
    status = models.CharField(max_length=30)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"billing"."orders"'


class Payments(models.Model):
    id = models.BigAutoField(primary_key=True)
    order = models.ForeignKey(Orders, models.DO_NOTHING)
    provider = models.CharField(max_length=50, blank=True, null=True)
    provider_reference = models.CharField(max_length=180, blank=True, null=True)
    amount_vnd = models.BigIntegerField()
    status = models.CharField(max_length=30)
    paid_at = models.DateTimeField(blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"billing"."payments"'


class Plans(models.Model):
    id = models.BigAutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=60)
    name = models.CharField(max_length=160)
    audience = models.CharField(max_length=30)
    price_vnd = models.BigIntegerField()
    duration_days = models.IntegerField(blank=True, null=True)
    job_quota = models.IntegerField(blank=True, null=True)
    ai_interview_quota = models.IntegerField(blank=True, null=True)
    features = models.JSONField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"billing"."plans"'


class QuotaLedger(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField(blank=True, null=True)
    company_id = models.BigIntegerField(blank=True, null=True)
    quota_type = models.CharField(max_length=60)
    delta = models.IntegerField()
    reference_type = models.CharField(max_length=60, blank=True, null=True)
    reference_id = models.BigIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"billing"."quota_ledger"'


class Subscriptions(models.Model):
    id = models.BigAutoField(primary_key=True)
    plan = models.ForeignKey(Plans, models.DO_NOTHING)
    company_id = models.BigIntegerField(blank=True, null=True)
    user_id = models.BigIntegerField(blank=True, null=True)
    starts_at = models.DateTimeField(blank=True, null=True)
    ends_at = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=30, blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"billing"."subscriptions"'
