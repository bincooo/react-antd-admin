import type { TreeDataNode } from "antd";

/**
 * 代码生成器常量定义
 * - 选项配置：Java 类型、查询方式、HTML 控件等
 * - 树节点结构：用于菜单树的树形数据
 */

/**
 * 树节点类型（扩展自 Ant Design TreeDataNode）
 * @description 用于代码生成器的菜单树形结构
 */
export interface TreeNode extends TreeDataNode {
	/** 节点值（菜单 ID） */
	value: number
	/** 节点标题 */
	title: React.ReactNode
	/** 子节点列表 */
	children?: TreeNode[]
	/** 排序号 */
	orderNum?: number
}

/**
 * Java 数据类型选项
 */
export const javaTypeOptions = [
	{ value: "Long", label: "Long" },
	{ value: "String", label: "String" },
	{ value: "Integer", label: "Integer" },
	{ value: "Double", label: "Double" },
	{ value: "BigDecmal", label: "BigDecmal" },
	{ value: "Date", label: "Date" },
	{ value: "Boolean", label: "Boolean" },
];

/**
 * SQL 查询方式选项
 */
export const queryTypeOptions = [
	{ value: "EQ", label: "等于" },
	{ value: "NE", label: "不等于" },
	{ value: "GT", label: "大于" },
	{ value: "GE", label: "大于等于" },
	{ value: "LT", label: "小于" },
	{ value: "LE", label: "小于等于" },
	{ value: "LIKE", label: "类似" },
	{ value: "BETWEEN", label: "区间" },
];

/**
 * 表单控件类型选项
 */
export const htmlTypeOptions = [
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
