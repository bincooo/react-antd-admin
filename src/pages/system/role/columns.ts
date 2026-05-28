import type { ProColumns } from "@ant-design/pro-components";
import type { TFunction } from "i18next";
/**
 * 由后台配置生成，不可手工修改
 */
import type { JSX } from "react";

interface DictData {
	label: string | JSX.Element
	value: string | number
	desc?: string
}
export type R = (list: { label: string, value: string }[]) => DictData[] | undefined;

function render(list: { label: string, value: string }[], _render?: R) {
	return _render ? _render(list) : list;
}

export function getColumnList(t: TFunction<"translation", undefined>, options?: { [column: string]: R }): ProColumns<System.Role>[] {
	return [
		{
			dataIndex: "index",
			title: "序号",
			valueType: "index",
			fixed: "left",
			width: 80,
		},
		{
			title: "角色名称",
			dataIndex: "roleName",
			proFieldProps: {
				placeholder: "请输入角色名称",
			},
		},
		{
			title: "权限字符",
			dataIndex: "roleKey",
			proFieldProps: {
				placeholder: "请输入权限字符",
			},
		},
		{
			title: "显示顺序",
			dataIndex: "roleSort",
			search: false,
			proFieldProps: {
				placeholder: "请输入显示顺序",
			},
		},
		{
			title: "数据范围",
			dataIndex: "dataScope",
			search: false,
			proFieldProps: {
				placeholder: "请输入数据范围",
			},
			valueType: "select",
			fieldProps: {
				options: render(
					[
						{ value: "1", label: "全部数据权限" },
						{ value: "2", label: "自定数据权限" },
						{ value: "3", label: "本部门数据权限" },
						{ value: "4", label: "本部门及以下数据权限" },
						{ value: "5", label: "仅本人数据权限" },
						{ value: "6", label: "部门及以下或本人数据权限" },

					],
					options?.dataScope,
				),
			},
		},
		{
			title: "角色状态",
			dataIndex: "status",
			proFieldProps: {
				placeholder: "请输入角色状态",
			},
			valueType: "select",
			fieldProps: {
				options: render(
					[
						{ value: "0", label: "正常" },
						{ value: "1", label: "停用" },

					],
					options?.status,
				),
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
	];
}
