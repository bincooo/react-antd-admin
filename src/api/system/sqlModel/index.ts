import { request } from "#src/utils/request";

/**
 * 分页查询sql模型列表
 * @param query
 * @returns {*}
 */
export function page(query: any) {
	return request.get<ApiListResponse<System.SqlModel>>("system/sqlModel/page", { searchParams: query }).json();
}

/**
 * 根据ID查询sql模型
 * @param id
 */
export function getById(id: string | number) {
	return request.get<ApiResponse<System.SqlModel>>(`system/sqlModel/${id}`).json();
};

/**
 * 新增sql模型
 * @param data
 */
export function create(data: System.SqlModel) {
	return request.post<ApiResponse<void>>("system/sqlModel", { json: data }).json();
}

/**
 * 修改sql模型
 * @param data
 */
export function update(data: System.SqlModel) {
	return request.put<ApiResponse<void>>("system/sqlModel", { json: data }).json();
}

/**
 * 删除sql模型
 * @param ids
 */
export function deleteByIds(ids: Array<number | string>) {
	return request.delete<ApiResponse<void>>(`system/sqlModel/${ids.join(",")}`).json();
}
