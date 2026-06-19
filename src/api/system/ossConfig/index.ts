import { request } from "#src/utils/request";

/**
 * 分页查询对象存储配置列表
 * @param query
 * @returns {*}
 */
export function page(query: any) {
	return request.get<ApiListResponse<System.OssConfig>>("resource/oss/config/page", { searchParams: query }).json();
}

/**
 * 根据ID查询对象存储配置
 * @param ossConfigId
 */
export function getById(id: string | number) {
	return request.get<ApiResponse<System.OssConfig>>(`resource/oss/config/${id}`).json();
};

/**
 * 新增对象存储配置
 * @param data
 */
export function create(data: System.OssConfig) {
	return request.post<ApiResponse<void>>("resource/oss/config", { json: data }).json();
}

/**
 * 修改对象存储配置
 * @param data
 */
export function update(data: System.OssConfig) {
	return request.put<ApiResponse<void>>("resource/oss/config", { json: data }).json();
}

/**
 * 删除对象存储配置
 * @param ids
 */
export function deleteByIds(ids: Array<number | string>) {
	return request.delete<ApiResponse<void>>(`resource/oss/config/${ids.join(",")}`).json();
}

/**
 * 设置为默认
 */
export function changeStatus(data: System.OssConfig.UpdateStatus) {
	return request.put<ApiResponse<any>>("resource/oss/config/changeStatus", { json: data }).json();
}
