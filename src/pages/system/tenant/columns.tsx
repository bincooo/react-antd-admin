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
	options?: { [column: string]: Merger<ProColumns<System.Tenant> & { dataIndex: string }> },
): ProColumns<System.Tenant>[] {
	return merge([
		{
			dataIndex: "index",
			title: "序号",
			valueType: "index",
			fixed: "left",
			width: 80,
		},
		{
			title: "租户编号",
			dataIndex: "tenantId",
			proFieldProps: {
				placeholder: "请输入租户编号",
			},
		},
		{
			title: "联系电话",
			dataIndex: "contactPhone",
			proFieldProps: {
				placeholder: "请输入联系电话",
			},
		},
		{
			title: "企业名称",
			dataIndex: "companyName",
			proFieldProps: {
				placeholder: "请输入企业名称",
			},
		},
		{
			title: "统一社会信用代码",
			dataIndex: "licenseNumber",
			search: false,
			proFieldProps: {
				placeholder: "请输入统一社会信用代码",
			},
		},
		{
			title: "租户状态",
			dataIndex: "status",
			search: false,
			proFieldProps: {
				placeholder: "请输入租户状态",
			},
			valueType: "select",
			fieldProps: {
				options: [
					{ value: "0", label: "正常" },
					{ value: "1", label: "停用" },
				],
			},
		},
	], options);
}
