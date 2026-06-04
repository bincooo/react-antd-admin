import { request } from "#src/utils/request";

/**
 * 分页查询角色信息列表
 * @param query
 * @returns {*}
 */
export function page(query: any) {
	return request.get<ApiListResponse<System.User>>("system/user/list", { searchParams: query }).json();
}
