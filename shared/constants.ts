export class Constants {

	public static BACKEND_HOST_PREFIX = 'http://';
	public static BACKEND_HOST = 'localhost';
	public static BACKEND_PORT = '3000';

	public static FRONTEND_HOST_PREFIX = 'http://';
	public static FRONTEND_HOST = 'localhost';
	public static FRONTEND_PORT = '5173';

	public static BACKEND_URL = `${Constants.BACKEND_HOST_PREFIX}${Constants.BACKEND_HOST}:${Constants.BACKEND_PORT}`;
	public static FRONTEND_URL = `${Constants.FRONTEND_HOST_PREFIX}${Constants.FRONTEND_HOST}:${Constants.FRONTEND_PORT}`;

	public static BACKEND_LOGIN_REDIRECT = `${Constants.BACKEND_URL}/login`;
	public static FRONTEND_LOGIN_REDIRECT = `${Constants.FRONTEND_URL}/login`;

}

