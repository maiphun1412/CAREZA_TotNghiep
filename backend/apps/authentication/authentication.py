from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from apps.authentication.models import Users
from apps.authentication.services.auth_service import decode_jwt


class JWTAuthentication(BaseAuthentication):
    """
    Xác thực người dùng qua JWT Bearer Token trong header:
    Authorization: Bearer <access_token>
    """

    def authenticate(self, request):
        auth_header = get_authorization_header(request).split()

        if not auth_header:
            return None

        if len(auth_header) == 1:
            raise AuthenticationFailed("Header Authorization không hợp lệ. Thiếu token.")
        elif len(auth_header) > 2:
            raise AuthenticationFailed("Header Authorization không hợp lệ. Token không được chứa khoảng trắng thừa.")

        prefix = auth_header[0].decode('utf-8')
        if prefix.lower() != 'bearer':
            return None

        token = auth_header[1].decode('utf-8')
        payload = decode_jwt(token, expected_type='access')
        user_id = payload.get("user_id")

        if not user_id:
            raise AuthenticationFailed("Token không chứa thông tin định danh người dùng.")

        user = Users.objects.filter(id=user_id, is_active=True).first()
        if not user:
            raise AuthenticationFailed("Người dùng không tồn tại hoặc đã bị khóa.")

        return (user, payload)

    def authenticate_header(self, request):
        return 'Bearer realm="api"'
