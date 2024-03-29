export class Constants {

	public static BACKEND_HOST_PREFIX = 'http://';
	public static BACKEND_HOST = 'f1r4s20.codam.nl';
	public static BACKEND_PORT = '3000';

	public static FRONTEND_HOST_PREFIX = 'http://';
	public static FRONTEND_HOST = 'f1r4s20.codam.nl';
	public static FRONTEND_PORT = '3000';

	public static BACKEND_URL = `${Constants.BACKEND_HOST_PREFIX}${Constants.BACKEND_HOST}:${Constants.BACKEND_PORT}/api`;
	public static FRONTEND_URL = `${Constants.FRONTEND_HOST_PREFIX}${Constants.FRONTEND_HOST}:${Constants.FRONTEND_PORT}`;

	public static BACKEND_LOGIN_REDIRECT = `${Constants.BACKEND_URL}/login`;
	public static FRONTEND_LOGIN_REDIRECT = `${Constants.FRONTEND_URL}/`;
	public static BACKEND_OTP_REDIRECT = `${Constants.BACKEND_URL}/loginOTP`;
	public static FRONTEND_OTP_REDIRECT = `${Constants.FRONTEND_URL}/loginOTP`;
	public static BACKEND_SETUP_REDIRECT = `${Constants.BACKEND_URL}/setup`;
	public static FRONTEND_SETUP_REDIRECT = `${Constants.FRONTEND_URL}/setup`;

	public static FRONTEND_QR_REDIRECT = `${Constants.FRONTEND_URL}/qr`;

	public static FETCH_SELF = `${Constants.BACKEND_URL}/self`
	public static FETCH_SELF_PFP = `${Constants.BACKEND_URL}/self/pfp`
	public static FETCH_USERS = `${Constants.BACKEND_URL}/users`
	public static POST_ADDFRIEND = `${Constants.BACKEND_URL}/self/friends`;
}

