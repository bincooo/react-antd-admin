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

type Merger<T> = (option: T) => T;

function merge<T>(columns: (T & { dataIndex: string })[], options?: { [column: string]: Merger<T & { dataIndex: string }> }): T[] {
	for (const i in columns) {
		const instance = options?.[columns[i].dataIndex];
		if (instance) {
			columns[i] = instance({ ...columns[i] });
		}
	}
	return columns;
}

export function getColumnList(t: TFunction<"translation", undefined>, options?: { [column: string]: Merger<ProColumns<System.SqlModel> & { dataIndex: string }> }): ProColumns<System.SqlModel>[] {
	return merge([
		{
			dataIndex: "index",
			title: "序号",
			valueType: "index",
			fixed: "left",
			width: 80,
		},
		{
			title: "唯一ID",
			dataIndex: "id",
			proFieldProps: {
				placeholder: "请输入唯一ID",
			},
		},
		{
			title: "sql语句",
			dataIndex: "sqlText",
			search: false,
			proFieldProps: {
				placeholder: "请输入sql语句",
			},
		},
		{
			title: "模型名称",
			dataIndex: "name",
			proFieldProps: {
				placeholder: "请输入模型名称",
			},
		},
		{
			title: "模型描述",
			dataIndex: "description",
			search: false,
			proFieldProps: {
				placeholder: "请输入模型描述",
			},
		},
	], options);
}
