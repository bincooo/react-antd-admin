import { request } from "#src/utils/request";

/**
 * 分页查询菜单权限列表
 * @param query
 * @returns {*}
 */
export function page(query: any) {
	return request.get<ApiResponse<System.Menu[]>>("system/menu/list", { searchParams: query }).json();
}

/**
 * 根据ID查询菜单权限
 * @param menuId
 */
export function getById(id: string | number) {
	return request.get<ApiResponse<System.Menu>>(`system/menu/${id}`).json();
};

/**
 * 新增菜单权限
 * @param data
 */
export function create(data: System.Menu) {
	return request.post<ApiResponse<void>>("system/menu", { json: data }).json();
}

/**
 * 修改菜单权限
 * @param data
 */
export function update(data: System.Menu) {
	return request.put<ApiResponse<void>>("system/menu", { json: data }).json();
}

/**
 * 删除菜单权限
 * @param ids
 */
export function deleteByIds(ids: Array<number | string>) {
	return request.delete<ApiResponse<void>>(`system/menu/${ids.join(",")}`).json();
}

export function dictTypes(types: string[]) {
	return request.get<ApiResponse<Record<string, { dictLabel: string, dictValue: string }[]>>>(`system/dict/data/types/${types.join(",")}`).json();
}
