from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q, Avg, Count

from apps.authentication.authentication import JWTAuthentication
from apps.authentication.permissions import IsAuthenticatedCustom, IsEmployer, HasCompanyAccess
from apps.company.services.company_service import CompanyService
from apps.company.models import Companies, Branding, Branches
from apps.interaction.models import CompanyReviews
from apps.recruitment.models import Jobs
from apps.system.models import Industries, Locations
from apps.company.serializers import (
    CompanyUpdateSerializer,
    BranchCreateUpdateSerializer,
    MemberInviteSerializer,
    MemberRoleUpdateSerializer,
    VerificationSubmitSerializer,
)


class CompanyMeDetailView(APIView):
    """
    Xem và cập nhật thông tin doanh nghiệp hiện tại.
    GET/PATCH /api/companies/me/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        data = CompanyService.get_company_detail(request.user.id)
        return Response({
            "success": True,
            "message": "Thông tin doanh nghiệp.",
            "data": {"company": data},
        }, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = CompanyUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = CompanyService.update_company_info(request.user.id, serializer.validated_data)
        return Response({
            "success": True,
            "message": "Cập nhật thông tin doanh nghiệp thành công.",
            "data": {"company": data},
        }, status=status.HTTP_200_OK)


class CompanyBranchListView(APIView):
    """Quản lý danh sách chi nhánh."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        branches = CompanyService.get_branches(request.user.id)
        return Response({"success": True, "data": {"branches": branches}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = BranchCreateUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = CompanyService.create_branch(request.user.id, serializer.validated_data)
        return Response({"success": True, "message": "Thêm chi nhánh thành công.", "data": {"branch": res}}, status=status.HTTP_201_CREATED)


class CompanyBranchDetailView(APIView):
    """Cập nhật hoặc xóa chi nhánh."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def patch(self, request, pk):
        serializer = BranchCreateUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = CompanyService.update_branch(request.user.id, int(pk), serializer.validated_data)
        return Response({"success": True, "message": "Cập nhật chi nhánh thành công.", "data": {"branch": res}}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        CompanyService.delete_branch(request.user.id, int(pk))
        return Response({"success": True, "message": "Xóa chi nhánh thành công.", "data": None}, status=status.HTTP_200_OK)


class CompanyMemberListView(APIView):
    """Danh sách và mời thành viên vào doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        members = CompanyService.get_members(request.user.id)
        return Response({"success": True, "data": {"members": members}}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = MemberInviteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = CompanyService.invite_or_add_member(request.user.id, serializer.validated_data)
        return Response({"success": True, "message": "Thêm thành viên thành công.", "data": {"member": res}}, status=status.HTTP_201_CREATED)


class CompanyMemberDetailView(APIView):
    """Cập nhật vai trò hoặc xóa thành viên."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def patch(self, request, pk):
        serializer = MemberRoleUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = CompanyService.update_member_role(request.user.id, int(pk), serializer.validated_data)
        return Response({"success": True, "message": "Cập nhật vai trò thành công.", "data": {"member": res}}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        CompanyService.remove_member(request.user.id, int(pk))
        return Response({"success": True, "message": "Đã vô hiệu hóa thành viên khỏi doanh nghiệp.", "data": None}, status=status.HTTP_200_OK)


class CompanyVerificationView(APIView):
    """Yêu cầu xác minh doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        res = CompanyService.get_verification_status(request.user.id)
        return Response({"success": True, "data": res}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = VerificationSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        res = CompanyService.submit_verification(request.user.id, serializer.validated_data)
        return Response({"success": True, "message": "Gửi yêu cầu xác minh thành công.", "data": res}, status=status.HTTP_201_CREATED)


class CompanyActivityListView(APIView):
    """Nhật ký hoạt động của doanh nghiệp."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedCustom, IsEmployer, HasCompanyAccess]

    def get(self, request):
        logs = CompanyService.get_company_activities(request.user.id)
        return Response({"success": True, "data": {"activities": logs}}, status=status.HTTP_200_OK)


class CompanyPublicListView(APIView):
    """
    Public API: Danh sách công ty cho ứng viên và người dùng khám phá.
    GET /api/companies/ (hoặc /api/public/companies/)
    Hỗ trợ tìm kiếm, lọc theo ngành, địa điểm, quy mô, phân trang.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        keyword = request.query_params.get("keyword", "").strip()
        industry = request.query_params.get("industry", "").strip()
        location_param = request.query_params.get("location", "").strip()
        size = request.query_params.get("size", "").strip()
        page = int(request.query_params.get("page", 1))
        page_size = min(int(request.query_params.get("page_size", 12)), 50)

        qs = Companies.objects.all().order_by("-id")

        if keyword:
            qs = qs.filter(
                Q(name__icontains=keyword) |
                Q(description__icontains=keyword) |
                Q(slug__icontains=keyword)
            )

        if industry and industry != "Tất cả ngành":
            # Kiểm tra industry theo tên hoặc id
            ind_ids = list(Industries.objects.filter(name__icontains=industry).values_list("id", flat=True))
            if ind_ids:
                qs = qs.filter(industry_id__in=ind_ids)
            else:
                qs = qs.filter(name__icontains=industry)

        if location_param and location_param != "Toàn quốc":
            loc_ids = list(Locations.objects.filter(province__icontains=location_param).values_list("id", flat=True))
            if loc_ids:
                qs = qs.filter(location_id__in=loc_ids)

        if size and size != "Tất cả quy mô":
            qs = qs.filter(company_size__icontains=size)

        total_items = qs.count()
        total_pages = (total_items + page_size - 1) // page_size if total_items > 0 else 1
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        companies = list(qs[start_idx:end_idx])

        # Cache industries and locations
        ind_map = {ind.id: ind.name for ind in Industries.objects.all()}
        loc_map = {loc.id: loc.province for loc in Locations.objects.all()}
        
        # Batch load brandings & approved review stats
        comp_ids = [c.id for c in companies]
        brandings = {b.company_id: b for b in Branding.objects.filter(company_id__in=comp_ids)}
        review_stats_qs = (
            CompanyReviews.objects.filter(
                company_id__in=comp_ids,
                status__in=["approved", "published"],
            )
            .values("company_id")
            .annotate(avg_rating=Avg("rating"), review_count=Count("id"))
        )
        review_stats_map = {
            row["company_id"]: {
                "rating": round(float(row["avg_rating"]), 1)
                if row["review_count"] and row["avg_rating"] is not None
                else None,
                "reviewCount": int(row["review_count"] or 0),
            }
            for row in review_stats_qs
        }

        items = []
        for c in companies:
            b = brandings.get(c.id)
            open_jobs = Jobs.objects.filter(company_id=c.id, status="published").count()
            ind_name = ind_map.get(c.industry_id, "Công nghệ thông tin")
            loc_name = loc_map.get(c.location_id, "Toàn quốc")
            rev_stat = review_stats_map.get(c.id, {"rating": None, "reviewCount": 0})

            items.append({
                "id": c.id,
                "slug": c.slug,
                "name": c.name,
                "slogan": b.slogan if b and b.slogan else "",
                "logo": c.logo_url or "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=150&h=150&q=80",
                "buildingImage": b.banner_url if b and b.banner_url else "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
                "coverImage": b.banner_url if b and b.banner_url else "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
                "industry": ind_name,
                "location": loc_name,
                "size": c.company_size or "Đang cập nhật",
                "website": c.website or "",
                "isVerified": c.verification_status == "verified",
                "isFeatured": open_jobs > 0,
                "isTopHiring": open_jobs >= 5,
                "rating": rev_stat["rating"],
                "reviewCount": rev_stat["reviewCount"],
                "openJobs": open_jobs,
                "description": c.description or "",
            })

        return Response({
            "success": True,
            "data": {
                "items": items,
                "pagination": {
                    "current_page": page,
                    "page_size": page_size,
                    "total_items": total_items,
                    "total_pages": total_pages,
                }
            }
        }, status=status.HTTP_200_OK)


class CompanyPublicDetailView(APIView):
    """
    Public API: Chi tiết thông tin công ty theo ID hoặc Slug.
    GET /api/companies/<pk_or_slug>/
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, pk):
        # Có thể pk là số ID hoặc slug chuỗi
        company = None
        if str(pk).isdigit():
            company = Companies.objects.filter(id=int(pk)).first()
        if not company:
            company = Companies.objects.filter(slug=str(pk)).first()
        if not company:
            # Tìm gần đúng theo tên
            company = Companies.objects.filter(name__icontains=str(pk)).first()

        if not company:
            return Response({
                "success": False,
                "message": "Không tìm thấy thông tin công ty."
            }, status=status.HTTP_404_NOT_FOUND)

        # Lấy branding
        branding = Branding.objects.filter(company_id=company.id).first()
        # Lấy branches
        branches = Branches.objects.filter(company_id=company.id)
        # Lấy jobs đã xuất bản (status="published")
        jobs_qs = Jobs.objects.filter(company_id=company.id, status="published").order_by("-id")

        # Tính điểm đánh giá trung bình & số lượt đánh giá đã duyệt
        rev_agg = CompanyReviews.objects.filter(
            company_id=company.id,
            status__in=["approved", "published"],
        ).aggregate(avg_rating=Avg("rating"), review_count=Count("id"))
        rev_count = int(rev_agg.get("review_count") or 0)
        avg_rating = (
            round(float(rev_agg["avg_rating"]), 1)
            if rev_count > 0 and rev_agg.get("avg_rating") is not None
            else None
        )

        # Map ngành nghề & địa điểm
        ind = Industries.objects.filter(id=company.industry_id).first() if company.industry_id else None
        loc = Locations.objects.filter(id=company.location_id).first() if company.location_id else None

        branches_data = []
        for br in branches:
            branches_data.append({
                "id": br.id,
                "name": br.name,
                "address": br.address or "Chưa cập nhật địa chỉ",
                "phone": getattr(br, "phone", None) or "(Đang cập nhật)",
                "email": getattr(br, "email", None) or "(Đang cập nhật)",
            })

        jobs_data = []
        for j in jobs_qs:
            # Format salary
            sal_text = "Thỏa thuận"
            if j.salary_min and j.salary_max:
                sal_text = f"{int(j.salary_min):,} - {int(j.salary_max):,} {(j.currency or 'VND').strip()}"
            elif j.salary_min:
                sal_text = f"Từ {int(j.salary_min):,} {(j.currency or 'VND').strip()}"

            emp_type = getattr(j, "employment_type", None) or getattr(j, "job_type", None) or "Full-time"
            work_mode = getattr(j, "work_mode", None) or getattr(j, "workplace_type", None) or "On-site"
            exp_at = getattr(j, "expires_at", None) or getattr(j, "deadline", None)
            deadline_str = exp_at.strftime("%d/%m/%Y") if hasattr(exp_at, "strftime") else (str(exp_at) if exp_at else None)

            jobs_data.append({
                "id": str(j.id),
                "title": j.title,
                "salary": sal_text,
                "location": loc.province if loc else "Toàn quốc",
                "type": emp_type,
                "workplaceType": work_mode,
                "matchScore": 95,
                "deadline": deadline_str,
            })

        detail = {
            "id": str(company.id),
            "slug": company.slug,
            "name": company.name,
            "industry": ind.name if ind else "Công nghệ thông tin",
            "logo": company.logo_url or "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=150&h=150&q=80",
            "coverImage": branding.banner_url if branding and branding.banner_url else "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=86",
            "location": loc.province if loc else "Toàn quốc",
            "website": company.website or "",
            "size": company.company_size or "Đang cập nhật",
            "isVerified": company.verification_status == "verified",
            "rating": avg_rating,
            "reviewCount": rev_count,
            "slogan": branding.slogan if branding and branding.slogan else "",
            "description": company.description or "Doanh nghiệp chưa cập nhật mô tả chi tiết.",
            "benefits": branding.benefits if branding and branding.benefits else [],
            "social_links": branding.social_links if branding and branding.social_links else {},
            "stats": {
                "experience": "Nhiều năm",
                "size": company.company_size or "Đang cập nhật",
                "jobsCount": jobs_qs.count(),
                "branchesCount": branches.count(),
            },
            "branches": branches_data,
            "jobs": jobs_data,
        }

        return Response({
            "success": True,
            "data": detail
        }, status=status.HTTP_200_OK)


