from rest_framework.permissions import BasePermission
from apps.authentication.services.auth_service import get_user_roles_list, get_user_company_info


class IsAuthenticatedCustom(BasePermission):
    """Quyền yêu cầu người dùng đã đăng nhập hợp lệ qua JWT."""
    message = "Bạn cần đăng nhập để thực hiện thao tác này."

    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, "is_active", False))


class IsCandidate(BasePermission):
    """Quyền chỉ dành cho Ứng viên (Candidate)."""
    message = "Quyền truy cập chỉ dành cho Ứng viên."

    def has_permission(self, request, view):
        if not (request.user and getattr(request.user, "is_active", False)):
            return False
        if request.user.account_type == "candidate":
            return True
        auth_dict = getattr(request, "auth", None)
        if not isinstance(auth_dict, dict):
            auth_dict = {}
        roles = auth_dict.get("roles") or get_user_roles_list(request.user.id)
        return "candidate" in roles


class IsEmployer(BasePermission):
    """Quyền chỉ dành cho Nhà tuyển dụng / Doanh nghiệp (Employer)."""
    message = "Quyền truy cập chỉ dành cho Nhà tuyển dụng hoặc đại diện Doanh nghiệp."

    def has_permission(self, request, view):
        if not (request.user and getattr(request.user, "is_active", False)):
            return False
        if request.user.account_type in ("employer", "company"):
            return True
        auth_dict = getattr(request, "auth", None)
        if not isinstance(auth_dict, dict):
            auth_dict = {}
        roles = auth_dict.get("roles") or get_user_roles_list(request.user.id)
        employer_roles = {"employer", "owner", "company_admin", "recruiter"}
        return bool(set(roles) & employer_roles)


class IsAdmin(BasePermission):
    """Quyền chỉ dành cho Quản trị viên hệ thống (Admin)."""
    message = "Quyền truy cập chỉ dành cho Quản trị viên hệ thống."

    def has_permission(self, request, view):
        if not (request.user and getattr(request.user, "is_active", False)):
            return False
        db_roles = get_user_roles_list(request.user.id)
        if "admin" in db_roles or "super_admin" in db_roles:
            return True
        if request.user.account_type == "admin" and not db_roles:
            return True
        return False


class HasCompanyAccess(BasePermission):
    """Kiểm tra người dùng có quyền quản lý công ty cụ thể."""
    message = "Bạn không có quyền quản lý doanh nghiệp này."

    def has_permission(self, request, view):
        if not (request.user and getattr(request.user, "is_active", False)):
            return False
        auth_dict = getattr(request, "auth", None)
        if not isinstance(auth_dict, dict):
            auth_dict = {}
        company_info = auth_dict.get("company") or get_user_company_info(request.user.id)
        return bool(company_info and company_info.get("company_id"))
