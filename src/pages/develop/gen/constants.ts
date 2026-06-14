import type { TreeDataNode } from "antd";

export interface TreeNode extends TreeDataNode {
	value: number
	title: React.ReactNode
	children?: TreeNode[]
	orderNum?: number
}

export const javaTypeOptions: { value: string, label: string }[] = [
	{ value: "Long", label: "Long" },
	{ value: "String", label: "String" },
	{ value: "Integer", label: "Integer" },
	{ value: "Double", label: "Double" },
	{ value: "BigDecmal", label: "BigDecmal" },
	{ value: "Date", label: "Date" },
	{ value: "Boolean", label: "Boolean" },
];

export const queryTypeOptions: { value: string, label: string }[] = [
	{ value: "EQ", label: "等于" },
	{ value: "NE", label: "不等于" },
	{ value: "GT", label: "大于" },
	{ value: "GE", label: "大于等于" },
	{ value: "LT", label: "小于" },
	{ value: "LE", label: "小于等于" },
	{ value: "LIKE", label: "类似" },
	{ value: "BETWEEN", label: "区间" },
];

export const htmlTypeOptions: { value: string, label: string }[] = [
	{ value: "input", label: "输入框" },
	{ value: "textarea", label: "文本域" },
	{ value: "number", label: "数字框" },
	{ value: "select", label: "下拉框" },
	{ value: "radio", label: "单选" },
	{ value: "checkbox", label: "多选" },
	{ value: "datetime", label: "日期时间" },
	{ value: "imageUpload", label: "图片上传" },
	{ value: "fileUpload", label: "文件上传" },
	{ value: "modalSearch", label: "模态选择" },
	{ value: "codeMirror", label: "代码编辑" },
	{ value: "editor", label: "富文本" },
];
