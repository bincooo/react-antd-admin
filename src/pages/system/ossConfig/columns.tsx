import type { ProColumns } from "@ant-design/pro-components";
import type { TFunction } from "i18next";
/**
 * 由后台配置生成，不可手工修改
 */
import type { JSX } from "react";

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
		[column: string]: Merger<
      ProColumns<System.OssConfig> & { dataIndex: string }
		>
	},
): ProColumns<System.OssConfig>[] {
	return merge(
		[
			{
				dataIndex: "index",
				title: "序号",
				valueType: "index",
				fixed: "left",
				width: 80,
			},
			{
				title: "配置key",
				dataIndex: "configKey",
				proFieldProps: {
					placeholder: "请输入配置key",
				},
			},
			{
				title: "桶名称",
				dataIndex: "bucketName",
				proFieldProps: {
					placeholder: "请输入桶名称",
				},
			},
			{
				title: "前缀",
				dataIndex: "prefix",
				search: false,
				proFieldProps: {
					placeholder: "请输入前缀",
				},
			},
			{
				title: "访问站点",
				dataIndex: "endpoint",
				search: false,
				proFieldProps: {
					placeholder: "请输入访问站点",
				},
			},
			{
				title: "自定义域名",
				dataIndex: "domain",
				search: false,
				proFieldProps: {
					placeholder: "请输入自定义域名",
				},
			},
			{
				title: "是否https",
				dataIndex: "isHttps",
				search: false,
				proFieldProps: {
					placeholder: "请输入是否https",
				},
				valueType: "select",
				fieldProps: {
					options: [
						{ value: "Y", label: "是" },
						{ value: "N", label: "否" },
					],
				},
			},
			{
				title: "域",
				dataIndex: "region",
				search: false,
				proFieldProps: {
					placeholder: "请输入域",
				},
			},
			{
				title: "桶权限类型",
				dataIndex: "accessPolicy",
				search: false,
				proFieldProps: {
					placeholder: "请输入桶权限类型",
				},
				valueType: "select",
				fieldProps: {
					options: [
						{ value: "0", label: "private" },
						{ value: "1", label: "public" },
						{ value: "2", label: "custom" },
					],
				},
			},
			{
				title: "是否默认",
				dataIndex: "status",
				proFieldProps: {
					placeholder: "请输入是否默认",
				},
				valueType: "select",
				fieldProps: {
					options: [
						{ value: "0", label: "是" },
						{ value: "1", label: "否" },
					],
				},
			},
			{
				title: "扩展字段",
				dataIndex: "ext1",
				search: false,
				proFieldProps: {
					placeholder: "请输入扩展字段",
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
		],

		options,
	);
}
