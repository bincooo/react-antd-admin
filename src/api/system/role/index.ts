import { request } from "#src/utils/request";

/**
 * 分页查询角色信息列表
 * @param query
 * @returns {*}
 */
export function page(query: any) {
	return request.get<ApiListResponse<System.Role>>("system/role/list", { searchParams: query }).json();
}

/**
 * 根据ID查询角色信息
 * @param roleId
 */
export function getById(id: string | number) {
	return request.get<ApiResponse<System.Role>>(`system/role/${id}`).json();
};

/**
 * 新增角色信息
 * @param data
 */
export function create(data: System.Role) {
	return request.post<ApiResponse<void>>("system/role", { json: data }).json();
}

/**
 * 修改角色信息
 * @param data
 */
export function update(data: System.Role) {
	return request.put<ApiResponse<void>>("system/role", { json: data }).json();
}

/**
 * 删除角色信息
 * @param ids
 */
export function deleteByIds(ids: Array<number | string>) {
	return request.delete<ApiResponse<void>>(`system/role/${ids.join(",")}`).json();
}

export function dictTypes(types: string[]) {
	return request.get<ApiResponse<Record<string, { dictLabel: string, dictValue: string }[]>>>(`system/dict/data/types/${types.join(",")}`).json();
}
