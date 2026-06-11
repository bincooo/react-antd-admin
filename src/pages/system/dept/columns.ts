import type { ProColumns } from "@ant-design/pro-components";
import type { TFunction } from "i18next";
/**
 * 由后台配置生成，不可手工修改
 */
import type { JSX } from "react";
import { executeSql } from "#src/api/common";

interface DictData {
	label: string | JSX.Element
	value: string | number
	desc?: string
}

type Merger<T> = (option: T) => T;

function merge<T>(
	columns: (T & { dataIndex: string })[],
	options?: { [column: string]: Merger<T & { dataIndex: string }> },
): T[] {
	for (const i in columns) {
		const instance = options?.[columns[i].dataIndex];
		if (instance) {
			columns[i] = instance({ ...columns[i] });
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
				},
				fieldProps: {
					placeholder: "请输入负责人",
					defaultValue: 0,
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
