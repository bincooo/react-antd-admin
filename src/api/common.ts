import type { AwsS3UploadParameters } from "@uppy/aws-s3";
import { request } from "#src/utils/request";

/** 获取字典数据 */
export function dictTypes(types: string[]) {
	return request
		.get<
		ApiResponse<Record<string, { dictLabel: string, dictValue: string }[]>>
	>(`system/dict/data/types/${types.join(",")}`)
		.json();
}

/** 执行模型SQL */
export function executeSql(id: string, { current: pageNum, pageSize, ...params }: any) {
	return request.post<ApiListResponse<any>>(`system/sqlModel/executeSql/${id}`, { json: params, searchParams: { pageNum, pageSize } }).json();
}

export function createPresigned(checksum: string, filename: string, extension: string) {
	return request.get<ApiResponse<AwsS3UploadParameters & { method: "PUT" }>>("/resource/oss/presigned", {
		headers: {
			"x-amz-checksum-crc32": checksum,
			"x-amz-meta-filename": encodeURIComponent(filename),
			"x-amz-meta-extension": extension,
		},
	}).json();
}
