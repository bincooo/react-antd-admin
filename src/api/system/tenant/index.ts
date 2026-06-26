import { request } from "#src/utils/request";

/**
 * 分页查询租户列表
 * @param query
 * @returns {*}
 */
export function page(query: any) {
	return request.get<ApiListResponse<System.Tenant>>("system/tenant/page", { searchParams: query }).json();
}

/**
 * 根据ID查询租户
 * @param id
 */
export function getById(id: string | number) {
	return request.get<ApiResponse<System.Tenant>>(`system/tenant/${id}`).json();
};

/**
 * 新增租户
 * @param data
 */
export function create(data: System.Tenant) {
	return request.post<ApiResponse<void>>("system/tenant", { json: data }).json();
}

/**
 * 修改租户
 * @param data
 */
export function update(data: System.Tenant) {
	return request.put<ApiResponse<void>>("system/tenant", { json: data }).json();
}

/**
 * 删除租户
 * @param ids
 */
export function deleteByIds(ids: Array<number | string>) {
	return request.delete<ApiResponse<void>>(`system/tenant/${ids.join(",")}`).json();
}
