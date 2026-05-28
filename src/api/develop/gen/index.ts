import { request } from "#src/utils/request";

/* 获取数据表结构列表 */
export function fetchList(data: any) {
	return request.get<ApiListResponse<Develop.Table>>("tool/gen/list", { searchParams: data, ignoreLoading: true }).json();
}

/* 获取原表结构列表 */
export function fetchDbList(data: any) {
	return request.get<ApiListResponse<Develop.DbTable>>("tool/gen/db/list", { searchParams: data }).json();
}

/* 查询数据源名称列表 */
export function fetchDataNames() {
	return request.get<ApiResponse<string[]>>("tool/gen/getDataNames").json();
}

/* 导入表结构 */
export function fetchImportTable(tableNames: string[], dataName: string) {
	return request.post<ApiResponse<string[]>>("tool/gen/importTable", { searchParams: { tables: tableNames.join(","), dataName } }).json();
}

/* 删除表结构 */
export function fetchDeleteDbTables(ids: string[]) {
	return request.delete<ApiResponse<void>>(`tool/gen/${ids.join(",")}`).json();
}

/* 同步表结构 */
export function fetchSyncDbTable(id: string) {
	return request.get<ApiResponse<void>>(`tool/gen/synchDb/${id}`).json();
}

/* 预览 */
export function fetchPreviewCodes(id: string) {
	return request.get<ApiResponse<Record<string, string>>>(`tool/gen/preview/${id}`).json();
}

/* 生成代码 */
export function fetchGenarateZip(ids: string[]) {
	return request.get<Blob>(`tool/gen/batchGenCode?tableIdStr=${ids.join(",")}`).blob();
}

/* 生成代码 */
export function fetchGenarateProj(id: string) {
	return request.get<ApiResponse<void>>(`tool/gen/genCode/${id}`).json();
}

/* 获取表列信息 */
export function fetchTableInfo(id: string) {
	return request.get<ApiResponse<Develop.TableMeta>>(`tool/gen/${id}`).json();
}

/* 获取菜单列表 */
export function getMenuList() {
	return request.get<ApiResponse<Develop.MenuTree[]>>("system/menu/list").json();
}

export function getRoleMenuTree(roleId: string | number) {
	return request.get<ApiResponse<{ menus: Develop.MenuTree[], checkedKeys: number[] }>>(`system/menu/roleMenuTreeselect/${roleId}`).json();
}

/* 字典列表 */
export function fetchDictList() {
	return request.get<ApiListResponse<Develop.Dict>>("system/dict/type/optionselect").json();
}

/* 保存生成数据 */
export function saveGenerate(data: any) {
	return request.put<ApiResponse<void>>("tool/gen", { json: data }).json();
}
