import type { ProColumns } from "@ant-design/pro-components";
import type { TFunction } from "i18next";
/**
 * 由后台配置生成，不可手工修改
 */
type Merger<T extends { dataIndex: string }> = (option: T) => T;

function merge<T extends { dataIndex: string }>(
	columns: (T & { dataIndex: string })[],
	options?: { [column: string]: Merger<T> },
): T[] {
	for (const idx in columns) {
		const exec = options?.[columns[idx].dataIndex];
		if (exec) {
			columns[idx] = exec({ ...columns[idx] });
		}
	}
	return columns;
}

export function getColumnList(
	t: TFunction<"translation", undefined>,
	options?: {
		[column: string]: Merger<ProColumns<System.Menu> & { dataIndex: string }>
	},
): ProColumns<System.Dept>[] {
	return merge(
		[
			{
				title: "部门名称",
				dataIndex: "deptName",
				proFieldProps: {
					placeholder: "请输入部门名称",
				},
			},
			{
				title: "类别编码",
				dataIndex: "deptCategory",
				proFieldProps: {
					placeholder: "请输入部门类别编码",
				},
			},
			{
				title: "显示顺序",
				dataIndex: "orderNum",
				search: false,
				proFieldProps: {
					placeholder: "请输入显示顺序",
				},
			},
			{
				title: "负责人",
				dataIndex: "leader",
				valueType: "modalSearch" as any,
				// search: false,
				proFieldProps: {
					searchId: "2062586130975002626",
					placeholder: "请输入负责人",
				},
			},
			{
				title: "联系电话",
				dataIndex: "phone",
				search: false,
				proFieldProps: {
					placeholder: "请输入联系电话",
				},
			},
			{
				title: "邮箱",
				dataIndex: "email",
				search: false,
				proFieldProps: {
					placeholder: "请输入邮箱",
				},
			},
			{
				title: "部门状态",
				dataIndex: "status",
				proFieldProps: {
					placeholder: "请输入部门状态",
				},
				valueType: "select",
				fieldProps: {
					options: [
						{ value: "0", label: "正常" },
						{ value: "1", label: "停用" },
					],
				},
			},
		],

		options,
	);
}
