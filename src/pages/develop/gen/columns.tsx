import type { ProColumns } from "@ant-design/pro-components";
import type { TFunction } from "i18next";

/**
 * 代码生成器列表 - 列定义
 * 用于 ProTable 的列配置
 */

/**
 * 自定义渲染函数类型
 * @description 用于处理特定字段的选项渲染，返回选项数据函数或 undefined
 */
export type Render = (dataIndex: string) => (() => { label: string, value: string, desc?: string }[]) | undefined;

/**
 * 链式过滤函数：根据字段名查找对应的渲染器并执行
 * @param dataIndex 字段名
 * @param renders 渲染函数列表
 * @returns 选项数据数组或 undefined
 */
function chainFilter(dataIndex: string, renders?: Render[]) {
	if (!renders)
		return;
	for (const h of renders) {
		const callback = h(dataIndex);
		if (callback) {
			return callback();
		}
	}
}

/**
 * 获取表格列定义
 * @param t 国际化翻译函数
 * @param renders 自定义渲染函数列表，用于动态生成字段选项
 * @returns ProTable 列配置数组
 */
export function getColumns(t: TFunction<"translation", undefined>, renders?: Render[]): ProColumns<Develop.Table>[] {
	return [
		{
			dataIndex: "index",
			title: "序号",
			valueType: "index",
			width: 50,
		},
		{
			title: "数据源",
			dataIndex: "dataName",
			disable: true,
			ellipsis: true,
			width: 120,
			valueType: "select",
			formItemProps: {
				rules: [
					{
						required: true,
						message: t("form.required"),
					},
				],
			},
			fieldProps: {
				options: chainFilter("dataName", renders),
			},
		},
		{
			disable: true,
			title: "表名称",
			dataIndex: "tableName",
			width: 120,
			filters: true,
			onFilter: true,
			ellipsis: true,
		},
		{
			disable: true,
			title: "表描述",
			dataIndex: "tableComment",
			width: 170,
		},
		{
			title: "实体",
			dataIndex: "className",
			search: false,
		},
		{
			title: "创建时间",
			dataIndex: "createTime",
			valueType: "date",
			width: 100,
			search: false,
		},
		{
			title: "更新时间",
			dataIndex: "updateTime",
			valueType: "date",
			width: 100,
			search: false,
		},
	];
}
