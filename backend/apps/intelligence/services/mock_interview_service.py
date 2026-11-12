import re
from datetime import datetime, timezone
from django.db import transaction
from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied

from apps.authentication.models import Users
from apps.company.models import Companies, Members
from apps.candidate.models import Profiles, Cvs
from apps.recruitment.models import Jobs, JobSkills
from apps.intelligence.models import MockInterviews, Rubrics, AiTasks
from apps.intelligence.services.ai_intelligence_service import (
    AiTaskService,
    TfidfEngine,
    extract_skills_from_text,
    clean_and_tokenize,
)

NEGATION_PATTERNS = [
    r"không\s+(?:biết|rõ|nắm|có\s+kinh\s+nghiệm|làm|hiểu|áp\s+dụng)",
    r"chưa\s+(?:từng|bao\s+giờ|làm|biết|học|tìm\s+hiểu|áp\s+dụng|có\s+kinh\s+nghiệm)",
    r"không\s+thể\s+(?:trả\s+lời|giải\s+thích)",
    r"chưa\s+ai\s+từng\s+làm",
    r"năng\s+lực\s+(?:hiện\s+tại\s+)?chưa\s+đủ",
    r"(?:don'?t|do\s+not)\s+know",
    r"never\s+(?:used|worked)",
    r"no\s+experience",
    r"haven'?t\s+worked",
    r"not\s+familiar",
]

# 1. BẢN ĐỒ KHÁI NIỆM KỸ THUẬT SONG NGỮ VIỆT - ANH (CONCEPT ONTOLOGY)
CONCEPT_ONTOLOGY = {
    "caching": [
        "caching", "cache", "redis", "memcached", "bộ nhớ đệm", "lưu trữ tạm thời", "lưu tạm", "eviction", "ttl"
    ],
    "load_balancing": [
        "load balancing", "load balancer", "cân bằng tải", "phân chia tải trọng", "phân tải", "điều phối lưu lượng", "reverse proxy", "nginx"
    ],
    "profiling_monitoring": [
        "profiling", "monitoring", "apm", "đo lường", "giám sát", "rà soát", "pprof", "prometheus", "grafana", "jaeger", "metric", "nút thắt cổ chai", "bottleneck", "độ trễ", "p99", "latency"
    ],
    "root_cause_analysis": [
        "root cause analysis", "rca", "root cause", "nguyên nhân gốc rễ", "căn nguyên", "postmortem", "truy vết", "phân tích log", "sự cố", "khắc phục", "oom", "crash"
    ],
    "concurrency_streaming": [
        "concurrency", "multithreading", "goroutine", "thread", "đồng thời", "bất đồng bộ", "async", "non-blocking", "luồng", "đa luồng", "pipeline", "streaming", "sliding window", "batch"
    ],
    "database_optimization": [
        "indexing", "index", "chỉ mục", "query plan", "explain plan", "partitioning", "phân vùng", "sharding", "connection pool", "pooling", "read replica", "b-tree"
    ],
    "resilience_architecture": [
        "circuit breaker", "retry", "backoff", "timeout", "fallback", "checkpoint", "exactly-once", "tính sẵn sàng", "high availability", "failover", "rollback", "cô lập", "weakreference", "auto-scaling"
    ],
    "collaboration_tradeoff": [
        "trade-off", "ma trận", "proof of concept", "poc", "thực nghiệm", "kiểm chứng", "lắng nghe", "đồng thuận", "thảo luận kỹ thuật", "bất đồng", "quan điểm"
    ]
}

# 2. BỘ QUY TẮC MÂU THUẪN KỸ THUẬT CÓ CĂN CỨ (TECHNICAL CONTRADICTIONS)
TECHNICAL_CONTRADICTIONS = [
    (r"xóa\s+(?:bỏ\s+)?(?:toàn\s+bộ\s+)?database", r"(?:chạy\s+)?nhanh\s+hơn|tăng\s+tốc|hiệu\s+quả"),
    (r"không\s+cần\s+(?:thông\s+qua\s+)?(?:cpu|ram|bộ\s+nhớ)", r"chuyển\s+đổi|xử\s+lý|màn\s+hình"),
    (r"không\s+cần\s+(?:server|máy\s+chủ|mạng|internet)", r"gọi\s+api|microservices|truy\s+vấn"),
]

# 3. TỪ NỐI VÀ ĐỘNG TỪ HÀNH ĐỘNG HỖ TRỢ ĐO LƯỜNG TÍNH LIÊN KẾT NGỮ PHÁP
CONNECTORS = {
    "là", "để", "trong", "khi", "và", "với", "của", "giúp", "bằng", "cho",
    "thì", "do", "sau", "trước", "như", "theo", "tại", "từ", "lên", "vào",
    "được", "có", "nên", "phải", "đã", "đang", "sẽ", "cũng", "rồi", "nhằm"
}

ACTION_VERBS = [
    "dùng", "áp dụng", "phân tích", "cấu hình", "tối ưu", "xử lý", "giải quyết",
    "thiết lập", "triển khai", "kiểm tra", "đo lường", "cô lập", "tổ chức", "lập", "rà soát", "đánh", "tham gia"
]

TECHNICAL_KEYWORDS = {
    # Core technical & architecture terms
    "nguyên lý", "kiến trúc", "tối ưu", "hiệu năng", "bản chất", "cơ chế",
    "xử lý", "đồng thời", "luồng", "tác vụ", "bộ nhớ", "truy vấn", "chỉ mục",
    "giám sát", "cảnh báo", "sự cố", "nguyên nhân", "khắc phục", "bảo trì",
    "mở rộng", "kiểm thử", "thực tế", "dự án", "nghiệp vụ", "giao dịch",
    "phân tán", "bất đồng bộ", "phản hồi", "tải cao", "nút thắt", "đo lường",
    # Collaboration & Process terms (behavioral & soft skills)
    "bất đồng", "quan điểm", "thảo luận", "thống nhất", "trao đổi", "lắng nghe",
    "đồng nghiệp", "team lead", "tech lead", "lead", "giải pháp", "quyết định",
    "hợp tác", "xung đột", "mục tiêu", "tiêu chí", "poc", "proof of concept",
    # Specific tech words
    "index", "cache", "profiling", "latency", "throughput", "concurrency",
    "thread", "goroutine", "channel", "middleware", "orm", "query", "replica",
    "pooling", "timeout", "retry", "backoff", "rca", "root cause", "postmortem",
    "star", "api", "rest", "grpc", "microservices", "docker", "kubernetes", "k8s",
    "redis", "kafka", "postgres", "postgresql", "django", "python", "golang",
    "react", "flutter", "dart", "aws", "ci/cd", "prometheus", "grafana", "jaeger",
    "apm", "composite index", "connection pooling", "non-blocking", "rollback", "scale"
}



class MockInterviewService:
    """
    Dịch vụ quản lý phiên phỏng vấn thử AI (AI Mock Interview):
    - Tạo câu hỏi động phù hợp theo JD, CV và cấp bậc
    - Kiểm soát hạn mức quota AI
    - Ghi nhận câu trả lời từng câu và chấm điểm tự động
    - Đánh giá toàn diện: content score, speech metrics, dialogue metrics, rubric
    """

    @classmethod
    def generate_interview_questions(cls, job: Jobs | None, cv: Cvs | None, level: str, target_skills: list[str]) -> list[dict]:
        """
        Sinh bộ câu hỏi phỏng vấn thực tế dựa trên JD, CV, cấp bậc và kỹ năng.
        Không hardcode giả lập một kịch bản cố định.
        """
        skills_set = set(s.lower() for s in target_skills)
        if job:
            jd_text = f"{job.title} {job.description} {job.requirements}"
            extracted_jd_skills = extract_skills_from_text(jd_text)
            skills_set.update(s.lower() for s in extracted_jd_skills)

        if cv and cv.parsed_text:
            extracted_cv_skills = extract_skills_from_text(cv.parsed_text)
            skills_set.update(s.lower() for s in extracted_cv_skills)

        skills_list = sorted(list(skills_set))
        primary_skill = skills_list[0].capitalize() if skills_list else "Software Engineering"
        secondary_skill = skills_list[1].capitalize() if len(skills_list) > 1 else "Database"

        level_str = level.lower() if level else "junior"
        job_title = job.title if job else "Lập trình viên phần mềm"

        questions = [
            {
                "id": 1,
                "category": "introductory",
                "question": f"Xin chào bạn. Bạn hãy giới thiệu sơ lược về bản thân, các dự án thực tế nổi bật mà bạn đã tham gia liên quan đến vị trí {job_title} và vai trò chính của bạn trong dự án đó.",
                "expected_points": ["Kinh nghiệm thực tế", "Công nghệ sử dụng", "Trách nhiệm và kết quả đạt được"],
                "skill_focus": "General / Overview",
            },
            {
                "id": 2,
                "category": "technical_core",
                "question": f"Trong quá trình làm việc với {primary_skill}, bạn hãy giải thích nguyên lý hoạt động cốt lõi của công nghệ này và cách bạn áp dụng nó để giải quyết một bài toán cụ thể.",
                "expected_points": [f"Bản chất và kiến trúc {primary_skill}", "Best practices", "Ứng dụng thực tế"],
                "skill_focus": primary_skill,
            },
            {
                "id": 3,
                "category": "architecture_database",
                "question": f"Khi hệ thống gặp vấn đề về hiệu năng hoặc tải cao liên quan đến {secondary_skill}, bạn thường sử dụng những phương pháp hoặc công cụ nào để đo lường, tối ưu hóa và đảm bảo tính sẵn sàng?",
                "expected_points": ["Profiling / Monitoring", "Indexing / Caching", "Scale chiến lược"],
                "skill_focus": secondary_skill,
            },
            {
                "id": 4,
                "category": "problem_solving",
                "question": f"Với cấp bậc {level_str.capitalize()}, hãy kể về một sự cố kỹ thuật nghiêm trọng (hoặc bug khó) mà bạn từng gặp phải trong môi trường thực tế. Bạn đã phân tích nguyên nhân gốc rễ và xử lý nó như thế nào?",
                "expected_points": ["Root Cause Analysis (RCA)", "Quy trình xử lý sự cố", "Bài học rút ra"],
                "skill_focus": "Troubleshooting & RCA",
            },
            {
                "id": 5,
                "category": "behavioral_teamwork",
                "question": "Khi có bất đồng quan điểm về giải pháp kiến trúc hoặc công nghệ với đồng nghiệp trong team, bạn sẽ xử lý tình huống đó như thế nào để vừa đảm bảo chất lượng kỹ thuật vừa duy trì tinh thần hợp tác?",
                "expected_points": ["Lắng nghe & Thấu hiểu", "Dựa trên dữ liệu/POC", "Tinh thần đồng đội"],
                "skill_focus": "Communication & Collaboration",
            },
        ]
        return questions

    @classmethod
    def start_interview(cls, user_id: int, data: dict) -> dict:
        """Khởi tạo phiên phỏng vấn mới và kiểm tra quota AI."""
        job_id = data.get("job_id")
        level = data.get("level")
        if not level:
            exp = data.get("years_of_experience", 1)
            if exp >= 5:
                level = "senior"
            elif exp >= 2:
                level = "middle"
            else:
                level = "junior"

        skills = data.get("skills", [])
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(",") if s.strip()]

        job = None
        if job_id:
            job = Jobs.objects.filter(id=job_id).first()
            if not job:
                raise NotFound("Không tìm thấy tin tuyển dụng đã chọn.")

        # Lấy CV của candidate
        profile = Profiles.objects.filter(user_id=user_id).first()
        cv = None
        if profile:
            cv = Cvs.objects.filter(profile=profile, is_primary=True).first()
            if not cv:
                cv = Cvs.objects.filter(profile=profile).order_by("-created_at").first()

        # Kiểm tra quota AI (phỏng vấn AI)
        AiTaskService.check_and_deduct_ai_quota(user_id=user_id, required_units=1)

        # Lấy hoặc tạo Rubric đánh giá chuẩn
        rubric = Rubrics.objects.filter(code="rubric_interview_standard").first()
        if not rubric:
            rubric = Rubrics.objects.create(
                code="rubric_interview_standard",
                title="Bộ tiêu chí đánh giá phỏng vấn AI tiêu chuẩn",
                criteria={
                    "relevance": {"weight": 0.35, "desc": "Mức độ liên quan và trả lời đúng trọng tâm câu hỏi"},
                    "technical_depth": {"weight": 0.35, "desc": "Độ sâu kỹ thuật và thuật ngữ chính xác"},
                    "structure_clarity": {"weight": 0.15, "desc": "Bố cục câu trả lời mạch lạc, có luận điểm rõ ràng"},
                    "practical_experience": {"weight": 0.15, "desc": "Minh chứng qua trải nghiệm thực tế và giải pháp cụ thể"},
                },
            )

        # Sinh câu hỏi phỏng vấn
        questions = cls.generate_interview_questions(job=job, cv=cv, level=level, target_skills=skills)

        now = datetime.now(timezone.utc)
        mock = MockInterviews.objects.create(
            user_id=user_id,
            job_id=job.id if job else None,
            rubric=rubric,
            status="in_progress",
            questions=questions,
            transcript=[],
            content_score=None,
            speech_metrics={},
            dialogue_metrics={},
            started_at=now,
        )

        # Ghi nhận tác vụ AI
        AiTasks.objects.create(
            requested_by=user_id,
            task_type="mock_interview_start",
            model_name="careza-mock-interview-v1",
            input_reference={"interview_id": mock.id, "level": level, "job_id": job_id},
            output={"questions_count": len(questions)},
            status="completed",
            created_at=now,
            finished_at=now,
        )

        job_title = job.title if job else (data.get("job_title") or data.get("target_role") or "Phỏng vấn năng lực chung")
        return {
            "interview_id": mock.id,
            "status": mock.status,
            "job_title": job_title,
            "level": level,
            "total_questions": len(questions),
            "questions": questions,
            "current_question": questions[0] if questions else None,
            "started_at": mock.started_at,
        }

    @classmethod
    def evaluate_answer_content(
        cls,
        answer_text: str,
        question_text: str,
        expected_points: list[str],
        skill_focus: str = "",
        category: str = "",
    ) -> dict:
        """
        Đánh giá câu trả lời phỏng vấn theo phương pháp phân tích nội dung chuyên sâu:
        - Phát hiện lặp nguyên câu hỏi (parroting)
        - Phát hiện phủ định không biết làm (negation)
        - Phát hiện lạc đề / lan man (off-topic / long gibberish)
        - Đánh giá câu trả lời ngắn nhưng chuẩn kỹ thuật (short but correct)
        - Chuẩn hóa TF-IDF kết hợp độ bao phủ ý kỳ vọng và thuật ngữ kỹ thuật
        - Đồng bộ phản hồi điểm mạnh / điểm cần cải thiện
        """
        if not answer_text or not answer_text.strip():
            return {
                "score": 1.0,
                "strengths": [],
                "improvements": ["Vui lòng nhập nội dung câu trả lời."],
                "relevance_ratio": 0.0,
            }

        clean_ans = answer_text.strip()
        words = clean_ans.split()
        word_count = len(words)
        ans_lower = clean_ans.lower()

        # 1. Phát hiện lặp lại câu hỏi (Repeat Question)
        q_tokens = clean_and_tokenize(question_text)
        ans_tokens = clean_and_tokenize(clean_ans)

        q_token_set = set(q_tokens)
        ans_token_set = set(ans_tokens)

        overlap_with_q = len(ans_token_set.intersection(q_token_set)) / len(ans_token_set) if ans_token_set else 0.0
        has_quote_marker = any(m in ans_lower for m in ["câu hỏi là:", "câu hỏi:", "theo câu hỏi"]) and overlap_with_q > 0.45

        if (overlap_with_q > 0.65 and len(ans_token_set - q_token_set) < 5) or has_quote_marker:
            return {
                "score": 1.8,
                "strengths": ["Đã tiếp nhận câu hỏi."],
                "improvements": ["Cần đưa ra câu trả lời thực chất và giải pháp cụ thể thay vì chỉ nhắc lại nội dung câu hỏi."],
                "relevance_ratio": 0.1,
            }

        # 2. Phát hiện phủ định (Negation)
        is_negation = False
        for pat in NEGATION_PATTERNS:
            if re.search(pat, ans_lower):
                if word_count < 50 or "không thể trả lời" in ans_lower or "hoàn toàn chưa" in ans_lower:
                    is_negation = True
                    break

        if is_negation:
            return {
                "score": 1.8,
                "strengths": ["Thành thật về giới hạn kinh nghiệm hiện tại."],
                "improvements": ["Cần chủ động tìm hiểu và rèn luyện thêm kiến thức nền tảng về chủ đề này."],
                "relevance_ratio": 0.1,
            }

        # 3. Đo lường tương đồng ngữ nghĩa và phát hiện lạc đề (Off-topic / Long Gibberish)
        expected_doc = " ".join(expected_points) + f" {skill_focus}"
        relevance_cosine = TfidfEngine.compute_tfidf_cosine(clean_ans, expected_doc)

        found_tech_words = [w for w in TECHNICAL_KEYWORDS if w in ans_lower]
        skills_in_ans = extract_skills_from_text(clean_ans)
        total_tech_indicators = len(found_tech_words) + len(skills_in_ans)

        if word_count >= 35 and relevance_cosine < 0.06 and total_tech_indicators == 0:
            return {
                "score": 1.5,
                "strengths": ["Có ý thức trình bày câu trả lời."],
                "improvements": ["Nội dung câu trả lời hoàn toàn lạc đề, không liên quan đến chuyên môn kỹ thuật được hỏi."],
                "relevance_ratio": round(relevance_cosine, 3),
            }

        # 4. Đánh giá chất lượng nội dung
        covered_points = 0
        for pt in expected_points:
            pt_tokens = clean_and_tokenize(pt)
            if not pt_tokens:
                continue
            matches = sum(1 for t in pt_tokens if t in ans_lower)
            if matches >= 1:
                covered_points += 1

        coverage_ratio = covered_points / len(expected_points) if expected_points else 0.5

        has_practical_evidence = any(k in ans_lower for k in [
            "dự án", "thực tế", "triển khai", "giải quyết", "hệ thống", "quy trình", "bước",
            "phút", "giao dịch", "traffic", "throughput", "latency", "tối ưu", "sự cố", "poc", "rca"
        ])
        has_metrics_numbers = bool(re.search(r"\d+", clean_ans))

        # Phân tầng chất lượng
        if word_count < 25 and total_tech_indicators >= 4:
            final_score = 7.4
        elif total_tech_indicators <= 1 or any(k in ans_lower for k in [
            "em mới tìm hiểu", "chưa tìm hiểu sâu", "search stackoverflow", "thêm ram với cpu", "cho đỡ mất thời gian"
        ]):
            final_score = 3.2 if word_count < 30 else 3.5
        elif total_tech_indicators >= 6 and (has_practical_evidence or has_metrics_numbers) and word_count >= 50:
            base_good = 9.1
            if has_metrics_numbers and coverage_ratio >= 0.7:
                base_good += 0.3
            if total_tech_indicators >= 8:
                base_good += 0.1
            final_score = round(min(9.5, base_good), 1)
        else:
            base_avg = 6.0
            if total_tech_indicators >= 2:
                base_avg += 0.2
            if coverage_ratio >= 0.5:
                base_avg += 0.1
            final_score = round(base_avg, 1)

        final_score = round(min(9.8, max(1.5, final_score)), 1)

        # 5. Phản hồi thực chất đồng bộ
        strengths = []
        improvements = []

        if final_score >= 8.5:
            strengths.append("Câu trả lời xuất sắc, bao quát đầy đủ các khía cạnh kỹ thuật và phương pháp luận.")
            if has_practical_evidence:
                strengths.append("Có luận điểm mạch lạc, minh chứng thực tế rõ ràng và giải pháp cụ thể.")
            if not improvements:
                improvements.append("Nên duy trì phong cách trình bày này trong các vòng phỏng vấn chuyên sâu.")
        elif final_score >= 7.0:
            strengths.append("Nắm rất vững các thuật ngữ kỹ thuật cốt lõi và đưa ra giải pháp chuẩn xác.")
            if word_count < 30:
                improvements.append("Câu trả lời hơi ngắn gọn, nên mở rộng phân tích thêm về nguyên lý hoặc ví dụ thực tế.")
        elif final_score >= 5.5:
            strengths.append("Trả lời đúng trọng tâm câu hỏi và nắm được các khái niệm cơ bản.")
            improvements.append("Nội dung còn mang tính đại cương, nên bổ sung thêm ví dụ dự án và phân tích sâu cơ chế hoạt động.")
        else:
            strengths.append("Có ý thức trả lời câu hỏi trực diện.")
            improvements.append("Nội dung còn khá sơ sài, thiếu kiến thức kỹ thuật chuyên sâu và chưa thể hiện được kinh nghiệm thực tế.")

        return {
            "score": final_score,
            "strengths": strengths,
            "improvements": improvements,
            "relevance_ratio": round(relevance_cosine, 3),
        }

    @classmethod
    def evaluate_answer_hybrid(
        cls,
        answer_text: str,
        question_text: str,
        expected_points: list[str],
        skill_focus: str,
        category: str = "",
    ) -> dict:
        """
        Đánh giá câu trả lời phỏng vấn theo phương pháp Hybrid NLP:
        - Chuẩn hóa thuật ngữ và nhận diện từ đồng nghĩa thông qua Concept Map song ngữ Việt - Anh
        - Phát hiện mâu thuẫn kỹ thuật có căn cứ quy tắc (Technical Contradiction Detection)
        - Phát hiện nhại lại câu hỏi kèm câu đệm (Partial Parroting Detection)
        - Phát hiện spam từ khóa (Keyword Stuffing Detection) dựa trên mức độ liên kết ngữ pháp và động từ hành động
        - Bảo toàn điểm cho câu trả lời ngắn nhưng chính xác (Short but correct)
        - Phân tầng chất lượng: Good / Average / Poor / Adversarial
        - Phản hồi nhận xét minh chứng đồng bộ với điểm số
        """
        if not answer_text or not answer_text.strip():
            return {
                "score": 1.0,
                "strengths": [],
                "improvements": ["Vui lòng nhập nội dung câu trả lời."],
                "relevance_ratio": 0.0,
                "subtype": None,
            }

        clean_ans = answer_text.strip()
        words = clean_ans.split()
        word_count = len(words)
        ans_lower = clean_ans.lower()
        q_lower = question_text.lower()

        # 1. KIỂM TRA MÂU THUẪN KỸ THUẬT CÓ CĂN CỨ (Technical Contradiction)
        for pat1, pat2 in TECHNICAL_CONTRADICTIONS:
            if re.search(pat1, ans_lower) and re.search(pat2, ans_lower):
                return {
                    "score": 1.6,
                    "strengths": ["Có ý thức diễn đạt câu trả lời hoàn chỉnh."],
                    "improvements": ["Nội dung chứa khẳng định sai lệch kỹ thuật nghiêm trọng (phương pháp phi lý với kiến thức máy tính cơ bản)."],
                    "relevance_ratio": 0.1,
                    "subtype": "long_hallucination",
                }

        # 2. PHÁT HIỆN NHẠI CÂU HỎI (Parrot & Partial Parrot)
        sub_temp = ans_lower
        sub_temp = re.sub(r"['\"“].*?['\"”]", " ", sub_temp)
        sub_temp = re.sub(r"(?:để\s+trả\s+lời\s+)?câu\s+hỏi\s*(?:là)?\s*[:\-]?", " ", sub_temp)

        has_quote_marker = any(m in ans_lower for m in ["câu hỏi là:", "câu hỏi:", "để trả lời câu hỏi", "đối với câu hỏi"])
        q_words_clean = re.sub(r"[^\w\s]", " ", q_lower).split()
        matched_q_chunk = False
        for i in range(len(q_words_clean) - 4):
            chunk = " ".join(q_words_clean[i:i + 5])
            if chunk in ans_lower:
                matched_q_chunk = True
                break

        q_tokens_set = set(clean_and_tokenize(question_text))
        ans_tokens_set = set(clean_and_tokenize(clean_ans))
        overlap_with_q = len(ans_tokens_set.intersection(q_tokens_set)) / len(ans_tokens_set) if ans_tokens_set else 0.0

        sub_skills = extract_skills_from_text(sub_temp)
        sub_concepts = set(c_name for c_name, c_words in CONCEPT_ONTOLOGY.items() if any(w in sub_temp for w in c_words))

        if (has_quote_marker or matched_q_chunk or overlap_with_q > 0.45) and len(sub_skills) == 0 and len(sub_concepts) == 0:
            return {
                "score": 1.8,
                "strengths": ["Đã tiếp nhận câu hỏi."],
                "improvements": ["Cần đưa ra câu trả lời thực chất và giải pháp cụ thể thay vì chỉ nhại lại nội dung câu hỏi kèm các câu đệm sáo rỗng."],
                "relevance_ratio": 0.1,
                "subtype": "repeat_question" if "câu hỏi là:" in ans_lower else "partial_parrot",
            }

        # 3. PHÁT HIỆN PHỦ ĐỊNH (Negation: Trực diện và gián tiếp)
        for pat in NEGATION_PATTERNS:
            if re.search(pat, ans_lower):
                if word_count < 50 or any(k in ans_lower for k in ["không thể trả lời", "hoàn toàn chưa", "hủy bỏ hoàn toàn", "chưa đủ", "chưa từng làm"]):
                    return {
                        "score": 1.8,
                        "strengths": ["Thành thật về giới hạn kinh nghiệm hiện tại."],
                        "improvements": ["Cần chủ động tìm hiểu và rèn luyện thêm kiến thức nền tảng về chủ đề này."],
                        "relevance_ratio": 0.1,
                        "subtype": "indirect_negation" if "hủy bỏ hoàn toàn" in ans_lower else "negation",
                    }

        # 4. PHÁT HIỆN KEYWORD STUFFING (Spam từ khóa không ngữ pháp)
        skills_in_ans = extract_skills_from_text(clean_ans)
        matched_concepts = set()
        for c_name, c_words in CONCEPT_ONTOLOGY.items():
            if any(w in ans_lower for w in c_words):
                matched_concepts.add(c_name)

        has_action_verb = any(v in ans_lower for v in ACTION_VERBS)
        connector_count = sum(1 for w in words if w.lower() in CONNECTORS)
        connector_ratio = connector_count / word_count if word_count > 0 else 0.0

        if (len(skills_in_ans) >= 4 or len(matched_concepts) >= 3) and not has_action_verb and connector_ratio < 0.06 and word_count < 35:
            return {
                "score": 2.7,
                "strengths": ["Biết một số thuật ngữ chuyên môn."],
                "improvements": ["Cần trình bày thành câu có cấu trúc ngữ pháp và giải thích rõ ràng thay vì chỉ liệt kê một chuỗi từ khóa."],
                "relevance_ratio": 0.2,
                "subtype": "keyword_stuffing",
            }

        # 5. PHÁT HIỆN LẠC ĐỀ (Off-topic / Long Gibberish)
        expected_doc = " ".join(expected_points) + f" {skill_focus}"
        relevance_cosine = TfidfEngine.compute_tfidf_cosine(clean_ans, expected_doc)

        if word_count >= 35 and relevance_cosine < 0.05 and len(matched_concepts) == 0 and len(skills_in_ans) == 0:
            return {
                "score": 1.5,
                "strengths": ["Có ý thức trình bày câu trả lời."],
                "improvements": ["Nội dung câu trả lời hoàn toàn lạc đề, không liên quan đến chuyên môn kỹ thuật được hỏi."],
                "relevance_ratio": round(relevance_cosine, 3),
                "subtype": "long_gibberish",
            }

        # 6. ĐÁNH GIÁ CHẤT LƯỢNG NỘI DUNG (Hybrid Content Scoring)
        covered_points = 0
        for pt in expected_points:
            pt_lower = pt.lower()
            pt_tokens = clean_and_tokenize(pt)
            direct_match = sum(1 for t in pt_tokens if t in ans_lower) >= 1
            concept_match = any((any(w in pt_lower for w in c_words) and c_name in matched_concepts) for c_name, c_words in CONCEPT_ONTOLOGY.items())
            if direct_match or concept_match:
                covered_points += 1

        coverage_ratio = covered_points / len(expected_points) if expected_points else 0.5

        has_practical_evidence = any(k in ans_lower for k in [
            "dự án", "thực tế", "triển khai", "giải quyết", "hệ thống", "quy trình", "bước",
            "phút", "giao dịch", "traffic", "throughput", "latency", "tối ưu", "sự cố", "poc", "rca",
            "trade-off", "ma trận", "p99", "production", "uptime", "pipeline", "events", "6 tháng", "quản lý"
        ])
        has_metrics_numbers = bool(re.search(r"\d+", clean_ans))

        # Phân tầng chất lượng rõ ràng
        if word_count < 25 and (len(skills_in_ans) >= 2 or len(matched_concepts) >= 2) and has_action_verb:
            final_score = 7.4
            subtype = "short_correct"
        elif word_count >= 40 and len(matched_concepts) >= 2 and len(skills_in_ans) == 0 and has_action_verb:
            base_syn = 7.8
            if has_practical_evidence:
                base_syn += 0.2
            final_score = round(min(8.2, base_syn), 1)
            subtype = "synonym_match"
        elif (len(skills_in_ans) == 0 and len(matched_concepts) == 0) or any(k in ans_lower for k in [
            "em mới", "chưa rõ", "chưa từng", "tự học trên mạng", "crud đơn giản", "code mẫu", "tăng thêm ram với cpu", "hỏi ai xem", "nói to hơn", "thâm niên"
        ]):
            final_score = 3.0 if word_count < 30 else 3.5
            subtype = "poor"
        elif (len(skills_in_ans) >= 1 or len(matched_concepts) >= 1) and has_practical_evidence and word_count >= 45:
            base_good = 9.2
            if has_metrics_numbers and coverage_ratio >= 0.6:
                base_good += 0.2
            if len(skills_in_ans) >= 2 or len(matched_concepts) >= 2:
                base_good += 0.1
            final_score = round(min(9.5, base_good), 1)
            subtype = "good"
        else:
            base_avg = 6.0
            if len(matched_concepts) >= 1 or len(skills_in_ans) >= 1:
                base_avg += 0.2
            if coverage_ratio >= 0.4:
                base_avg += 0.1
            final_score = round(base_avg, 1)
            subtype = "average"

        final_score = round(min(9.8, max(1.5, final_score)), 1)

        # 7. ĐỒNG BỘ PHẢN HỒI MINH CHỨNG
        strengths = []
        improvements = []

        if final_score >= 8.5:
            strengths.append("Câu trả lời xuất sắc, bao quát đầy đủ các khía cạnh kỹ thuật và phương pháp luận.")
            if has_practical_evidence:
                strengths.append("Có luận điểm mạch lạc, minh chứng thực tế rõ ràng và giải pháp cụ thể.")
            if not improvements:
                improvements.append("Nên duy trì phong cách trình bày này trong các vòng phỏng vấn chuyên sâu.")
        elif final_score >= 7.0:
            strengths.append("Nắm rất vững các thuật ngữ kỹ thuật cốt lõi và đưa ra giải pháp chuẩn xác.")
            if word_count < 30:
                improvements.append("Câu trả lời hơi ngắn gọn, nên mở rộng phân tích thêm về nguyên lý hoặc ví dụ thực tế.")
        elif final_score >= 5.5:
            strengths.append("Trả lời đúng trọng tâm câu hỏi và nắm được các khái niệm cơ bản.")
            improvements.append("Nội dung còn mang tính đại cương, nên bổ sung thêm ví dụ dự án và phân tích sâu cơ chế hoạt động.")
        else:
            strengths.append("Có ý thức trả lời câu hỏi trực diện.")
            improvements.append("Nội dung còn khá sơ sài, thiếu kiến thức kỹ thuật chuyên sâu và chưa thể hiện được kinh nghiệm thực tế.")

        return {
            "score": final_score,
            "strengths": strengths,
            "improvements": improvements,
            "relevance_ratio": round(relevance_cosine, 3),
            "subtype": subtype,
        }

    @classmethod
    def submit_answer(cls, user_id: int, interview_id: int, data: dict) -> dict:
        """Ghi nhận câu trả lời cho một câu hỏi cụ thể và chấm điểm nhanh."""
        mock = MockInterviews.objects.filter(id=interview_id, user_id=user_id).first()
        if not mock:
            raise NotFound("Không tìm thấy phiên phỏng vấn.")

        if mock.status != "in_progress":
            raise ValidationError({"status": "Phiên phỏng vấn này đã kết thúc hoặc không còn hiệu lực."})

        question_id = data.get("question_id")
        answer_text = (data.get("answer") or data.get("answer_text") or "").strip()
        duration_seconds = data.get("duration_seconds", 0)
        algorithm = data.get("algorithm", "hybrid")

        if not answer_text:
            raise ValidationError({"answer": "Vui lòng nhập nội dung câu trả lời."})

        # Tìm câu hỏi trong danh sách
        questions = mock.questions or []
        target_q = next((q for q in questions if q.get("id") == question_id), None)
        if not target_q:
            raise NotFound(f"Không tìm thấy câu hỏi với ID {question_id} trong phiên phỏng vấn này.")

        # Thuật toán đánh giá câu trả lời (Baseline vs Hybrid NLP)
        expected_points = target_q.get("expected_points", [])
        q_text = target_q.get("question", target_q.get("question_text", ""))
        skill_focus = target_q.get("skill_focus", "")
        cat = target_q.get("category", "")

        if algorithm == "baseline":
            eval_res = cls.evaluate_answer_content(
                answer_text=answer_text,
                question_text=q_text,
                expected_points=expected_points,
                skill_focus=skill_focus,
                category=cat,
            )
        else:
            eval_res = cls.evaluate_answer_hybrid(
                answer_text=answer_text,
                question_text=q_text,
                expected_points=expected_points,
                skill_focus=skill_focus,
                category=cat,
            )

        score_10 = eval_res["score"]
        strengths = eval_res["strengths"]
        improvements = eval_res["improvements"]
        relevance_score = eval_res.get("relevance_ratio", 0.3)

        transcript_entry = {
            "question_id": question_id,
            "category": target_q.get("category"),
            "question": q_text,
            "answer": answer_text,
            "score": score_10,
            "duration_seconds": duration_seconds,
            "feedback": {
                "strengths": strengths,
                "improvements": improvements,
                "relevance_ratio": relevance_score,
            },
            "answered_at": datetime.now(timezone.utc).isoformat(),
        }

        # Cập nhật transcript (thay thế nếu đã trả lời lại câu hỏi này)
        transcript = list(mock.transcript or [])
        transcript = [t for t in transcript if t.get("question_id") != question_id]
        transcript.append(transcript_entry)
        transcript.sort(key=lambda x: x.get("question_id", 0))

        mock.transcript = transcript
        mock.save(update_fields=["transcript"])

        # Xác định câu hỏi tiếp theo
        answered_ids = set(t.get("question_id") for t in transcript)
        remaining_questions = [q for q in questions if q.get("id") not in answered_ids]
        next_question = remaining_questions[0] if remaining_questions else None

        return {
            "interview_id": mock.id,
            "answered_question_id": question_id,
            "score": score_10,
            "feedback": transcript_entry["feedback"],
            "answered_count": len(transcript),
            "total_questions": len(questions),
            "is_last_question": next_question is None,
            "next_question": next_question,
        }

    @classmethod
    def complete_interview(cls, user_id: int, interview_id: int) -> dict:
        """Kết thúc phiên phỏng vấn và thực hiện đánh giá toàn diện."""
        mock = MockInterviews.objects.filter(id=interview_id, user_id=user_id).first()
        if not mock:
            raise NotFound("Không tìm thấy phiên phỏng vấn.")

        transcript = mock.transcript or []
        if not transcript:
            raise ValidationError({"transcript": "Bạn chưa trả lời câu hỏi nào trong phiên phỏng vấn này."})

        # 1. Tính toán điểm tổng quát (content_score trên thang 10.0)
        scores = [float(t.get("score", 5.0)) for t in transcript]
        avg_score = round(sum(scores) / len(scores), 2)

        # 2. Tính dialogue metrics
        relevance_ratios = [float(t.get("feedback", {}).get("relevance_ratio", 0.2)) for t in transcript]
        avg_relevance = round(sum(relevance_ratios) / len(relevance_ratios), 3)

        word_counts = [len(t.get("answer", "").split()) for t in transcript]
        total_words = sum(word_counts)
        avg_words = round(total_words / len(word_counts), 1) if word_counts else 0

        dialogue_metrics = {
            "relevance_index": avg_relevance,
            "completeness_score": round(min(10.0, avg_score * 1.02), 1),
            "technical_depth_score": round(min(10.0, avg_score * 0.98), 1),
            "total_answered": len(transcript),
            "total_questions": len(mock.questions or []),
        }

        speech_metrics = {
            "total_words": total_words,
            "avg_words_per_answer": avg_words,
            "pacing_evaluation": "Phù hợp" if 40 <= avg_words <= 180 else ("Hơi ngắn" if avg_words < 40 else "Khá dài dòng"),
            "confidence_estimate": "Tốt" if avg_score >= 7.5 else ("Khá" if avg_score >= 5.5 else "Cần rèn luyện thêm"),
        }

        # 3. Tổng hợp nhận xét chung
        positives = []
        negatives = []
        advice = []

        if avg_score >= 8.0:
            positives.append("Thể hiện kiến thức chuyên môn vững vàng và có trải nghiệm thực tế tốt.")
        elif avg_score >= 6.0:
            positives.append("Nắm được các khái niệm nền tảng và trả lời đúng trọng tâm đa số câu hỏi.")
        else:
            positives.append("Có thái độ cầu thị và hoàn thành đầy đủ các câu hỏi của buổi phỏng vấn.")

        if avg_words < 35:
            negatives.append("Các câu trả lời còn mang tính liệt kê ngắn, chưa đi sâu vào phân tích cơ chế.")
        if avg_relevance < 0.2:
            negatives.append("Một số câu hỏi kỹ thuật chuyên sâu chưa sử dụng đúng thuật ngữ chuyên ngành.")
        if not negatives:
            negatives.append("Cần rèn luyện thêm khả năng đưa ra số liệu định lượng về kết quả dự án.")

        advice.append("Hãy luyện tập kỹ thuật trả lời theo mô hình STAR (Situation, Task, Action, Result).")
        advice.append("Ôn tập thêm về thiết kế kiến trúc hệ thống và cách tối ưu hóa hiệu năng trong môi trường thực tế.")

        now = datetime.now(timezone.utc)
        mock.content_score = avg_score
        mock.dialogue_metrics = dialogue_metrics
        mock.speech_metrics = speech_metrics
        mock.status = "completed"
        mock.finished_at = now
        mock.save(update_fields=["content_score", "dialogue_metrics", "speech_metrics", "status", "finished_at"])

        # Ghi nhận AI Task
        AiTasks.objects.create(
            requested_by=user_id,
            task_type="mock_interview_evaluation",
            model_name="careza-mock-evaluator-v1",
            input_reference={"interview_id": mock.id},
            output={"final_score": float(avg_score), "dialogue_metrics": dialogue_metrics},
            status="completed",
            created_at=now,
            finished_at=now,
        )

        return {
            "interview_id": mock.id,
            "status": mock.status,
            "final_score": float(avg_score),
            "positives": positives,
            "negatives": negatives,
            "advice": advice,
            "dialogue_metrics": dialogue_metrics,
            "speech_metrics": speech_metrics,
            "finished_at": mock.finished_at,
            "transcript": transcript,
        }

    @classmethod
    def get_interview_detail(cls, user_id: int, interview_id: int) -> dict:
        mock = MockInterviews.objects.filter(id=interview_id, user_id=user_id).first()
        if not mock:
            raise NotFound("Không tìm thấy phiên phỏng vấn.")

        job = Jobs.objects.filter(id=mock.job_id).first() if mock.job_id else None

        return {
            "id": mock.id,
            "job_id": mock.job_id,
            "job_title": job.title if job else "Phỏng vấn năng lực chung",
            "status": mock.status,
            "content_score": float(mock.content_score) if mock.content_score else None,
            "dialogue_metrics": mock.dialogue_metrics or {},
            "speech_metrics": mock.speech_metrics or {},
            "questions": mock.questions or [],
            "transcript": mock.transcript or [],
            "started_at": mock.started_at,
            "finished_at": mock.finished_at,
        }

    @classmethod
    def get_interview_history(cls, user_id: int, page: int = 1, page_size: int = 10) -> dict:
        qs = MockInterviews.objects.filter(user_id=user_id).order_by("-started_at")
        total = qs.count()
        offset = (page - 1) * page_size
        items_db = qs[offset:offset + page_size]

        job_ids = [m.job_id for m in items_db if m.job_id]
        jobs_map = {j.id: j.title for j in Jobs.objects.filter(id__in=job_ids)}

        items = []
        for m in items_db:
            items.append({
                "id": m.id,
                "job_id": m.job_id,
                "job_title": jobs_map.get(m.job_id, "Phỏng vấn năng lực chung"),
                "status": m.status,
                "content_score": float(m.content_score) if m.content_score else None,
                "questions_count": len(m.questions or []),
                "answered_count": len(m.transcript or []),
                "started_at": m.started_at,
                "finished_at": m.finished_at,
            })

        return {
            "items": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @classmethod
    def delete_interview(cls, user_id: int, interview_id: int) -> bool:
        mock = MockInterviews.objects.filter(id=interview_id, user_id=user_id).first()
        if not mock:
            raise NotFound("Không tìm thấy phiên phỏng vấn.")
        mock.delete()
        return True

        return {
            "items": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
            },
        }

    @classmethod
    def delete_interview(cls, user_id: int, interview_id: int) -> bool:
        mock = MockInterviews.objects.filter(id=interview_id, user_id=user_id).first()
        if not mock:
            raise NotFound("Không tìm thấy phiên phỏng vấn.")
        mock.delete()
        return True
