# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AlgorithmConfigs(models.Model):
    id = models.BigAutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=100)
    algorithm = models.CharField(max_length=80)
    parameters = models.JSONField()
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"research"."algorithm_configs"'


class CvJdPairs(models.Model):
    id = models.BigAutoField(primary_key=True)
    dataset = models.ForeignKey('Datasets', models.DO_NOTHING)
    cv_id = models.BigIntegerField(blank=True, null=True)
    job_id = models.BigIntegerField(blank=True, null=True)
    relevance_label = models.SmallIntegerField(blank=True, null=True)
    label_source = models.CharField(max_length=60, blank=True, null=True)
    labeled_by = models.BigIntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"research"."cv_jd_pairs"'


class Datasets(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=200)
    version = models.CharField(max_length=60)
    source = models.TextField(blank=True, null=True)
    license = models.TextField(blank=True, null=True)
    checksum_sha256 = models.CharField(max_length=64, blank=True, null=True)
    sample_count = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"research"."datasets"'
        unique_together = (('name', 'version'),)


class ExperimentMetrics(models.Model):
    id = models.BigAutoField(primary_key=True)
    run = models.ForeignKey('ExperimentRuns', models.DO_NOTHING)
    metric_name = models.CharField(max_length=80)
    metric_value = models.DecimalField(max_digits=12, decimal_places=7, blank=True, null=True)
    k = models.IntegerField(blank=True, null=True)
    details = models.JSONField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"research"."experiment_metrics"'
        unique_together = (('run', 'metric_name', 'k'),)


class ExperimentRuns(models.Model):
    id = models.BigAutoField(primary_key=True)
    dataset = models.ForeignKey(Datasets, models.DO_NOTHING, blank=True, null=True)
    config = models.ForeignKey(AlgorithmConfigs, models.DO_NOTHING, blank=True, null=True)
    name = models.CharField(max_length=200)
    status = models.CharField(max_length=30, blank=True, null=True)
    started_at = models.DateTimeField(blank=True, null=True)
    finished_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"research"."experiment_runs"'
