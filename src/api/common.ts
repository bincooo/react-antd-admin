import { request } from "#src/utils/request";

export function dictTypes(types: string[]) {
	return request
		.get<
		ApiResponse<Record<string, { dictLabel: string, dictValue: string }[]>>
	>(`system/dict/data/types/${types.join(",")}`)
		.json();
}

export function executeSql(id: string, { current: pageNum, pageSize, ...params }: any) {
	return request.post<ApiListResponse<any>>(`system/sqlModel/executeSql/${id}`, { json: params, searchParams: { pageNum, pageSize } }).json();
}
