import { request } from "#src/utils/request";

/**
 * 分页查询部门列表
 * @param query
 * @returns {*}
 */
export function list(query: any) {
	return request
		.get<ApiResponse<System.Dept[]>>("system/dept/list", {
			searchParams: query,
		})
		.json();
}

/**
 * 根据ID查询部门
 * @param deptId
 */
export function getById(id: string | number) {
	return request.get<ApiResponse<System.Dept>>(`system/dept/${id}`).json();
}

/**
 * 新增部门
 * @param data
 */
export function create(data: System.Dept) {
	return request.post<ApiResponse<void>>("system/dept", { json: data }).json();
}

/**
 * 修改部门
 * @param data
 */
export function update(data: System.Dept) {
	return request.put<ApiResponse<void>>("system/dept", { json: data }).json();
}

/**
 * 删除部门
 * @param ids
 */
export function deleteByIds(ids: Array<number | string>) {
	return request
		.delete<ApiResponse<void>>(`system/dept/${ids.join(",")}`)
		.json();
}
