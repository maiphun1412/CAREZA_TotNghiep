# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Certificates(models.Model):
    id = models.BigAutoField(primary_key=True)
    profile = models.ForeignKey('Profiles', models.DO_NOTHING)
    name = models.CharField(max_length=200)
    issuer = models.CharField(max_length=200, blank=True, null=True)
    issued_on = models.DateField(blank=True, null=True)
    credential_url = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"candidate"."certificates"'


class CvVersions(models.Model):
    id = models.BigAutoField(primary_key=True)
    cv = models.ForeignKey('Cvs', models.DO_NOTHING)
    version_number = models.IntegerField()
    content = models.JSONField()
    file_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"candidate"."cv_versions"'
        unique_together = (('cv', 'version_number'),)


class Cvs(models.Model):
    id = models.BigAutoField(primary_key=True)
    profile = models.ForeignKey('Profiles', models.DO_NOTHING)
    title = models.CharField(max_length=200)
    file_url = models.TextField(blank=True, null=True)
    parsed_text = models.TextField(blank=True, null=True)
    parsed_data = models.JSONField(blank=True, null=True)
    is_primary = models.BooleanField(blank=True, null=True)
    status = models.CharField(max_length=30, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"candidate"."cvs"'


class Educations(models.Model):
    id = models.BigAutoField(primary_key=True)
    profile = models.ForeignKey('Profiles', models.DO_NOTHING)
    institution = models.CharField(max_length=200)
    major = models.CharField(max_length=200, blank=True, null=True)
    degree = models.CharField(max_length=100, blank=True, null=True)
    start_year = models.IntegerField(blank=True, null=True)
    end_year = models.IntegerField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"candidate"."educations"'


class Experiences(models.Model):
    id = models.BigAutoField(primary_key=True)
    profile = models.ForeignKey('Profiles', models.DO_NOTHING)
    employer_name = models.CharField(max_length=200)
    job_title = models.CharField(max_length=200)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"candidate"."experiences"'


class JobPreferences(models.Model):
    id = models.BigAutoField(primary_key=True)
    profile = models.OneToOneField('Profiles', models.DO_NOTHING)
    desired_titles = models.TextField(blank=True, null=True)  # This field type is a guess.
    industry_id = models.BigIntegerField(blank=True, null=True)
    location_id = models.BigIntegerField(blank=True, null=True)
    work_modes = models.TextField(blank=True, null=True)  # This field type is a guess.
    salary_min = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"candidate"."job_preferences"'


class ProfileSkills(models.Model):
    profile = models.OneToOneField('Profiles', models.DO_NOTHING, primary_key=True)  # The composite primary key (profile_id, skill_id) found, that is not supported. The first column is selected.
    skill_id = models.BigIntegerField()
    proficiency = models.CharField(max_length=30, blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"candidate"."profile_skills"'
        unique_together = (('profile', 'skill_id'),)


class Profiles(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField('authentication.Users', models.DO_NOTHING, db_column='user_id')
    headline = models.CharField(max_length=250, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    location_id = models.BigIntegerField(blank=True, null=True)
    desired_salary_min = models.BigIntegerField(blank=True, null=True)
    desired_salary_max = models.BigIntegerField(blank=True, null=True)
    experience_years = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    work_mode = models.CharField(max_length=30, blank=True, null=True)
    visibility = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"candidate"."profiles"'


class Projects(models.Model):
    id = models.BigAutoField(primary_key=True)
    profile = models.ForeignKey(Profiles, models.DO_NOTHING)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    project_url = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = '"candidate"."projects"'
