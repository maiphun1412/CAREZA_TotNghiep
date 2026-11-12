# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class ApplicationHistory(models.Model):
    id = models.BigAutoField(primary_key=True)
    application = models.ForeignKey('Applications', models.DO_NOTHING)
    from_status = models.CharField(max_length=30, blank=True, null=True)
    to_status = models.CharField(max_length=30)
    changed_by = models.BigIntegerField(blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"recruitment"."application_history"'


class Applications(models.Model):
    id = models.BigAutoField(primary_key=True)
    job = models.ForeignKey('Jobs', models.DO_NOTHING)
    candidate = models.ForeignKey('candidate.Profiles', models.DO_NOTHING, db_column='candidate_id', blank=True, null=True)
    cv = models.ForeignKey('candidate.Cvs', models.DO_NOTHING, db_column='cv_id', blank=True, null=True)
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30)
    applied_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"recruitment"."applications"'
        unique_together = (('job', 'candidate'),)


class Interviews(models.Model):
    id = models.BigAutoField(primary_key=True)
    application = models.ForeignKey(Applications, models.DO_NOTHING)
    interviewer_id = models.BigIntegerField(blank=True, null=True)
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(blank=True, null=True)
    meeting_url = models.TextField(blank=True, null=True)
    mode = models.CharField(max_length=30, blank=True, null=True)
    status = models.CharField(max_length=30, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"recruitment"."interviews"'


class JobSkills(models.Model):
    job = models.OneToOneField('Jobs', models.DO_NOTHING, primary_key=True)  # The composite primary key (job_id, skill_id) found, that is not supported. The first column is selected.
    skill_id = models.BigIntegerField()
    is_required = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"recruitment"."job_skills"'
        unique_together = (('job', 'skill_id'),)


class Jobs(models.Model):
    id = models.BigAutoField(primary_key=True)
    company = models.ForeignKey('company.Companies', models.DO_NOTHING, db_column='company_id')
    created_by = models.ForeignKey('authentication.Users', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    industry_id = models.BigIntegerField(blank=True, null=True)
    location_id = models.BigIntegerField(blank=True, null=True)
    title = models.CharField(max_length=220)
    slug = models.CharField(unique=True, max_length=260)
    description = models.TextField()
    requirements = models.TextField()
    benefits = models.TextField(blank=True, null=True)
    salary_min = models.BigIntegerField(blank=True, null=True)
    salary_max = models.BigIntegerField(blank=True, null=True)
    currency = models.CharField(max_length=3, blank=True, null=True)
    experience_min = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    work_mode = models.CharField(max_length=30, blank=True, null=True)
    employment_type = models.CharField(max_length=40, blank=True, null=True)
    openings = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=30)
    published_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"recruitment"."jobs"'


class Offers(models.Model):
    id = models.BigAutoField(primary_key=True)
    application = models.OneToOneField(Applications, models.DO_NOTHING)
    salary = models.BigIntegerField(blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    letter_url = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, blank=True, null=True)
    sent_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"recruitment"."offers"'


class Scorecards(models.Model):
    id = models.BigAutoField(primary_key=True)
    application = models.ForeignKey(Applications, models.DO_NOTHING)
    reviewer_id = models.BigIntegerField()
    technical_score = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    communication_score = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    culture_score = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"recruitment"."scorecards"'


class TalentPoolMembers(models.Model):
    pool = models.OneToOneField('TalentPools', models.DO_NOTHING, primary_key=True)  # The composite primary key (pool_id, candidate_id) found, that is not supported. The first column is selected.
    candidate_id = models.BigIntegerField()
    added_by = models.BigIntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"recruitment"."talent_pool_members"'
        unique_together = (('pool', 'candidate_id'),)


class TalentPools(models.Model):
    id = models.BigAutoField(primary_key=True)
    company_id = models.BigIntegerField()
    name = models.CharField(max_length=180)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"recruitment"."talent_pools"'


class TestAttempts(models.Model):
    id = models.BigAutoField(primary_key=True)
    test = models.ForeignKey('Tests', models.DO_NOTHING)
    application = models.ForeignKey(Applications, models.DO_NOTHING)
    answers = models.JSONField(blank=True, null=True)
    score = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"recruitment"."test_attempts"'


class Tests(models.Model):
    id = models.BigAutoField(primary_key=True)
    company_id = models.BigIntegerField(blank=True, null=True)
    title = models.CharField(max_length=220)
    duration_minutes = models.IntegerField(blank=True, null=True)
    questions = models.JSONField(blank=True, null=True)
    status = models.CharField(max_length=30, blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"recruitment"."tests"'
