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
	return merge([
		{
			title: "菜单名称",
			dataIndex: "menuName",
			proFieldProps: {
				placeholder: "请输入菜单名称",
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
			title: "菜单类型",
			dataIndex: "menuType",
			proFieldProps: {
				placeholder: "请输入菜单类型",
			},
			valueType: "select",
			fieldProps: {
				options: [
					{ value: "M", label: "目录" },
					{ value: "C", label: "菜单" },
					{ value: "F", label: "按钮" },

				],
			},
		},
		{
			title: "显示状态",
			dataIndex: "visible",
			proFieldProps: {
				placeholder: "请输入显示状态",
			},
			valueType: "select",
			fieldProps: {
				options: [
					{ value: "0", label: "显示" },
					{ value: "1", label: "隐藏" },

				],
			},
		},
		{
			title: "菜单状态",
			dataIndex: "status",
			proFieldProps: {
				placeholder: "请输入菜单状态",
			},
			valueType: "select",
			fieldProps: {
				options: [
					{ value: "0", label: "正常" },
					{ value: "1", label: "停用" },

				],
			},
		},
		{
			title: "权限标识",
			dataIndex: "perms",
			search: false,
			proFieldProps: {
				placeholder: "请输入权限标识",
			},
		},
		{
			title: "菜单图标",
			dataIndex: "icon",
			search: false,
			proFieldProps: {
				placeholder: "请输入菜单图标",
			},
		},
		{
			title: "备注",
			dataIndex: "remark",
			search: false,
			proFieldProps: {
				placeholder: "请输入备注",
			},
		},
	], options);
}
