export function resultSuccess(data: unknown, { message = "ok" } = {}) {
	return {
		code: 200,
		data,
		message,
		success: true,
	};
}
