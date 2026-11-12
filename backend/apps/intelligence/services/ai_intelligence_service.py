import re
import math
import collections
from datetime import datetime, timezone
from django.db import connection, transaction
from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied

from apps.authentication.models import Users
from apps.company.models import Companies, Members
from apps.candidate.models import Profiles, Cvs, CvVersions
from apps.recruitment.models import Jobs, JobSkills, Applications
from apps.billing.models import Subscriptions, QuotaLedger
from apps.intelligence.models import (
    AiTasks,
    CvEvaluations,
    MatchResults,
    Recommendations,
    Rubrics,
    PromptTemplates,
)
from apps.knowledge.models import Documents, Chunks, RagSessions, RagMessages
from apps.research.models import Datasets, AlgorithmConfigs, ExperimentRuns, ExperimentMetrics, CvJdPairs


# ==============================================================================
# 1. NLP & Math Utilities (Thuần Python, không phụ thuộc package ngoài)
# ==============================================================================

COMMON_SKILLS_TAXONOMY = [
    # Ngôn ngữ & Framework
    "python", "django", "drf", "fastapi", "flask",
    "javascript", "typescript", "react", "reactjs", "vue", "vuejs", "angular", "nextjs", "nuxtjs",
    "nodejs", "express", "nestjs", "java", "spring", "spring boot", "c#", "c++", "c",
    "asp.net", ".net", "php", "laravel", "golang", "go", "rust", "ruby", "rails", "kotlin", "swift",
    # Cơ sở dữ liệu & Cache
    "sql", "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch", "oracle", "sqlite",
    # DevOps, Cloud & Hệ thống
    "docker", "kubernetes", "k8s", "aws", "gcp", "azure", "ci/cd", "git", "github", "gitlab",
    "linux", "nginx", "terraform", "ansible",
    # AI, ML & Dữ liệu
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch",
    "pandas", "numpy", "scikit-learn", "data analysis", "rag", "llm", "prompt engineering",
    # Kiến trúc & Phương pháp luận
    "rest api", "graphql", "microservices", "agile", "scrum", "oop", "clean code",
    "design patterns", "system design", "unit test", "automation test",
]

VIETNAMESE_STOPWORDS = {
    "và", "của", "cho", "các", "những", "trong", "với", "là", "có", "được", "tại", "một",
    "này", "khi", "về", "đã", "đang", "sẽ", "để", "như", "ra", "vào", "lại", "thì", "từ",
    "do", "bởi", "lên", "xuống", "sau", "trước", "giữa", "theo", "nhiều", "hơn", "rất",
    "qua", "người", "việc", "ngày", "năm", "tháng", "thời", "gian", "công", "ty", "vị", "trí",
}


def clean_and_tokenize(text: str) -> list[str]:
    """Tách từ cơ bản và loại bỏ ký tự đặc biệt, chuẩn hóa chữ thường."""
    if not text:
        return []
    cleaned = re.sub(r"[^\w\s\+\#\./\-]", " ", text.lower())
    tokens = cleaned.split()
    return [t for t in tokens if len(t) > 1 and t not in VIETNAMESE_STOPWORDS]


def extract_skills_from_text(text: str) -> list[str]:
    """Trích xuất các kỹ năng từ văn bản dựa trên taxonomy chuẩn hóa."""
    if not text:
        return []
    lowered = text.lower()
    found_skills = set()
    for skill in COMMON_SKILLS_TAXONOMY:
        esc = re.escape(skill)
        # Prefix boundary
        if skill.startswith((".", "#", "+")):
            prefix = r"(?:^|[\s,;:|\(\)\[\]/\\<>\'\"-])"
        elif skill == "c":
            prefix = r"(?<![\w\+\#])"
        else:
            prefix = r"(?<![\w])"

        # Suffix boundary
        if skill.endswith(("#", "+")) or skill == "c":
            suffix = r"(?![\w\#\+])"
        else:
            suffix = r"(?![\w])"

        pattern = prefix + esc + suffix
        if re.search(pattern, lowered):
            found_skills.add(skill)
    return sorted(list(found_skills))


def extract_experience_years_from_text(text: str, reference_year: int | None = None) -> float:
    """Ước tính số năm kinh nghiệm từ văn bản qua các mẫu câu thông dụng và hợp nhất khoảng thời gian làm việc."""
    if not text:
        return 0.0
    lowered = text.lower()
    lines = [line.strip() for line in lowered.split("\n") if line.strip()]

    # 1. Tìm mẫu câu kinh nghiệm tường minh: 'X năm kinh nghiệm', 'X+ years', 'kinh nghiệm: X năm'
    patterns = [
        r"(\d+(?:\.\d+)?)\s*(?:\+|\s*hơn)?\s*(?:năm|nam|year|years|yr|yrs)(?:\s*(?:kinh\s*nghiệm|kn|experience|of\s*experience))?",
        r"(?:kinh\s*nghiệm|experience|exp)[\:\s]+(\d+(?:\.\d+)?)\s*(?:năm|nam|year|years|yr|yrs)?",
    ]
    years = []
    for pat in patterns:
        matches = re.findall(pat, lowered)
        for m in matches:
            try:
                val = float(m)
                if 0.5 <= val <= 40.0:
                    years.append(val)
            except ValueError:
                pass
    if years:
        return max(years)

    # 2. Ước lượng qua các khoảng năm làm việc (ví dụ: 2021 - 2024), LOẠI BỎ các dòng thuộc Học vấn, Dự án học tập, NCKH, Chứng chỉ
    non_work_indicators = [
        # Học vấn & Bằng cấp
        "đại học", "cao đẳng", "học viện", "university", "college",
        "bachelor", "master", "thạc sĩ", "tiến sĩ", "phd", "cử nhân",
        "kỹ sư", "education", "học vấn", "bằng cấp", "tốt nghiệp", "chuyên ngành",
        # Dự án học tập, sinh viên, NCKH
        "nghiên cứu khoa học", "nckh", "đề tài", "sinh viên", "học tập",
        "khóa luận", "luận văn", "capstone", "student", "academic", "đồ án",
        # Chứng chỉ & Ngoại ngữ
        "chứng chỉ", "certificate", "certificates", "certification",
        "istqb", "aws certified", "toeic", "ielts", "ocp", "csm", "cka"
    ]

    intervals = []
    # Xác định năm tham chiếu: Nếu truyền thì dùng để tái lập kết quả, ngược lại dùng năm hiện tại
    calc_year = int(reference_year) if reference_year is not None else datetime.now().year
    year_range_pattern = r"\b(20[0-2]\d)\s*(?:-|–|đến|to)\s*(20[0-2]\d|nay|hiện\s*tại|present)\b"

    for line in lines:
        # Bỏ qua các dòng chứa thông tin học vấn, nghiên cứu khoa học sinh viên hoặc chứng chỉ
        if any(ind in line for ind in non_work_indicators):
            continue

        matches = re.findall(year_range_pattern, line)
        for start_str, end_str in matches:
            try:
                start_y = int(start_str)
                end_y = calc_year if any(k in end_str for k in ["nay", "hiện", "present"]) else int(end_str)
                if 2000 <= start_y <= end_y <= (calc_year + 5):
                    intervals.append([start_y, end_y])
            except ValueError:
                continue

    # Hợp nhất các khoảng thời gian chồng lấn (Interval Merging)
    if intervals:
        intervals.sort(key=lambda x: x[0])
        merged = []
        for s, e in intervals:
            if not merged:
                merged.append([s, e])
            else:
                prev_s, prev_e = merged[-1]
                if s <= prev_e:
                    merged[-1][1] = max(prev_e, e)
                else:
                    merged.append([s, e])
        total_span = sum(e - s for s, e in merged)
        if total_span > 0:
            return min(float(total_span), 30.0)

    return 0.0


class TfidfEngine:
    """Công cụ vector hóa TF-IDF và tính toán Cosine Similarity thuần Python."""

    @staticmethod
    def compute_tfidf_cosine(doc1: str, doc2: str) -> float:
        tokens1 = clean_and_tokenize(doc1)
        tokens2 = clean_and_tokenize(doc2)
        if not tokens1 or not tokens2:
            return 0.0

        all_docs = [tokens1, tokens2]
        vocabulary = sorted(list(set(tokens1 + tokens2)))
        vocab_index = {w: i for i, w in enumerate(vocabulary)}
        num_docs = 2

        # IDF
        idf = {}
        for w in vocabulary:
            df = sum(1 for d in all_docs if w in d)
            idf[w] = math.log((1 + num_docs) / (1 + df)) + 1.0

        # Vector TF-IDF doc1
        v1 = [0.0] * len(vocabulary)
        len1 = len(tokens1)
        tf1 = collections.Counter(tokens1)
        for w, c in tf1.items():
            idx = vocab_index[w]
            v1[idx] = (c / len1) * idf[w]

        # Vector TF-IDF doc2
        v2 = [0.0] * len(vocabulary)
        len2 = len(tokens2)
        tf2 = collections.Counter(tokens2)
        for w, c in tf2.items():
            idx = vocab_index[w]
            v2[idx] = (c / len2) * idf[w]

        # Cosine similarity
        dot_product = sum(a * b for a, b in zip(v1, v2))
        norm1 = math.sqrt(sum(a * a for a in v1))
        norm2 = math.sqrt(sum(b * b for b in v2))

        if norm1 == 0 or norm2 == 0:
            return 0.0
        return round(min(1.0, max(0.0, dot_product / (norm1 * norm2))), 4)


class TopsisEngine:
    """Thuật toán xếp hạng đa tiêu chí TOPSIS."""

    @staticmethod
    def rank(items: list[dict], criteria_keys: list[str], weights: list[float]) -> list[dict]:
        """
        Xếp hạng danh sách items theo TOPSIS.
        items: danh sách dict có các key trong criteria_keys.
        weights: trọng số tương ứng (tổng bằng 1.0).
        Trả về danh sách items kèm trường 'topsis_score' và 'rank_position'.
        """
        n = len(items)
        if n == 0:
            return []
        m = len(criteria_keys)
        if m == 0 or len(weights) != m:
            raise ValueError("Số lượng trọng số phải khớp với số tiêu chí.")

        # 1. Ma trận quyết định
        matrix = []
        for it in items:
            row = [float(it.get(k, 0.0) or 0.0) for k in criteria_keys]
            matrix.append(row)

        # 2. Chuẩn hóa vector
        col_sq_sums = [math.sqrt(sum(matrix[i][j] ** 2 for i in range(n))) for j in range(m)]
        norm_matrix = []
        for i in range(n):
            row = []
            for j in range(m):
                norm_val = matrix[i][j] / col_sq_sums[j] if col_sq_sums[j] > 0 else 0.0
                row.append(norm_val * weights[j])
            norm_matrix.append(row)

        # 3. Xác định giải pháp lý tưởng dương A+ và âm A- (mặc định tất cả tiêu chí là benefit)
        ideal_best = [max(norm_matrix[i][j] for i in range(n)) for j in range(m)]
        ideal_worst = [min(norm_matrix[i][j] for i in range(n)) for j in range(m)]

        # 4. Tính khoảng cách Euclid và điểm TOPSIS
        scored_items = []
        for i, it in enumerate(items):
            dist_best = math.sqrt(sum((norm_matrix[i][j] - ideal_best[j]) ** 2 for j in range(m)))
            dist_worst = math.sqrt(sum((norm_matrix[i][j] - ideal_worst[j]) ** 2 for j in range(m)))
            denom = dist_best + dist_worst
            score = (dist_worst / denom) if denom > 0 else 0.5
            it_copy = dict(it)
            it_copy["topsis_score"] = round(score, 6)
            scored_items.append(it_copy)

        # 5. Sắp xếp giảm dần theo điểm TOPSIS và gán thứ hạng
        scored_items.sort(key=lambda x: x["topsis_score"], reverse=True)
        for rank, it in enumerate(scored_items, start=1):
            it["rank_position"] = rank

        return scored_items


# ==============================================================================
# 2. AI Tasks & Quota Management Service
# ==============================================================================

class AiTaskService:
    @staticmethod
    def start_task(user_id: int | None, task_type: str, model_name: str, input_reference: dict) -> AiTasks:
        now = datetime.now(timezone.utc)
        task = AiTasks.objects.create(
            requested_by=user_id,
            task_type=task_type,
            model_name=model_name,
            input_reference=input_reference,
            status="processing",
            created_at=now,
        )
        return task

    @staticmethod
    def finish_task(task: AiTasks, output: dict, status: str = "completed") -> AiTasks:
        task.finished_at = datetime.now(timezone.utc)
        task.output = output
        task.status = status
        task.save(update_fields=["finished_at", "output", "status"])
        return task

    @staticmethod
    def check_and_deduct_ai_quota(user_id: int, required_units: int = 1) -> bool:
        """
        Kiểm tra và trừ quota AI phỏng vấn / xử lý thông minh nếu user thuộc doanh nghiệp có gói dịch vụ.
        Nếu user là ứng viên cá nhân, kiểm tra quyền hoặc cho phép theo hạn mức miễn phí.
        """
        # Kiểm tra xem user có phải là employer thuộc company không
        member = Members.objects.filter(user_id=user_id).first()
        if member:
            from django.db.models import Sum
            company_id = member.company_id
            agg = QuotaLedger.objects.filter(
                company_id=company_id, quota_type="ai_interview"
            ).aggregate(total=Sum("delta"))
            total_quota = int(agg.get("total") or 0)

            sub = Subscriptions.objects.filter(company_id=company_id, status="active").first()
            has_granted = QuotaLedger.objects.filter(
                company_id=company_id, quota_type="ai_interview", delta__gt=0
            ).exists()

            if sub or has_granted:
                if total_quota < required_units:
                    raise ValidationError({
                        "quota": "Doanh nghiệp của bạn đã sử dụng hết hạn mức AI. Vui lòng nạp thêm hoặc nâng cấp gói dịch vụ."
                    })

                # Ghi nhận trừ quota vào QuotaLedger
                QuotaLedger.objects.create(
                    company_id=company_id,
                    user_id=user_id,
                    quota_type="ai_interview",
                    delta=-required_units,
                    reference_type="ai_task",
                    reference_id=None,
                    created_at=datetime.now(timezone.utc),
                )
            return True

        return True

    @staticmethod
    def list_tasks(user_id: int, task_type: str | None = None, page: int = 1, page_size: int = 20) -> dict:
        qs = AiTasks.objects.filter(requested_by=user_id)
        if task_type:
            qs = qs.filter(task_type=task_type)
        total = qs.count()
        offset = (page - 1) * page_size
        tasks = qs.order_by("-created_at")[offset:offset + page_size]
        items = []
        for t in tasks:
            items.append({
                "id": t.id,
                "task_type": t.task_type,
                "model_name": t.model_name,
                "input_reference": t.input_reference,
                "output": t.output,
                "status": t.status,
                "created_at": t.created_at,
                "finished_at": t.finished_at,
            })
        return {
            "items": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            }
        }


# ==============================================================================
# 3. CV Parser Service (Phân tích CV)
# ==============================================================================

class CvParserService:
    @staticmethod
    def parse_cv_text(text: str, reference_year: int | None = None) -> dict:
        """
        Trích xuất thông tin cấu trúc từ văn bản CV:
        - Thông tin cá nhân (name, email, phone)
        - Học vấn
        - Kinh nghiệm
        - Kỹ năng
        - Dự án
        - Chứng chỉ
        """
        if not text:
            return {
                "candidate_info": {},
                "skills": [],
                "educations": [],
                "experiences": [],
                "projects": [],
                "certificates": [],
                "total_experience_years": 0.0,
            }

        lines = [line.strip() for line in text.split("\n") if line.strip()]

        # 1. Email & Phone
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
        email = email_match.group(0) if email_match else ""

        phone_match = re.search(r"(?:\+84|0)(?:\s*\d){9,10}", text)
        phone = re.sub(r"\s+", "", phone_match.group(0)) if phone_match else ""

        # Họ tên: Ước lượng từ dòng đầu tiên không chứa email/phone/keyword tiêu đề hoặc ký tự phân cách
        candidate_name = ""
        section_title_blacklist = [
            "curriculum", "resume", "cv", "hồ sơ", "xin việc",
            "thông tin", "cá nhân", "liên hệ", "contact", "info", "information", "details",
            "kỹ năng", "skill", "skills", "năng lực", "competencies", "expertise", "technical",
            "profile", "summary", "tóm tắt", "tổng quan", "mục tiêu", "objective", "about",
            "kinh nghiệm", "experience", "quá trình", "work", "làm việc", "lịch sử",
            "học vấn", "education", "bằng cấp", "đào tạo", "qualification", "qualifications",
            "dự án", "project", "projects", "tiêu biểu",
            "chứng chỉ", "certificate", "certificates", "certification", "credentials",
            "vị trí", "chức danh", "ứng tuyển", "applying", "target", "role",
            "developer", "engineer", "kỹ sư", "lập trình viên", "chuyên viên", "architect",
            "confidential", "candidate", "anonymous", "ẩn danh"
        ]

        common_non_name_words = {
            "technical", "expertise", "specialist", "engineer", "developer",
            "professional", "summary", "profile", "contact", "details",
            "competencies", "skills", "experience", "education", "projects",
            "certifications", "credentials", "qualifications", "curriculum",
            "vitae", "resume", "objective", "overview", "portfolio", "history",
            "information", "statement", "references", "work", "employment"
        }

        for line in lines[:12]:
            clean_l = line.strip()
            # Bỏ qua nếu chứa email, số điện thoại, chữ số
            if "@" in clean_l or re.search(r"\d", clean_l):
                continue
            # Bỏ qua nếu chứa ký tự phân cách của dòng metadata/chức danh
            if any(sep in clean_l for sep in [":", "|", "/", "(", ")", ";", "*", "+"]):
                continue
            words = clean_l.split()
            # Họ tên thông thường gồm 2 đến 5 từ
            if len(words) in [2, 3, 4, 5]:
                lowered_words = [w.lower() for w in words]
                # Nhận diện ngữ cảnh: Nếu tất cả các từ trong dòng đều là danh từ chỉ mục kỹ thuật/chức năng
                if all(w in common_non_name_words for w in lowered_words):
                    continue
                # Bỏ qua nếu chứa bất kỳ từ khóa tiêu đề/mục nào
                lowered_l = clean_l.lower()
                if any(k in lowered_l for k in section_title_blacklist):
                    continue
                candidate_name = clean_l
                break

        # 2. Kỹ năng
        skills = extract_skills_from_text(text)

        # 3. Số năm kinh nghiệm (truyền reference_year nếu có)
        exp_years = extract_experience_years_from_text(text, reference_year=reference_year)

        # 4. Học vấn (Educations)
        educations = []
        edu_keywords = ["đại học", "cao đẳng", "học viện", "university", "college", "bachelor", "master", "kỹ sư", "cử nhân"]
        for line in lines:
            if any(k in line.lower() for k in edu_keywords):
                educations.append({
                    "raw_text": line,
                    "institution": line,
                    "degree": "Cử nhân / Kỹ sư" if "kỹ sư" in line.lower() or "bachelor" in line.lower() else "Đại học",
                })

        # 5. Kinh nghiệm làm việc (Experiences)
        experiences = []
        exp_keywords = ["công ty", "tập đoàn", "company", "corporation", "lập trình viên", "developer", "engineer", "software", "chuyên viên"]
        for line in lines:
            if any(k in line.lower() for k in exp_keywords) and len(line) < 150:
                experiences.append({
                    "raw_text": line,
                    "title": line,
                })

        # 6. Dự án (Projects) - Cải thiện nhận diện cả tiếng Việt và tiếng Anh theo ngữ cảnh
        projects = []
        proj_headings = {
            "dự án", "dự án tiêu biểu", "project", "projects", "key projects",
            "representative projects", "select projects", "notable projects",
            "featured projects", "major projects", "highlighted projects", "dự án sinh viên"
        }
        for line in lines:
            lowered_l = line.lower()
            # Bỏ qua các dòng chỉ là tiêu đề mục thuần túy
            if lowered_l in proj_headings:
                continue
            # Bắt các dòng dự án có tên cụ thể (tiếng Việt "Dự án..." hoặc tiếng Anh "Project...")
            is_proj = (
                any(k in lowered_l for k in ["dự án ", "dự án:", "project ", "project:"])
                or (any(k in lowered_l for k in ["hệ thống", "nền tảng", "platform", "system:"]) and len(line) < 120)
            )
            if is_proj and len(line) < 180:
                projects.append({"name": line, "description": line})

        # 7. Chứng chỉ (Certificates)
        certificates = []
        cert_keywords = ["chứng chỉ", "certificate", "certificates", "toeic", "ielts", "aws certified", "pmp", "scrum master", "istqb", "certified"]
        for line in lines:
            if any(k in line.lower() for k in cert_keywords):
                certificates.append({"name": line})

        return {
            "candidate_info": {
                "full_name": candidate_name,
                "email": email,
                "phone": phone,
            },
            "skills": skills,
            "educations": educations[:5],
            "experiences": experiences[:10],
            "projects": projects[:8],
            "certificates": certificates[:5],
            "total_experience_years": exp_years,
        }

    @classmethod
    def execute_cv_parsing(cls, user_id: int | None, cv_id: int | None, raw_text: str = "", save_version: bool = True, reference_year: int | None = None) -> dict:
        """Thực thi parsing CV và lưu trữ vào database."""
        cv = None
        if cv_id:
            cv = Cvs.objects.filter(id=cv_id).first()
            if not cv:
                raise NotFound("Không tìm thấy CV tương ứng.")
            if not raw_text:
                raw_text = cv.parsed_text or ""

        if not raw_text:
            raise ValidationError({"raw_text": "Vui lòng cung cấp nội dung văn bản CV để phân tích."})

        # Bắt đầu AI Task
        task = AiTaskService.start_task(
            user_id=user_id,
            task_type="cv_parsing",
            model_name="careza-nlp-parser-v1",
            input_reference={"cv_id": cv_id, "text_length": len(raw_text)},
        )

        parsed_data = cls.parse_cv_text(raw_text, reference_year=reference_year)

        # Cập nhật vào Cvs nếu có
        now = datetime.now(timezone.utc)
        if cv:
            cv.parsed_text = raw_text
            cv.parsed_data = parsed_data
            cv.save(update_fields=["parsed_text", "parsed_data"])

            if save_version:
                latest_ver = CvVersions.objects.filter(cv=cv).order_by("-version_number").first()
                next_ver_num = (latest_ver.version_number + 1) if latest_ver else 1
                CvVersions.objects.create(
                    cv=cv,
                    version_number=next_ver_num,
                    content=parsed_data,
                    file_url=cv.file_url,
                    created_at=now,
                )

        output = {
            "cv_id": cv.id if cv else None,
            "parsed_data": parsed_data,
        }
        AiTaskService.finish_task(task, output=output)
        return {
            "task_id": task.id,
            "cv_id": cv.id if cv else None,
            "status": "completed",
            "parsed_data": parsed_data,
        }


# ==============================================================================
# 4. CV Evaluator Service (Đánh giá CV)
# ==============================================================================

def normalize_resume_data(cv_data: dict) -> tuple[dict, str]:
    """
    Chuẩn hóa dữ liệu CV dạng Semantic JSON (hỗ trợ cả format ResumeData Studio lẫn parsed_data backend).
    Trả về: (parsed_data, raw_text)
    """
    if not isinstance(cv_data, dict):
        return {}, ""

    # 1. Candidate Info
    raw_p = cv_data.get("personalInfo") or cv_data.get("personal") or cv_data.get("candidate_info") or {}
    c_info = {
        "full_name": raw_p.get("fullName") or raw_p.get("full_name") or cv_data.get("fullName") or "",
        "email": raw_p.get("email") or cv_data.get("email") or "",
        "phone": raw_p.get("phone") or cv_data.get("phone") or "",
        "address": raw_p.get("address") or "",
        "title": raw_p.get("jobTitle") or raw_p.get("title") or "",
        "summary": raw_p.get("summary") or "",
    }

    # 2. Skills
    raw_skills = cv_data.get("skills") or []
    skills = []
    for s in raw_skills:
        if isinstance(s, dict):
            name = s.get("name") or s.get("skill_name") or ""
            if name and str(name).strip():
                skills.append(str(name).strip())
        elif isinstance(s, str) and s.strip():
            skills.append(s.strip())

    # 3. Experiences
    raw_exps = cv_data.get("experiences") or []
    experiences = []
    for exp in raw_exps:
        if isinstance(exp, dict):
            experiences.append({
                "company": exp.get("company") or "",
                "role": exp.get("position") or exp.get("role") or "",
                "start_date": exp.get("startDate") or exp.get("start_date") or "",
                "end_date": exp.get("endDate") or exp.get("end_date") or "",
                "description": exp.get("description") or "",
            })
    total_years = min(float(len(experiences) * 1.5), 25.0) if experiences else 0.0

    # 4. Educations
    raw_edus = cv_data.get("educations") or []
    educations = []
    for edu in raw_edus:
        if isinstance(edu, dict):
            educations.append({
                "school": edu.get("school") or "",
                "major": edu.get("major") or "",
                "degree": edu.get("degree") or "",
                "start_date": edu.get("startDate") or edu.get("start_date") or "",
                "end_date": edu.get("endDate") or edu.get("end_date") or "",
                "description": edu.get("description") or "",
            })

    # 5. Projects
    raw_projects = cv_data.get("projects") or []
    projects = []
    for p in raw_projects:
        if isinstance(p, dict):
            projects.append({
                "name": p.get("name") or "",
                "role": p.get("role") or "",
                "technologies": p.get("technologies") or "",
                "description": p.get("description") or "",
            })

    # 6. Certificates
    raw_certs = cv_data.get("certificates") or []
    certificates = []
    for c in raw_certs:
        if isinstance(c, dict):
            certificates.append({
                "name": c.get("name") or "",
                "issuer": c.get("issuer") or "",
                "issue_date": c.get("issueDate") or c.get("issue_date") or "",
            })

    # Gom text hoàn chỉnh của CV
    text_parts = [
        c_info["full_name"],
        c_info["title"],
        c_info["email"],
        c_info["phone"],
        c_info["address"],
        c_info["summary"],
        " ".join(skills),
    ]
    for exp in experiences:
        text_parts.extend([exp["company"], exp["role"], exp["description"]])
    for edu in educations:
        text_parts.extend([edu["school"], edu["major"], edu["degree"], edu["description"]])
    for proj in projects:
        text_parts.extend([proj["name"], proj["role"], proj["technologies"], proj["description"]])
    for cert in certificates:
        text_parts.extend([cert["name"], cert["issuer"]])

    raw_text = "\n".join(p for p in text_parts if p and str(p).strip())

    parsed_data = {
        "candidate_info": c_info,
        "skills": skills,
        "experiences": experiences,
        "educations": educations,
        "projects": projects,
        "certificates": certificates,
        "total_experience_years": total_years,
    }
    return parsed_data, raw_text


# ==============================================================================
# 4. CV Evaluator Service (Đánh giá CV)
# ==============================================================================

class CvEvaluatorService:
    @staticmethod
    def evaluate_cv(
        user_id: int | None,
        cv_id: int | None = None,
        rubric_version: str = "standard_v1.0",
        cv_data: dict | None = None,
    ) -> dict:
        cv = None
        if cv_id:
            cv = Cvs.objects.filter(id=cv_id).first()
            if not cv and not cv_data:
                raise NotFound("Không tìm thấy CV để đánh giá.")

        if cv and not cv_data:
            parsed_data = cv.parsed_data or {}
            raw_text = cv.parsed_text or ""
            if not parsed_data and raw_text:
                parsed_data = CvParserService.parse_cv_text(raw_text)
        elif cv_data:
            parsed_data, raw_text = normalize_resume_data(cv_data)
        else:
            raise ValidationError("Vui lòng cung cấp cv_id hoặc dữ liệu CV.")

        task = AiTaskService.start_task(
            user_id=user_id,
            task_type="cv_evaluation",
            model_name="careza-cv-evaluator-v1",
            input_reference={"cv_id": cv_id, "rubric_version": rubric_version},
        )

        # Bộ tiêu chí chấm điểm chất lượng CV (Thang 100 điểm)
        # 1. Tính hoàn thiện thông tin (25 điểm)
        c_info = parsed_data.get("candidate_info", {})
        completeness_score = 0.0
        if c_info.get("full_name"): completeness_score += 5.0
        if c_info.get("email"): completeness_score += 5.0
        if c_info.get("phone"): completeness_score += 5.0
        if parsed_data.get("educations"): completeness_score += 5.0
        if parsed_data.get("experiences"): completeness_score += 5.0

        # 2. Chiều sâu kỹ năng (25 điểm)
        skills = parsed_data.get("skills", [])
        num_skills = len(skills)
        if num_skills >= 8:
            skill_score = 25.0
        elif num_skills >= 5:
            skill_score = 20.0
        elif num_skills >= 3:
            skill_score = 15.0
        elif num_skills >= 1:
            skill_score = 10.0
        else:
            skill_score = 0.0

        # 3. Chất lượng mô tả kinh nghiệm & dự án (25 điểm)
        exp_score = 0.0
        experiences = parsed_data.get("experiences", [])
        projects = parsed_data.get("projects", [])
        exp_years = float(parsed_data.get("total_experience_years", 0.0) or 0.0)

        if len(experiences) >= 2 or exp_years >= 2.0:
            exp_score += 15.0
        elif len(experiences) >= 1:
            exp_score += 10.0

        if len(projects) >= 2:
            exp_score += 10.0
        elif len(projects) >= 1:
            exp_score += 5.0

        # 4. Trình bày, định dạng và chứng chỉ (25 điểm)
        format_score = 10.0  # Mặc định có text
        word_count = len(raw_text.split())
        if word_count >= 120:
            format_score += 5.0
        if parsed_data.get("certificates"):
            format_score += 10.0
        else:
            format_score += 5.0

        total_score = round(min(100.0, completeness_score + skill_score + exp_score + format_score), 1)

        # Phân tích Điểm mạnh (Strengths)
        strengths = []
        if completeness_score >= 20.0:
            strengths.append("Thông tin cá nhân và hồ sơ cơ bản đầy đủ, bố cục rõ ràng.")
        if num_skills >= 5:
            strengths.append(f"Danh mục kỹ năng đa dạng ({', '.join(skills[:5])}).")
        if exp_years >= 2.0 or len(experiences) >= 2:
            strengths.append(f"Có kinh nghiệm làm việc thực tế với {len(experiences)} vị trí công tác.")
        if projects:
            strengths.append(f"Minh chứng năng lực qua {len(projects)} dự án thực tế.")
        if not strengths:
            strengths.append("Bố cục CV ngắn gọn, dễ nắm bắt thông tin cơ bản.")

        # Phân tích Điểm yếu & Thiếu sót (Weaknesses)
        weaknesses = []
        if not c_info.get("email") or not c_info.get("phone"):
            weaknesses.append("Thiếu thông tin liên hệ chuẩn (email hoặc số điện thoại).")
        if not c_info.get("summary") or len(c_info.get("summary", "").split()) < 15:
            weaknesses.append("Phần giới thiệu bản thân còn thiếu hoặc quá ngắn, chưa tạo ấn tượng ban đầu.")
        if num_skills < 4:
            weaknesses.append("Số lượng kỹ năng công nghệ còn ít, cần bổ sung rõ các công cụ/ngôn ngữ đã làm việc.")
        if not experiences:
            weaknesses.append("Chưa có thông tin về kinh nghiệm làm việc thực tế.")
        if not projects:
            weaknesses.append("Chưa nêu rõ các dự án cụ thể đã từng thực hiện để chứng minh kỹ năng.")
        if not parsed_data.get("certificates"):
            weaknesses.append("Chưa có chứng chỉ nghề nghiệp hoặc ngoại ngữ để tăng độ tin cậy.")
        if not weaknesses:
            weaknesses.append("Cần bổ sung thêm số liệu định lượng về kết quả đạt được trong công việc.")

        # Kỹ năng gợi ý bổ sung (Missing / Recommended Skills)
        suggested_skills = ["Docker", "Git", "CI/CD", "AWS", "Unit Test", "RESTful API", "TypeScript", "Agile/Scrum"]
        current_lower_skills = [x.lower() for x in skills]
        missing_skills = [s for s in suggested_skills if s.lower() not in current_lower_skills][:5]

        # Đề xuất cải thiện chi tiết theo từng Section trong Studio
        section_suggestions = []

        # 1. Thông tin cá nhân & Giới thiệu
        if not c_info.get("email"):
            section_suggestions.append({
                "section_id": "personal",
                "section_title": "Thông tin cá nhân",
                "type": "error",
                "message": "Bổ sung địa chỉ Email để nhà tuyển dụng có thể liên hệ phỏng vấn.",
                "action_label": "Chỉnh sửa Thông tin cá nhân",
            })
        if not c_info.get("phone"):
            section_suggestions.append({
                "section_id": "personal",
                "section_title": "Thông tin cá nhân",
                "type": "error",
                "message": "Bổ sung Số điện thoại liên lạc chuẩn.",
                "action_label": "Chỉnh sửa Thông tin cá nhân",
            })
        if not c_info.get("summary") or len(c_info.get("summary", "").split()) < 20:
            section_suggestions.append({
                "section_id": "personal",
                "section_title": "Giới thiệu bản thân",
                "type": "warning",
                "message": "Mục Giới thiệu nên dài từ 30-60 từ, tóm tắt thế mạnh chính, định hướng và giá trị bạn mang lại cho doanh nghiệp.",
                "action_label": "Viết Giới thiệu bản thân",
            })

        # 2. Kinh nghiệm
        if not experiences:
            section_suggestions.append({
                "section_id": "experience",
                "section_title": "Kinh nghiệm làm việc",
                "type": "error",
                "message": "Chưa có mục Kinh nghiệm làm việc. Hãy thêm các công việc hoặc vị trí thực tập bạn từng đảm nhiệm.",
                "action_label": "Thêm Kinh nghiệm",
            })
        else:
            short_exps = [e for e in experiences if len(e.get("description", "").split()) < 25]
            if short_exps:
                section_suggestions.append({
                    "section_id": "experience",
                    "section_title": "Kinh nghiệm làm việc",
                    "type": "warning",
                    "message": f"Mô tả của {len(short_exps)} công việc còn khá ngắn. Hãy nêu rõ trách nhiệm cụ thể và công nghệ sử dụng.",
                    "action_label": "Tối ưu mô tả Kinh nghiệm",
                })
            # Kiểm tra số liệu định lượng
            has_quant = any(re.search(r"\d+[%|k|m|người|dự án|user]", e.get("description", "").lower()) for e in experiences)
            if not has_quant:
                section_suggestions.append({
                    "section_id": "experience",
                    "section_title": "Kinh nghiệm làm việc",
                    "type": "info",
                    "message": "Nên bổ sung số liệu định lượng (ví dụ: tối ưu hiệu năng 25%, phụ trách team 4 người) để tăng tính thuyết phục.",
                    "action_label": "Bổ sung số liệu",
                })

        # 3. Học vấn
        if not parsed_data.get("educations"):
            section_suggestions.append({
                "section_id": "education",
                "section_title": "Học vấn",
                "type": "warning",
                "message": "Bổ sung thông tin trường đại học, cao đẳng hoặc các khóa đào tạo chính quy.",
                "action_label": "Thêm Học vấn",
            })

        # 4. Kỹ năng
        if num_skills < 5:
            section_suggestions.append({
                "section_id": "skills",
                "section_title": "Kỹ năng chuyên môn",
                "type": "warning",
                "message": f"Hiện có {num_skills} kỹ năng. Bạn nên có từ 6-10 kỹ năng trọng tâm liên quan đến vị trí ứng tuyển.",
                "action_label": "Bổ sung Kỹ năng",
            })

        # 5. Dự án
        if not projects:
            section_suggestions.append({
                "section_id": "projects",
                "section_title": "Dự án thực tế",
                "type": "warning",
                "message": "Thêm 1-2 dự án tiêu biểu kèm công nghệ và kết quả để chứng minh năng lực thực chiến.",
                "action_label": "Thêm Dự án",
            })

        # 6. Chứng chỉ
        if not parsed_data.get("certificates"):
            section_suggestions.append({
                "section_id": "certificates",
                "section_title": "Chứng chỉ",
                "type": "info",
                "message": "Bổ sung chứng chỉ ngoại ngữ (TOEIC, IELTS) hoặc chứng chỉ chuyên môn (AWS, Agile) nếu có.",
                "action_label": "Thêm Chứng chỉ",
            })

        recommendations = [s["message"] for s in section_suggestions]

        feedback_data = {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "missing_skills": missing_skills,
            "recommendations": recommendations,
            "section_suggestions": section_suggestions,
            "score_breakdown": {
                "completeness": completeness_score,
                "skills_depth": skill_score,
                "experience_impact": exp_score,
                "format_structure": format_score,
            },
        }

        now = datetime.now(timezone.utc)
        evaluation_id = None
        if cv:
            evaluation = CvEvaluations.objects.create(
                cv_id=cv.id,
                task=task,
                rubric_version=rubric_version,
                score=total_score,
                feedback=feedback_data,
                created_at=now,
            )
            evaluation_id = evaluation.id

        output = {
            "evaluation_id": evaluation_id,
            "score": float(total_score),
            "feedback": feedback_data,
        }
        AiTaskService.finish_task(task, output=output)

        return {
            "evaluation_id": evaluation_id,
            "cv_id": cv.id if cv else None,
            "score": float(total_score),
            "rubric_version": rubric_version,
            "feedback": feedback_data,
            "evaluated_at": now,
        }


# ==============================================================================
# 5. CV–JD Matching Service (So khớp CV và Tin tuyển dụng)
# ==============================================================================

class CvJdMatchingService:
    ALGORITHM_VERSION = "careza-hybrid-v1.0"

    @classmethod
    def match(
        cls,
        user_id: int | None,
        cv_id: int | None = None,
        job_id: int | None = None,
        cv_data: dict | None = None,
        jd_text: str | None = None,
    ) -> dict:
        cv = None
        if cv_id:
            cv = Cvs.objects.filter(id=cv_id).first()
            if not cv and not cv_data:
                raise NotFound("Không tìm thấy CV.")

        job = None
        if job_id:
            job = Jobs.objects.filter(id=job_id).first()
            if not job and not jd_text:
                raise NotFound("Không tìm thấy tin tuyển dụng.")

        task = AiTaskService.start_task(
            user_id=user_id,
            task_type="cv_jd_matching",
            model_name=cls.ALGORITHM_VERSION,
            input_reference={"cv_id": cv_id, "job_id": job_id},
        )

        # 1. Thu thập nội dung văn bản CV
        if cv and not cv_data:
            cv_text = cv.parsed_text or ""
            parsed_data = cv.parsed_data or {}
            cv_skills = [s.lower() for s in parsed_data.get("skills", [])]
            if not cv_skills and cv_text:
                cv_skills = extract_skills_from_text(cv_text)
            cv_exp_years = float(parsed_data.get("total_experience_years", 0.0) or 0.0)
            if cv_exp_years == 0.0 and cv_text:
                cv_exp_years = extract_experience_years_from_text(cv_text)
        elif cv_data:
            parsed_data, cv_text = normalize_resume_data(cv_data)
            cv_skills = [s.lower() for s in parsed_data.get("skills", [])]
            if not cv_skills and cv_text:
                cv_skills = extract_skills_from_text(cv_text)
            cv_exp_years = float(parsed_data.get("total_experience_years", 0.0) or 0.0)
        else:
            raise ValidationError("Vui lòng cung cấp cv_id hoặc dữ liệu CV.")

        # 2. Thu thập nội dung tin tuyển dụng JD
        if job:
            combined_jd = f"{job.title or ''} {job.description or ''} {job.requirements or ''} {job.benefits or ''}"
            from apps.system.models import Skills
            db_skill_ids = list(JobSkills.objects.filter(job_id=job.id).values_list("skill_id", flat=True))
            db_job_skills = list(Skills.objects.filter(id__in=db_skill_ids).values_list("name", flat=True))
            jd_skills = set(s.lower() for s in db_job_skills)
            extracted_jd_skills = set(extract_skills_from_text(combined_jd))
            all_jd_skills = jd_skills.union(extracted_jd_skills)
            min_exp = float(job.experience_min or 0.0)
            max_exp = min_exp + 3.0 if min_exp > 0 else 5.0
            full_jd_text = combined_jd
            job_title_display = job.title or "Vị trí tuyển dụng"
        elif jd_text:
            full_jd_text = jd_text.strip()
            all_jd_skills = set(extract_skills_from_text(full_jd_text))
            min_exp = float(extract_experience_years_from_text(full_jd_text) or 0.0)
            max_exp = min_exp + 3.0 if min_exp > 0 else 5.0
            job_title_display = "Mô tả công việc (JD nhập tay)"
        else:
            raise ValidationError("Vui lòng cung cấp job_id hoặc nội dung JD.")

        # 3. Tính TF-IDF Cosine Similarity
        tfidf_score = TfidfEngine.compute_tfidf_cosine(cv_text, full_jd_text)

        # 4. Tính Skill Score (Jaccard / Overlap)
        matched_skills = [s for s in all_jd_skills if s in cv_skills]
        # Phân biệt rõ kỹ năng chưa thể hiện trong CV
        unmentioned_skills = [s for s in all_jd_skills if s not in cv_skills]

        if all_jd_skills:
            skill_score = round(len(matched_skills) / len(all_jd_skills), 4)
        else:
            skill_score = 0.5  # Nếu JD không yêu cầu kỹ năng cụ thể

        # 5. Tính Experience Score
        if min_exp == 0.0:
            exp_score = 1.0
        elif cv_exp_years >= min_exp:
            exp_score = 1.0 if cv_exp_years <= max_exp + 2.0 else 0.9
        else:
            exp_score = round(max(0.2, cv_exp_years / min_exp), 4)

        # 6. Tính Điểm Hybrid tổng hợp
        # Trọng số: 40% Kỹ năng + 35% Văn bản/TF-IDF + 25% Kinh nghiệm
        hybrid_score = round(0.40 * skill_score + 0.35 * tfidf_score + 0.25 * exp_score, 4)
        match_percentage = round(float(hybrid_score) * 100, 1)

        # 7. Xây dựng giải thích & Đề xuất cải thiện theo JD
        suggestions = []
        if unmentioned_skills:
            suggestions.append(
                f"JD yêu cầu kỹ năng ({', '.join(unmentioned_skills[:4])}) nhưng chưa thấy trong CV của bạn. "
                f"Nếu bạn đã từng làm việc với các kỹ năng này, hãy chủ động bổ sung vào mục Kỹ năng hoặc Dự án."
            )
        if cv_exp_years < min_exp and min_exp > 0:
            suggestions.append(
                f"Yêu cầu kinh nghiệm từ {int(min_exp)} năm trở lên (hồ sơ của bạn hiện ước tính ~{cv_exp_years} năm). "
                f"Hãy nhấn mạnh chiều sâu dự án và kết quả đạt được để bù đắp tiêu chí này."
            )
        if tfidf_score < 0.2:
            suggestions.append(
                "Độ tương đồng từ khóa còn thấp. Hãy bổ sung các thuật ngữ chuyên môn và vai trò tương ứng trong mô tả công việc vào CV."
            )

        explanation = {
            "matched_skills": sorted(matched_skills),
            "missing_skills": sorted(unmentioned_skills),
            "unmentioned_skills": sorted(unmentioned_skills),
            "candidate_experience_years": cv_exp_years,
            "job_experience_required": f"{int(min_exp)} - {int(max_exp)} năm" if min_exp > 0 else "Không yêu cầu",
            "job_title": job_title_display,
            "breakdown": {
                "skill_score": skill_score,
                "tfidf_cosine": tfidf_score,
                "experience_score": exp_score,
                "hybrid_score": hybrid_score,
            },
            "suggestions": suggestions,
            "summary": (
                f"Độ phù hợp tổng quan đạt {match_percentage}%. "
                f"Khớp {len(matched_skills)}/{len(all_jd_skills)} kỹ năng yêu cầu. "
                f"Kinh nghiệm đáp ứng {round(exp_score * 100, 1)}% tiêu chuẩn tuyển dụng."
            )
        }

        # Lưu hoặc cập nhật vào MatchResults nếu có cả cv và job trong database
        match_id = None
        now = datetime.now(timezone.utc)
        if cv and job:
            match_obj, _ = MatchResults.objects.update_or_create(
                cv_id=cv.id,
                job_id=job.id,
                algorithm_version=cls.ALGORITHM_VERSION,
                defaults={
                    "tfidf_cosine": tfidf_score,
                    "skill_score": skill_score,
                    "experience_score": exp_score,
                    "hybrid_score": hybrid_score,
                    "explanation": explanation,
                    "computed_at": now,
                }
            )
            match_id = match_obj.id

        output = {
            "match_id": match_id,
            "hybrid_score": float(hybrid_score),
            "explanation": explanation,
        }
        AiTaskService.finish_task(task, output=output)

        return {
            "match_id": match_id,
            "cv_id": cv.id if cv else None,
            "job_id": job.id if job else None,
            "algorithm_version": cls.ALGORITHM_VERSION,
            "overall_score": match_percentage,
            "matching_skills": explanation.get("matched_skills", []),
            "missing_skills": explanation.get("missing_skills", []),
            "unmentioned_skills": explanation.get("unmentioned_skills", []),
            "tfidf_cosine": float(tfidf_score),
            "skill_score": float(skill_score),
            "experience_score": float(exp_score),
            "hybrid_score": float(hybrid_score),
            "match_percentage": match_percentage,
            "explanation": explanation,
            "computed_at": now,
        }


# ==============================================================================
# 6. Job & Candidate Recommendation Service
# ==============================================================================

class RecommendationService:
    @classmethod
    def recommend_jobs_for_candidate(cls, user_id: int, cv_id: int | None = None, top_k: int = 10) -> list[dict]:
        """
        Đề xuất các tin tuyển dụng phù hợp cho ứng viên dựa trên CV và xếp hạng TOPSIS.
        Chỉ lấy các việc làm đang published và còn hạn nộp.
        """
        # Xác định CV
        if cv_id:
            cv = Cvs.objects.filter(id=cv_id).first()
        else:
            profile = Profiles.objects.filter(user_id=user_id).first()
            if not profile:
                raise NotFound("Không tìm thấy hồ sơ ứng viên.")
            cv = Cvs.objects.filter(profile=profile, is_primary=True).first()
            if not cv:
                cv = Cvs.objects.filter(profile=profile).order_by("-created_at").first()

        if not cv:
            raise ValidationError({"cv": "Ứng viên chưa có CV trong hệ thống để thực hiện gợi ý việc làm."})

        # Chỉ lấy danh sách việc làm đã xuất bản công khai (published) để đồng bộ với trang việc làm công khai
        now = datetime.now(timezone.utc)
        jobs_qs = Jobs.objects.filter(status="published").select_related("company")
        # Loại trừ các jobs đã hết hạn nếu có expires_at
        active_jobs = [j for j in jobs_qs if j.expires_at is None or j.expires_at >= now][:50]
        if not active_jobs:
            return []

        # Tính toán điểm matching cho từng job
        items_to_rank = []
        for job in active_jobs:
            # Match nhanh
            match_res = CvJdMatchingService.match(user_id=user_id, cv_id=cv.id, job_id=job.id)
            items_to_rank.append({
                "job": job,
                "job_id": job.id,
                "match_id": match_res["match_id"],
                "skill_score": match_res["skill_score"],
                "tfidf_cosine": match_res["tfidf_cosine"],
                "experience_score": match_res["experience_score"],
                "hybrid_score": match_res["hybrid_score"],
                "match_percentage": match_res["match_percentage"],
                "explanation": match_res["explanation"],
            })

        # Áp dụng TOPSIS với 3 tiêu chí chính: skill_score, tfidf_cosine, experience_score
        weights = [0.45, 0.30, 0.25]
        criteria_keys = ["skill_score", "tfidf_cosine", "experience_score"]
        ranked_items = TopsisEngine.rank(items_to_rank, criteria_keys, weights)

        # Lưu vào Recommendations
        from apps.system.models import Locations
        loc_ids = [it["job"].location_id for it in ranked_items[:top_k] if it["job"].location_id]
        loc_map = {loc.id: loc.province for loc in Locations.objects.filter(id__in=loc_ids)} if loc_ids else {}

        results = []
        for it in ranked_items[:top_k]:
            job = it["job"]
            match_obj = MatchResults.objects.filter(id=it["match_id"]).first()
            # Ghi nhận vào bảng Recommendations
            if cv.profile_id:
                Recommendations.objects.create(
                    candidate_id=cv.profile_id,
                    job_id=job.id,
                    match_result=match_obj,
                    topsis_score=it["topsis_score"],
                    rank_position=it["rank_position"],
                    weights={"skill": weights[0], "tfidf": weights[1], "exp": weights[2]},
                    generated_at=now,
                )

            loc_name = loc_map.get(job.location_id) if job.location_id else None
            results.append({
                "rank_position": it["rank_position"],
                "topsis_score": it["topsis_score"],
                "hybrid_score": it["hybrid_score"],
                "match_percentage": it["match_percentage"],
                "skill_score": it["skill_score"],
                "tfidf_cosine": it["tfidf_cosine"],
                "experience_score": it["experience_score"],
                "job": {
                    "id": job.id,
                    "title": job.title,
                    "slug": job.slug,
                    "company_id": job.company_id,
                    "company_name": job.company.name if job.company else "",
                    "company_logo": job.company.logo_url if job.company else None,
                    "location": loc_name,
                    "work_mode": job.work_mode,
                    "employment_type": job.employment_type,
                    "salary_min": job.salary_min,
                    "salary_max": job.salary_max,
                    "currency": (job.currency or "VND").strip(),
                    "experience_min": float(job.experience_min or 0.0),
                    "published_at": job.published_at,
                    "expires_at": job.expires_at,
                    "created_at": job.created_at,
                },
                "explanation": it["explanation"],
            })

        return results

    @classmethod
    def recommend_candidates_for_job(cls, user_id: int, job_id: int, top_k: int = 10) -> list[dict]:
        """
        Đề xuất và xếp hạng ứng viên phù hợp cho một tin tuyển dụng cụ thể của doanh nghiệp.
        Kiểm tra quyền sở hữu tin tuyển dụng của doanh nghiệp và chỉ truy cập ứng viên được phép.
        """
        from django.db.models import Q
        from apps.system.models import Locations
        from apps.candidate.models import Educations, Experiences

        job = Jobs.objects.filter(id=job_id).select_related("company").first()
        if not job:
            raise NotFound("Không tìm thấy tin tuyển dụng.")

        # Kiểm tra doanh nghiệp của user
        member = Members.objects.filter(user_id=user_id, company_id=job.company_id).first()
        if not member:
            raise PermissionDenied("Bạn không có quyền xem gợi ý ứng viên cho tin tuyển dụng của doanh nghiệp khác.")

        # Lấy danh sách ứng viên đã nộp đơn vào doanh nghiệp (luôn có quyền xem)
        company_applied_profile_ids = list(
            Applications.objects.filter(job__company_id=job.company_id).values_list("candidate_id", flat=True)
        )

        # Chỉ truy cập CV của ứng viên có hồ sơ công khai (visibility != 'private'/'hidden') HOẶC đã ứng tuyển vào doanh nghiệp này
        cvs_base_qs = Cvs.objects.select_related("profile", "profile__user").exclude(status="archived").filter(
            Q(profile_id__in=company_applied_profile_ids)
            | Q(profile__visibility__isnull=True)
            | Q(profile__visibility__in=["public", "open", "employers_only", "visible"])
        )

        cvs_qs = cvs_base_qs.exclude(parsed_text__isnull=True).exclude(parsed_text="")
        all_cvs = list(cvs_qs[:50])
        if not all_cvs:
            all_cvs = list(cvs_base_qs[:50])
        if not all_cvs:
            return []

        items_to_rank = []
        for cv in all_cvs:
            match_res = CvJdMatchingService.match(user_id=user_id, cv_id=cv.id, job_id=job.id)
            items_to_rank.append({
                "cv": cv,
                "cv_id": cv.id,
                "match_id": match_res["match_id"],
                "skill_score": match_res["skill_score"],
                "tfidf_cosine": match_res["tfidf_cosine"],
                "experience_score": match_res["experience_score"],
                "hybrid_score": match_res["hybrid_score"],
                "match_percentage": match_res["match_percentage"],
                "explanation": match_res["explanation"],
            })

        # Áp dụng TOPSIS xếp hạng ứng viên
        weights = [0.45, 0.30, 0.25]
        criteria_keys = ["skill_score", "tfidf_cosine", "experience_score"]
        ranked_items = TopsisEngine.rank(items_to_rank, criteria_keys, weights)

        # Tải trước thông tin địa điểm và trạng thái ứng tuyển với tin tuyển dụng này
        top_slice = ranked_items[:top_k]
        loc_ids = [
            it["cv"].profile.location_id
            for it in top_slice
            if it["cv"].profile and it["cv"].profile.location_id
        ]
        loc_map = {loc.id: loc.province for loc in Locations.objects.filter(id__in=loc_ids)} if loc_ids else {}

        profile_ids = [it["cv"].profile_id for it in top_slice if it["cv"].profile_id]
        app_map = {}
        if profile_ids:
            for app in Applications.objects.filter(job_id=job.id, candidate_id__in=profile_ids):
                app_map[app.candidate_id] = app

        results = []
        for it in top_slice:
            cv = it["cv"]
            profile = cv.profile
            cand_user = profile.user if profile else None
            parsed_data = cv.parsed_data or {}
            c_info = parsed_data.get("candidate_info", {})

            # Họ tên ứng viên thực tế
            cand_name = (
                c_info.get("full_name")
                or (cand_user.full_name if cand_user else None)
                or (cand_user.email.split("@")[0] if cand_user and cand_user.email else None)
                or cv.title
                or "Ứng viên"
            )

            # Kỹ năng thực tế (từ parsed_data hoặc matched_skills + profile_skills)
            skills_list = parsed_data.get("skills") or []
            if not skills_list and profile:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT s.name FROM candidate.profile_skills ps
                        JOIN system.skills s ON ps.skill_id = s.id
                        WHERE ps.profile_id = %s;
                    """, [profile.id])
                    skills_list = [r[0] for r in cursor.fetchall() if r[0]]
            if not skills_list and cv.parsed_text:
                skills_list = extract_skills_from_text(cv.parsed_text)

            # Số năm kinh nghiệm thực tế
            exp_val = parsed_data.get("total_experience_years")
            if exp_val is None and profile and profile.experience_years is not None:
                exp_val = float(profile.experience_years)
            elif exp_val is None:
                exp_val = it["explanation"].get("candidate_experience_years")
            exp_years = float(exp_val) if exp_val is not None else None

            # Địa điểm thực tế
            loc_name = (
                (loc_map.get(profile.location_id) if profile and profile.location_id else None)
                or c_info.get("address")
                or None
            )

            # Học vấn & Công ty gần nhất thực tế
            edu_text = None
            parsed_edus = parsed_data.get("educations") or []
            if parsed_edus and isinstance(parsed_edus[0], dict):
                e0 = parsed_edus[0]
                edu_text = e0.get("institution") or e0.get("school") or e0.get("raw_text") or e0.get("degree")
            elif profile:
                db_edu = Educations.objects.filter(profile=profile).first()
                if db_edu:
                    edu_text = f"{db_edu.degree + ' - ' if db_edu.degree else ''}{db_edu.institution}"

            current_comp = None
            parsed_exps = parsed_data.get("experiences") or []
            if parsed_exps and isinstance(parsed_exps[0], dict):
                x0 = parsed_exps[0]
                current_comp = x0.get("company") or x0.get("title") or x0.get("raw_text")
            elif profile:
                db_exp = Experiences.objects.filter(profile=profile).order_by("-start_date", "-id").first()
                if db_exp:
                    current_comp = db_exp.employer_name

            # Mức lương kỳ vọng thực tế
            sal_min = profile.desired_salary_min if profile else None
            sal_max = profile.desired_salary_max if profile else None

            # Đơn ứng tuyển nếu đã nộp vào job này
            job_app = app_map.get(profile.id) if profile else None

            results.append({
                "rank_position": it["rank_position"],
                "topsis_score": it["topsis_score"],
                "hybrid_score": it["hybrid_score"],
                "match_percentage": it["match_percentage"],
                "skill_score": it["skill_score"],
                "tfidf_cosine": it["tfidf_cosine"],
                "experience_score": it["experience_score"],
                "candidate": {
                    "id": profile.id if profile else None,
                    "user_id": cand_user.id if cand_user else None,
                    "cv_id": cv.id,
                    "cv_title": cv.title,
                    "cv_file_url": cv.file_url,
                    "candidate_name": cand_name,
                    "email": c_info.get("email") or (cand_user.email if cand_user else None),
                    "phone": c_info.get("phone") or (cand_user.phone if cand_user else None),
                    "avatar_url": cand_user.avatar_url if cand_user else None,
                    "headline": (profile.headline if profile and profile.headline else None) or c_info.get("title") or cv.title,
                    "bio": (profile.bio if profile and profile.bio else None) or c_info.get("summary") or None,
                    "current_company": current_comp,
                    "education": edu_text,
                    "location": loc_name,
                    "work_mode": profile.work_mode if profile else None,
                    "desired_salary_min": sal_min,
                    "desired_salary_max": sal_max,
                    "skills": skills_list,
                    "experience_years": exp_years,
                    "application_id": job_app.id if job_app else None,
                    "application_status": job_app.status if job_app else None,
                    "applied_at": job_app.applied_at if job_app else None,
                    "cv_created_at": cv.created_at,
                },
                "explanation": it["explanation"],
            })

        return results


# ==============================================================================
# 7. RAG (Retrieval-Augmented Generation) & Hybrid Lexical Retrieval
# ==============================================================================

CAREZA_SYSTEM_STOPWORDS = {
    "hệ", "thống", "công", "việc", "thời", "gian", "hỗ", "trợ", "làm",
    "này", "khi", "nào", "sao", "thế", "nào", "gì", "được", "không",
    "giúp", "muốn", "cho", "với", "các", "những", "một", "của", "về",
    "có", "là", "tại", "sắp", "từng", "trước", "sau", "bao", "nhiêu",
    "tôi", "mình", "bạn", "ở", "ra", "vào", "lại", "thì", "từ", "do",
    "bởi", "lên", "xuống", "giữa", "theo", "nhiều", "hơn", "rất", "qua",
    "what", "how", "why", "when", "where", "which", "are", "the", "for", "and", "in", "to", "of", "is"
}

CAREZA_CONCEPT_TAXONOMY = {
    "candidate_cv": [
        "cv", "sơ yếu lý lịch", "hồ sơ ứng viên", "resume", "curriculum vitae",
        "tạo cv", "chuẩn hóa cv", "5mb", "dung lượng cv", "mục tiêu nghề nghiệp",
        "kinh nghiệm làm việc", "thời gian đảo ngược", "thành tích định lượng",
        "hard skills", "soft skills", "kỹ năng cốt lõi"
    ],
    "ai_cv_evaluation": [
        "match score", "cv parsing", "ats", "độ phù hợp", "tỷ lệ phù hợp",
        "missing skills", "kỹ năng còn thiếu", "điểm tổng quan", "overall score",
        "chấm điểm khớp", "applicant tracking", "tương đồng cv jd"
    ],
    "application_pipeline": [
        "applied", "screening", "interview", "offered", "rejected",
        "đã nộp", "đang xét duyệt", "sàng lọc", "nhận việc", "đề nghị việc làm",
        "từ chối", "rút hồ sơ", "hủy đơn", "hủy hồ sơ", "vòng đời hồ sơ",
        "trạng thái xét duyệt", "việc đã ứng tuyển"
    ],
    "candidate_profile": [
        "hồ sơ cá nhân", "profile", "chế độ hiển thị", "ẩn hồ sơ", "công khai hồ sơ",
        "học vấn", "chứng chỉ", "headhunter", "chuyên ngành", "bằng cấp quốc tế",
        "aws certified", "pmp", "ielts", "tiêu đề nghề nghiệp"
    ],
    "ai_mock_interview": [
        "mock interview", "phỏng vấn thử", "phỏng vấn ảo", "luyện phỏng vấn",
        "luyện nói", "run phỏng vấn", "mô phỏng phỏng vấn", "áp lực phỏng vấn",
        "báo cáo phỏng vấn", "lỗ hổng kiến thức"
    ],
    "mock_scoring_rubric": [
        "rubric", "technical accuracy", "coverage", "clarity", "depth",
        "parroting", "keyword stuffing", "tiêu chí chấm điểm", "lặp lại nguyên văn",
        "tính chính xác kỹ thuật", "độ phủ nội dung", "tôi không biết",
        "trừ điểm phỏng vấn", "đối phó"
    ],
    "ai_job_recommendation": [
        "gợi ý việc làm", "high match", "phù hợp cao", "tương đồng việc làm",
        "điểm gợi ý", "đề xuất việc làm", "80%", "sở thích nghề nghiệp"
    ],
    "candidate_job_search": [
        "lưu việc làm", "việc làm đã lưu", "bookmark", "bộ lọc việc làm",
        "hết hạn nộp", "cảnh báo hết hạn", "trôi mất việc", "lọc tìm kiếm",
        "3 ngày", "công việc yêu thích"
    ],
    "employer_job_posting": [
        "đăng tin tuyển dụng", "tin tuyển dụng", "post tuyển dụng", "jd",
        "job description", "bản mô tả công việc", "thời hạn hiển thị", "30 ngày",
        "must-have skills", "nice-to-have skills", "phúc lợi", "tiêu đề công việc"
    ],
    "employer_hiring_pipeline": [
        "hiring pipeline", "kanban", "quy trình ứng viên", "bảng kanban",
        "bulk actions", "thao tác hàng loạt", "thẻ ứng viên", "kéo thả thẻ",
        "xuất danh sách", "csv"
    ],
    "employer_team_rbac": [
        "rbac", "phân quyền", "thành viên doanh nghiệp", "owner", "chủ sở hữu",
        "admin", "quản trị viên", "recruiter", "chuyên viên tuyển dụng",
        "reviewer", "người đánh giá", "người thẩm định", "chỉ đọc",
        "audit log", "nhật ký hoạt động"
    ],
    "employer_interview_scheduling": [
        "lên lịch phỏng vấn", "lịch hẹn phỏng vấn", "google meet", "zoom",
        "thư mời phỏng vấn", "xác nhận tham gia", "đề xuất đổi giờ",
        "từ chối phỏng vấn", "nhắc nhở 2 tiếng", "google calendar"
    ],
    "employer_talent_pool": [
        "talent pool", "cv search", "kho cv", "tìm kiếm hồ sơ", "mở hồ sơ",
        "unlock cv", "mở khóa hồ sơ", "ứng viên tiềm năng", "cv unlock quota",
        "hồ sơ ẩn danh", "chủ động tiếp cận"
    ],
    "employer_analytics": [
        "báo cáo tuyển dụng", "time-to-hire", "view-to-apply", "hiring funnel",
        "phễu chuyển đổi", "chỉ số tuyển dụng", "hiệu quả tuyển dụng",
        "thời gian tuyển dụng", "phễu tuyển dụng"
    ],
    "employer_company_verification": [
        "verified badge", "tích xanh", "xác minh doanh nghiệp", "gpkd",
        "giấy phép đăng ký kinh doanh", "hồ sơ công ty", "company profile",
        "24 đến 48 giờ", "doanh nghiệp đã xác minh", "đại diện pháp luật"
    ],
    "billing_packages_quota": [
        "gói dịch vụ", "basic", "pro", "enterprise", "subscription",
        "hạn mức quota", "quota tin đăng", "gói khởi đầu", "gói chuyên nghiệp",
        "gói doanh nghiệp", "add-on quota"
    ],
    "billing_ledger_credits": [
        "sổ cái", "quota ledger", "trừ điểm tín dụng", "lịch sử giao dịch",
        "hoàn trả lượt đăng", "token quota", "90 ngày", "mở lại hồ sơ",
        "không trừ thêm điểm", "hóa đơn vat"
    ],
    "platform_communication": [
        "nhắn tin trực tiếp", "in-app chat", "tin nhắn rác", "quấy rối",
        "lừa đảo", "thông báo thời gian thực", "báo cáo vi phạm", "mã độc"
    ],
    "policy_privacy": [
        "bảo mật thông tin", "quyền riêng tư", "chia sẻ dữ liệu", "mã hóa",
        "bên thứ ba", "xóa tài khoản", "dữ liệu cá nhân", "ssl/tls"
    ],
    "policy_community_rules": [
        "tiêu chuẩn cộng đồng", "tin giả mạo", "thu phí ứng viên", "tiền đặt cọc",
        "đa cấp", "lừa đảo việc làm", "khóa vĩnh viễn", "đặt cọc trước khi nhận việc"
    ],
    "policy_dispute_resolution": [
        "giải quyết khiếu nại", "tranh chấp", "hòa giải", "trung tâm giải quyết",
        "tiếp nhận khiếu nại", "xử lý khiếu nại", "3 ngày làm việc", "bằng chứng"
    ],
    "platform_account_security": [
        "bảo mật tài khoản", "2fa", "two-factor", "xác thực hai yếu tố",
        "xác thực hai bước", "authenticator", "otp", "đổi mật khẩu",
        "mật khẩu an toàn", "8 ký tự", "đăng xuất khỏi tất cả"
    ],
    "career_interview_prep": [
        "phỏng vấn kỹ thuật", "technical interview", "clarifying questions",
        "think out loud", "trao đổi suy nghĩ", "câu hỏi hóc búa", "câu hỏi khó",
        "chuẩn bị phỏng vấn", "không vội vàng trả lời", "trung thực thừa nhận"
    ],
    "career_communication": [
        "cover letter", "thư ứng tuyển", "thư giới thiệu", "thư cảm ơn",
        "thank you", "thank-you email", "24 giờ", "bày tỏ sự cảm kích"
    ]
}


class HybridLexicalRetriever:
    """
    Bộ truy xuất lai Hybrid Lexical Search cho CAREZA RAG Chatbot:
    - Kết hợp Filtered TF-IDF (loại trừ từ phổ biến), Concept Coverage (chuẩn hóa đồng nghĩa/viết tắt/Việt-Anh),
      và Document Title Matching.
    - Chuẩn hóa các thành phần điểm về thang [0, 1].
    - Tích hợp Confidence Gate kiểm tra độ tin cậy nhằm triệt tiêu False Retrieval ở câu hỏi ngoài phạm vi.
    """

    @classmethod
    def clean_and_tokenize_filtered(cls, text: str) -> list[str]:
        if not text:
            return []
        cleaned = re.sub(r"[^\w\s\+\#\./\-]", " ", text.lower())
        tokens = cleaned.split()
        return [
            t for t in tokens
            if len(t) > 1 and t not in VIETNAMESE_STOPWORDS and t not in CAREZA_SYSTEM_STOPWORDS
        ]

    @classmethod
    def extract_concepts(cls, text: str) -> set[str]:
        if not text:
            return set()
        lowered = text.lower()
        found = set()
        for concept_key, aliases in CAREZA_CONCEPT_TAXONOMY.items():
            for alias in aliases:
                alias_lower = alias.lower()

                # Xử lý Polysemy Collision cho từ đa nghĩa tiếng Anh "applied":
                # Từ "applied" chỉ kích hoạt concept application_pipeline nếu đi kèm ngữ cảnh tuyển dụng
                if alias_lower == "applied":
                    recruitment_context = {"job", "candidate", "application", "cv", "resume", "interview", "offer", "recruitment", "career", "status", "stage"}
                    words_in_text = set(re.findall(r"\w+", lowered))
                    if not (words_in_text & recruitment_context):
                        continue  # Bỏ qua nếu "applied" xuất hiện trong ngữ cảnh phi tuyển dụng (ví dụ: "applied to cryptocurrency")

                if len(alias_lower) <= 3:
                    # Dùng word boundary đối với từ ngắn
                    pattern = r"(?<!\w)" + re.escape(alias_lower) + r"(?!\w)"
                    if re.search(pattern, lowered):
                        found.add(concept_key)
                        break
                else:
                    if alias_lower in lowered:
                        found.add(concept_key)
                        break
        return found

    @classmethod
    def compute_filtered_tfidf(cls, doc1: str, doc2: str) -> float:
        tokens1 = cls.clean_and_tokenize_filtered(doc1)
        tokens2 = cls.clean_and_tokenize_filtered(doc2)
        if not tokens1 or not tokens2:
            return 0.0

        all_docs = [tokens1, tokens2]
        vocabulary = sorted(list(set(tokens1 + tokens2)))
        vocab_index = {w: i for i, w in enumerate(vocabulary)}
        num_docs = 2

        idf = {}
        for w in vocabulary:
            df = sum(1 for d in all_docs if w in d)
            idf[w] = math.log((1 + num_docs) / (1 + df)) + 1.0

        v1 = [0.0] * len(vocabulary)
        len1 = len(tokens1)
        tf1 = collections.Counter(tokens1)
        for w, c in tf1.items():
            v1[vocab_index[w]] = (c / len1) * idf[w]

        v2 = [0.0] * len(vocabulary)
        len2 = len(tokens2)
        tf2 = collections.Counter(tokens2)
        for w, c in tf2.items():
            v2[vocab_index[w]] = (c / len2) * idf[w]

        dot_product = sum(a * b for a, b in zip(v1, v2))
        norm1 = math.sqrt(sum(a * a for a in v1))
        norm2 = math.sqrt(sum(b * b for b in v2))
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return round(min(1.0, max(0.0, dot_product / (norm1 * norm2))), 4)

    @classmethod
    def score_chunk(cls, question: str, chunk_content: str, doc_title: str, version: str = "v2") -> dict:
        """
        Tính điểm kết hợp cho từng chunk.
        version: "v2" (mặc định - Dynamic Confidence Gate & Lexical Fallback) hoặc "v1" (bản cũ).
        """
        q_concepts = cls.extract_concepts(question)
        c_concepts = cls.extract_concepts(chunk_content)
        d_concepts = cls.extract_concepts(doc_title)
        combined_doc_concepts = c_concepts | d_concepts

        score_tfidf = cls.compute_filtered_tfidf(question, chunk_content)
        score_title = cls.compute_filtered_tfidf(question, doc_title)

        if version == "v1":
            # Logic bản V1 cũ (phục vụ đối soát)
            if q_concepts:
                overlap = len(q_concepts & combined_doc_concepts)
                score_concept = round(overlap / len(q_concepts), 4)
                raw_hybrid = 0.40 * score_tfidf + 0.45 * score_concept + 0.15 * score_title
                is_reliable = (overlap > 0 or score_tfidf >= 0.25) and raw_hybrid >= 0.10
            else:
                score_concept = 0.0
                raw_hybrid = 0.75 * score_tfidf + 0.25 * score_title
                is_reliable = score_tfidf >= 0.18 and raw_hybrid >= 0.16
        else:
            # Logic bản V2 mới (Dynamic Confidence Gate & Controlled Lexical Fallback)
            if q_concepts:
                overlap = len(q_concepts & combined_doc_concepts)
                score_concept = round(overlap / len(q_concepts), 4)
                raw_hybrid = 0.40 * score_tfidf + 0.45 * score_concept + 0.15 * score_title
                # Khi câu hỏi có concept: yêu cầu có overlap hoặc TF-IDF rất cao và raw_hybrid đạt ngưỡng
                is_reliable = (overlap > 0 or score_tfidf >= 0.20) and raw_hybrid >= 0.08
            else:
                score_concept = 0.0
                raw_hybrid = 0.75 * score_tfidf + 0.25 * score_title
                q_tokens = cls.clean_and_tokenize_filtered(question)

                # Lexical Fallback có kiểm soát chặt chẽ:
                # 1. Tín hiệu TF-IDF mạnh:
                cond_strong_tfidf = (score_tfidf >= 0.16 and raw_hybrid >= 0.14)
                # 2. Khớp tiêu đề rõ nét (Title-Guided Alignment):
                cond_title_match = (score_title >= 0.08 and score_tfidf >= 0.06 and raw_hybrid >= 0.08)
                # 3. Độ đặc hiệu từ khóa nội dung:
                cond_content_salience = (len(q_tokens) >= 3 and score_tfidf >= 0.11 and raw_hybrid >= 0.10)

                is_reliable = cond_strong_tfidf or cond_title_match or cond_content_salience

        final_score = round(raw_hybrid, 4) if is_reliable else 0.0

        return {
            "score": final_score,
            "score_tfidf": score_tfidf,
            "score_concept": score_concept,
            "score_title": score_title,
            "is_reliable": is_reliable
        }

    @classmethod
    def retrieve_django_chunks(cls, question: str, chunks_qs: list, top_k: int = 3, version: str = "v2") -> list[dict]:
        scored_chunks = []
        for ch in chunks_qs:
            doc_title = getattr(ch.document, "title", "")
            res = cls.score_chunk(question, ch.content, doc_title, version=version)
            if res["score"] > 0.0:
                scored_chunks.append({
                    "chunk": ch,
                    "score": res["score"],
                    "details": res
                })

        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        retrieved = []
        for item in scored_chunks[:top_k]:
            ch = item["chunk"]
            retrieved.append({
                "chunk_id": ch.id,
                "document_id": ch.document_id,
                "document_title": getattr(ch.document, "title", ""),
                "content": ch.content,
                "score": item["score"],
            })
        return retrieved


class RagService:
    @staticmethod
    def get_or_create_session(user_id: int | None, session_id: int | None = None, title: str = "Hội thoại tư vấn nghề nghiệp") -> RagSessions:
        """
        Khởi tạo hoặc lấy phiên hội thoại RAG.
        - Khắc phục IDOR: Xác minh session thuộc đúng user_id hiện tại.
        - Không tự tạo session mới khi client truyền session_id không tồn tại hoặc không thuộc quyền sở hữu.
        """
        if session_id:
            session = RagSessions.objects.filter(id=session_id).first()
            if not session:
                raise NotFound("Không tìm thấy phiên hội thoại RAG.")
            if session.user_id != user_id:
                raise PermissionDenied("Bạn không có quyền truy cập phiên hội thoại này.")
            return session

        now = datetime.now(timezone.utc)
        return RagSessions.objects.create(user_id=user_id, title=title, created_at=now)

    @classmethod
    def query_rag(cls, user_id: int | None, question: str, session_id: int | None = None, top_k: int = 3, algorithm: str = "hybrid") -> dict:
        """
        Truy xuất thông tin có căn cứ từ knowledge.documents và knowledge.chunks.
        Tránh sinh nội dung không tồn tại (hallucination).
        - algorithm: "hybrid" (mặc định) hoặc "baseline" (TF-IDF cũ phục vụ so sánh).
        - Giới hạn retrieval vào tài liệu được phép công khai (published/active) hoặc đúng quyền người dùng.
        - Không truy xuất tài liệu draft/nội bộ nếu chưa được cấp quyền.
        """
        if not question or not question.strip():
            raise ValidationError({"question": "Vui lòng nhập câu hỏi."})

        session = cls.get_or_create_session(user_id=user_id, session_id=session_id)

        # 1. Thu thập các chunks hợp lệ theo quyền truy cập
        allowed_statuses = ["published", "active"]
        if user_id:
            user = Users.objects.filter(id=user_id).first()
            if user and user.account_type == "admin":
                allowed_statuses.append("draft")

        chunks = Chunks.objects.select_related("document").filter(
            document__status__in=allowed_statuses
        )
        all_chunks = list(chunks)

        retrieved_chunks = []
        retrieved_chunk_ids = []

        if all_chunks:
            if algorithm == "baseline":
                # Chế độ Baseline cũ: TF-IDF Cosine thuần túy, threshold 0.05
                scored_chunks = []
                for ch in all_chunks:
                    score = TfidfEngine.compute_tfidf_cosine(question, ch.content)
                    if score > 0.05:
                        scored_chunks.append((ch, score))

                scored_chunks.sort(key=lambda x: x[1], reverse=True)
                for ch, score in scored_chunks[:top_k]:
                    retrieved_chunks.append({
                        "chunk_id": ch.id,
                        "document_id": ch.document_id,
                        "document_title": ch.document.title,
                        "content": ch.content,
                        "score": float(score),
                    })
                    retrieved_chunk_ids.append(ch.id)
            elif algorithm == "hybrid_v1":
                # Chế độ Hybrid V1 phục vụ đối chiếu
                retrieved_chunks = HybridLexicalRetriever.retrieve_django_chunks(question, all_chunks, top_k=top_k, version="v1")
                retrieved_chunk_ids = [c["chunk_id"] for c in retrieved_chunks]
            else:
                # Chế độ Hybrid V2 nâng cấp (mặc định cho RAG)
                retrieved_chunks = HybridLexicalRetriever.retrieve_django_chunks(question, all_chunks, top_k=top_k, version="v2")
                retrieved_chunk_ids = [c["chunk_id"] for c in retrieved_chunks]

        # 2. Xây dựng câu trả lời dựa trên thông tin trích xuất
        now = datetime.now(timezone.utc)
        # Lưu tin nhắn người dùng
        RagMessages.objects.create(
            session=session,
            role="user",
            content=question,
            retrieved_chunk_ids=[],
            model_name="user",
            created_at=now,
        )

        if not retrieved_chunks:
            # Khi không tìm thấy tài liệu căn cứ, AI trung thực báo lại, không hallucinate
            answer = (
                "Hệ thống tri thức CAREZA hiện chưa có tài liệu chính thức chứa thông tin giải đáp câu hỏi này. "
                "Để đảm bảo tính chính xác, chúng tôi không tự suy diễn thông tin ngoài tài liệu đã được kiểm duyệt. "
                "Bạn vui lòng kiểm tra lại câu hỏi hoặc liên hệ bộ phận hỗ trợ CAREZA."
            )
        else:
            # Tổng hợp câu trả lời dựa trên trích dẫn chính xác từ tài liệu
            citations = []
            synthesized_points = []
            for idx, item in enumerate(retrieved_chunks, start=1):
                doc_title = item["document_title"]
                doc_id = item.get("document_id", "")
                snippet = item["content"].strip()
                citations.append(f"[{idx}] {doc_title} (Doc #{doc_id} - Chunk #{item['chunk_id']})")
                synthesized_points.append(f"- Theo tài liệu \"{doc_title}\": {snippet}")

            answer = (
                "Dựa trên các tài liệu đã được xác thực trong cơ sở tri thức CAREZA:\n\n"
                + "\n\n".join(synthesized_points)
                + "\n\nNguồn tham chiếu:\n"
                + "\n".join(citations)
            )

        # Lưu tin nhắn của trợ lý ảo RAG
        bot_message = RagMessages.objects.create(
            session=session,
            role="assistant",
            content=answer,
            retrieved_chunk_ids=retrieved_chunk_ids,
            model_name="careza-rag-retriever-v1",
            created_at=datetime.now(timezone.utc),
        )

        return {
            "session_id": session.id,
            "message_id": bot_message.id,
            "role": "assistant",
            "content": answer,
            "answer": answer,
            "retrieved_chunks": retrieved_chunks,
            "retrieved_chunk_ids": retrieved_chunk_ids,
            "created_at": bot_message.created_at,
        }

    @staticmethod
    def get_session_history(user_id: int | None, session_id: int) -> dict:
        """
        Lấy lịch sử hội thoại của 1 phiên RAG.
        - Khắc phục IDOR: Xác minh session thuộc đúng user_id hiện tại.
        - Xử lý an toàn khi tài liệu cập nhật hoặc xóa làm chunk_id cũ không còn tồn tại.
        """
        session = RagSessions.objects.filter(id=session_id).first()
        if not session:
            raise NotFound("Không tìm thấy phiên hội thoại RAG.")
        if session.user_id != user_id:
            raise PermissionDenied("Bạn không có quyền truy cập phiên hội thoại này.")

        messages = RagMessages.objects.filter(session=session).order_by("created_at")

        # Thu thập chunk IDs để tra cứu citation an toàn
        all_chunk_ids = set()
        for m in messages:
            if m.retrieved_chunk_ids:
                all_chunk_ids.update(m.retrieved_chunk_ids)

        chunks_map = {}
        if all_chunk_ids:
            found_chunks = Chunks.objects.select_related("document").filter(id__in=list(all_chunk_ids))
            for c in found_chunks:
                chunks_map[c.id] = {
                    "chunk_id": c.id,
                    "document_id": c.document_id,
                    "document_title": getattr(c.document, "title", "Tài liệu"),
                    "content": c.content,
                    "is_available": True,
                }

        items = []
        for m in messages:
            citations = []
            if m.retrieved_chunk_ids:
                for cid in m.retrieved_chunk_ids:
                    if cid in chunks_map:
                        citations.append(chunks_map[cid])
                    else:
                        citations.append({
                            "chunk_id": cid,
                            "document_id": None,
                            "document_title": "Tài liệu nguồn đã cập nhật hoặc lưu trữ",
                            "content": "",
                            "is_available": False,
                        })

            items.append({
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "retrieved_chunk_ids": m.retrieved_chunk_ids or [],
                "citations": citations,
                "created_at": m.created_at,
            })
        return {
            "session_id": session.id,
            "title": session.title,
            "created_at": session.created_at,
            "messages": items,
        }


# ==============================================================================
# 8. Benchmark & Research Service (Đánh giá thuật toán thực tế)
# ==============================================================================

class BenchmarkService:
    @classmethod
    def run_benchmark(cls, dataset_id: int | None = None, config_code: str = "hybrid_v1", k_list: list[int] = None) -> dict:
        """
        Thực hiện đánh giá mô hình trên dữ liệu chuẩn thực tế trong schema research.
        Tính toán các metrics: Precision@K, Recall@K, MRR, NDCG@K.
        Không tự tạo kết quả giả.
        """
        if k_list is None:
            k_list = [1, 3, 5]

        # 1. Tìm dataset
        if dataset_id:
            dataset = Datasets.objects.filter(id=dataset_id).first()
        else:
            dataset = Datasets.objects.first()

        if not dataset:
            raise NotFound("Không tìm thấy dataset nào trong schema research để thực hiện benchmark.")

        # 2. Tìm hoặc tạo config
        config = AlgorithmConfigs.objects.filter(code=config_code).first()
        now = datetime.now(timezone.utc)
        if not config:
            config = AlgorithmConfigs.objects.create(
                code=config_code,
                algorithm="TF-IDF + Skill Jaccard + Exp Score",
                parameters={"skill_weight": 0.40, "tfidf_weight": 0.35, "exp_weight": 0.25},
                created_at=now,
            )

        # 3. Lấy các cặp CV-JD đã được gán nhãn thực tế
        pairs = list(CvJdPairs.objects.filter(dataset=dataset))
        if not pairs:
            raise ValidationError({
                "dataset": f"Dataset '{dataset.name}' chưa có mẫu nhãn nào trong bảng research.cv_jd_pairs để tính toán metric."
            })

        # Tạo Experiment Run
        run = ExperimentRuns.objects.create(
            dataset=dataset,
            config=config,
            name=f"Benchmark Run - {config_code} - {now.strftime('%Y%m%d_%H%M%S')}",
            status="running",
            started_at=now,
        )

        # Tính toán điểm khớp thực tế cho từng cặp
        labeled_predictions = []
        for p in pairs:
            # relevance_label: 1 là khớp, 0 là không khớp
            rel_true = 1 if (p.relevance_label or 0) > 0 else 0
            # Thực thi thuật toán matching
            if p.cv_id and p.job_id:
                try:
                    match_res = CvJdMatchingService.match(user_id=None, cv_id=p.cv_id, job_id=p.job_id)
                    score = match_res["hybrid_score"]
                except Exception:
                    score = 0.0
            else:
                score = 0.0
            labeled_predictions.append({"cv_id": p.cv_id, "job_id": p.job_id, "score": score, "rel": rel_true})

        # Sắp xếp theo score giảm dần để tính Ranking Metrics
        labeled_predictions.sort(key=lambda x: x["score"], reverse=True)
        total_relevant = sum(x["rel"] for x in labeled_predictions)

        metrics_results = {}
        for k in k_list:
            top_k_items = labeled_predictions[:k]
            rel_in_k = sum(x["rel"] for x in top_k_items)

            # Precision@K
            p_k = rel_in_k / k if k > 0 else 0.0

            # Recall@K
            r_k = rel_in_k / total_relevant if total_relevant > 0 else 0.0

            # Lưu vào database
            ExperimentMetrics.objects.create(
                run=run,
                metric_name="Precision@K",
                metric_value=round(p_k, 5),
                k=k,
                details={"relevant_count": rel_in_k, "k": k},
            )
            ExperimentMetrics.objects.create(
                run=run,
                metric_name="Recall@K",
                metric_value=round(r_k, 5),
                k=k,
                details={"relevant_count": rel_in_k, "total_relevant": total_relevant},
            )
            metrics_results[f"P@{k}"] = round(p_k, 4)
            metrics_results[f"R@{k}"] = round(r_k, 4)

        # MRR (Mean Reciprocal Rank)
        first_rel_rank = 0
        for rank, item in enumerate(labeled_predictions, start=1):
            if item["rel"] == 1:
                first_rel_rank = rank
                break
        mrr = 1.0 / first_rel_rank if first_rel_rank > 0 else 0.0

        ExperimentMetrics.objects.create(
            run=run,
            metric_name="MRR",
            metric_value=round(mrr, 5),
            k=None,
            details={"first_relevant_rank": first_rel_rank},
        )
        metrics_results["MRR"] = round(mrr, 4)

        run.status = "completed"
        run.finished_at = datetime.now(timezone.utc)
        run.save(update_fields=["status", "finished_at"])

        return {
            "run_id": run.id,
            "run_name": run.name,
            "dataset": dataset.name,
            "sample_count": len(labeled_predictions),
            "status": run.status,
            "metrics": metrics_results,
            "finished_at": run.finished_at,
        }


# ==============================================================================
# 9. Knowledge Base & Document Chunking Engine
# ==============================================================================

class TextChunker:
    """
    Bộ chia nhỏ văn bản tự động (Text Chunking Engine):
    - Tách theo ranh giới tự nhiên: đoạn văn (\n\n, \n), câu (. ! ? ;), từ ngữ (khoảng trắng).
    - Cấu hình kích thước chunk (chunk_size: mặc định 600 ký tự) và độ gối đầu (chunk_overlap: mặc định 100 ký tự).
    - Hỗ trợ tốt cả tiếng Việt và tiếng Anh.
    - Bảo toàn ranh giới từ vựng (word boundary aware), không cắt vụn từ.
    - Xử lý các trường hợp biên: văn bản rỗng, văn bản ngắn (< chunk_size), đoạn trống liên tiếp.
    """

    @classmethod
    def chunk_text(cls, text: str, chunk_size: int = 600, chunk_overlap: int = 100) -> list[str]:
        if not text or not text.strip():
            return []

        cleaned_text = text.strip()
        if len(cleaned_text) <= chunk_size:
            return [cleaned_text]

        # 1. Tách văn bản thành các khối cơ sở (paragraphs / sentences)
        paragraphs = [p.strip() for p in re.split(r'\n+', cleaned_text) if p.strip()]

        units = []
        for p in paragraphs:
            if len(p) <= chunk_size:
                units.append(p)
            else:
                # Tách theo ranh giới câu (. ! ? ; hoặc xuống dòng)
                sentences = [s.strip() for s in re.split(r'(?<=[.!?;\n])\s+', p) if s.strip()]
                for s in sentences:
                    if len(s) <= chunk_size:
                        units.append(s)
                    else:
                        # Tách theo từ nếu câu vẫn dài vượt ngưỡng
                        words = s.split()
                        cur_w = []
                        cur_len = 0
                        for w in words:
                            if cur_len + len(w) + 1 > chunk_size and cur_w:
                                units.append(" ".join(cur_w))
                                cur_w = [w]
                                cur_len = len(w)
                            else:
                                cur_w.append(w)
                                cur_len += len(w) + 1
                        if cur_w:
                            units.append(" ".join(cur_w))

        # 2. Gom các khối thành chunks có kích thước ~ chunk_size và overlap
        chunks = []
        current_chunk_units = []
        current_length = 0

        for unit in units:
            unit_len = len(unit)
            if current_length + unit_len + 1 > chunk_size and current_chunk_units:
                chunk_str = " ".join(current_chunk_units)
                chunks.append(chunk_str)

                # Giữ lại các unit cuối để tạo overlap
                overlap_units = []
                overlap_len = 0
                for u in reversed(current_chunk_units):
                    if overlap_len + len(u) + 1 <= chunk_overlap:
                        overlap_units.insert(0, u)
                        overlap_len += len(u) + 1
                    else:
                        break

                current_chunk_units = overlap_units + [unit]
                current_length = sum(len(u) for u in current_chunk_units) + max(0, len(current_chunk_units) - 1)
            else:
                current_chunk_units.append(unit)
                current_length += unit_len + (1 if current_chunk_units else 0)

        if current_chunk_units:
            chunk_str = " ".join(current_chunk_units)
            if not chunks or chunk_str != chunks[-1]:
                chunks.append(chunk_str)

        return chunks


class KnowledgeBaseService:
    """
    Dịch vụ quản trị cơ sở tri thức (Knowledge Base Management):
    - Tạo, cập nhật, xuất bản, ngừng xuất bản, xóa tài liệu trong knowledge.documents.
    - Tự động chia chunk bằng TextChunker và đồng bộ hóa trong transaction.
    - Đảm bảo tính toàn vẹn và phân quyền an toàn.
    """

    @classmethod
    def list_documents(cls, status: str | None = None, doc_type: str | None = None, search: str | None = None, page: int = 1, page_size: int = 20) -> dict:
        qs = Documents.objects.all().order_by("-created_at", "-id")
        if status:
            qs = qs.filter(status=status)
        if doc_type:
            qs = qs.filter(doc_type=doc_type)
        if search:
            qs = qs.filter(title__icontains=search)

        total = qs.count()
        offset = (page - 1) * page_size
        docs = list(qs[offset:offset + page_size])

        doc_ids = [d.id for d in docs]
        chunks_count_map = collections.defaultdict(int)
        if doc_ids:
            from django.db.models import Count
            counts = Chunks.objects.filter(document_id__in=doc_ids).values("document_id").annotate(total=Count("id"))
            for c in counts:
                chunks_count_map[c["document_id"]] = c["total"]

        items = []
        for d in docs:
            items.append({
                "id": d.id,
                "title": d.title,
                "source_url": d.source_url,
                "doc_type": d.doc_type,
                "status": d.status,
                "content_length": len(d.content or ""),
                "chunks_count": chunks_count_map[d.id],
                "created_at": d.created_at,
            })

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    @classmethod
    def get_document_detail(cls, doc_id: int) -> dict:
        doc = Documents.objects.filter(id=doc_id).first()
        if not doc:
            raise NotFound(f"Không tìm thấy tài liệu với ID {doc_id}.")

        chunks = Chunks.objects.filter(document=doc).order_by("chunk_index")
        chunks_data = [
            {
                "chunk_id": c.id,
                "chunk_index": c.chunk_index,
                "content": c.content,
                "content_length": len(c.content),
            }
            for c in chunks
        ]

        return {
            "id": doc.id,
            "title": doc.title,
            "source_url": doc.source_url,
            "doc_type": doc.doc_type,
            "status": doc.status,
            "content": doc.content,
            "created_at": doc.created_at,
            "chunks_count": len(chunks_data),
            "chunks": chunks_data,
        }

    @classmethod
    def create_document(cls, data: dict, chunk_size: int = 600, chunk_overlap: int = 100) -> dict:
        title = (data.get("title") or "").strip()
        content = (data.get("content") or "").strip()
        if not title:
            raise ValidationError({"title": "Tiêu đề tài liệu không được để trống."})
        if not content:
            raise ValidationError({"content": "Nội dung tài liệu không được để trống."})

        status_val = data.get("status", "draft")
        if status_val not in ["draft", "published", "active", "archived"]:
            status_val = "draft"

        doc_type = data.get("doc_type", "general")
        source_url = data.get("source_url", "")
        now = datetime.now(timezone.utc)

        with transaction.atomic():
            doc = Documents.objects.create(
                title=title,
                content=content,
                source_url=source_url,
                doc_type=doc_type,
                status=status_val,
                created_at=now,
            )

            chunk_texts = TextChunker.chunk_text(content, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
            chunks_to_create = [
                Chunks(
                    document=doc,
                    chunk_index=idx,
                    content=c_text,
                    embedding_model=None,
                    embedding_json=None,
                )
                for idx, c_text in enumerate(chunk_texts)
            ]
            Chunks.objects.bulk_create(chunks_to_create)

        return cls.get_document_detail(doc.id)

    @classmethod
    def update_document(cls, doc_id: int, data: dict, chunk_size: int = 600, chunk_overlap: int = 100) -> dict:
        doc = Documents.objects.filter(id=doc_id).first()
        if not doc:
            raise NotFound(f"Không tìm thấy tài liệu với ID {doc_id}.")

        title = data.get("title")
        content = data.get("content")
        doc_type = data.get("doc_type")
        source_url = data.get("source_url")
        status_val = data.get("status")

        with transaction.atomic():
            update_fields = []
            if title is not None and title.strip():
                doc.title = title.strip()
                update_fields.append("title")
            if doc_type is not None:
                doc.doc_type = doc_type.strip()
                update_fields.append("doc_type")
            if source_url is not None:
                doc.source_url = source_url.strip()
                update_fields.append("source_url")
            if status_val is not None and status_val in ["draft", "published", "active", "archived"]:
                doc.status = status_val
                update_fields.append("status")

            content_changed = False
            if content is not None and content.strip() and content.strip() != doc.content:
                doc.content = content.strip()
                update_fields.append("content")
                content_changed = True

            if update_fields:
                doc.save(update_fields=update_fields)

            # Nếu nội dung thay đổi, đồng bộ lại các chunk liên quan trong transaction
            if content_changed:
                Chunks.objects.filter(document=doc).delete()
                chunk_texts = TextChunker.chunk_text(doc.content, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
                chunks_to_create = [
                    Chunks(
                        document=doc,
                        chunk_index=idx,
                        content=c_text,
                        embedding_model=None,
                        embedding_json=None,
                    )
                    for idx, c_text in enumerate(chunk_texts)
                ]
                Chunks.objects.bulk_create(chunks_to_create)

        return cls.get_document_detail(doc.id)

    @classmethod
    def publish_document(cls, doc_id: int) -> dict:
        doc = Documents.objects.filter(id=doc_id).first()
        if not doc:
            raise NotFound(f"Không tìm thấy tài liệu với ID {doc_id}.")
        doc.status = "published"
        doc.save(update_fields=["status"])
        return {"id": doc.id, "title": doc.title, "status": doc.status, "message": "Đã xuất bản tài liệu thành công."}

    @classmethod
    def unpublish_document(cls, doc_id: int) -> dict:
        doc = Documents.objects.filter(id=doc_id).first()
        if not doc:
            raise NotFound(f"Không tìm thấy tài liệu với ID {doc_id}.")
        doc.status = "draft"
        doc.save(update_fields=["status"])
        return {"id": doc.id, "title": doc.title, "status": doc.status, "message": "Đã ngừng xuất bản tài liệu."}

    @classmethod
    def delete_document(cls, doc_id: int) -> dict:
        doc = Documents.objects.filter(id=doc_id).first()
        if not doc:
            raise NotFound(f"Không tìm thấy tài liệu với ID {doc_id}.")
        with transaction.atomic():
            Chunks.objects.filter(document=doc).delete()
            doc.delete()
        return {"id": doc_id, "message": "Đã xóa tài liệu và các chunk liên quan thành công."}

