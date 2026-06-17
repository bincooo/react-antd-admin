/**
 * 代码生成器 - 字段信息表格
 * 拖拽排序、查看模式（枚举标签）/ 编辑模式（表单控件）切换
 */

import type { ProColumnType } from "@ant-design/pro-components";
import { DragSortTable } from "@ant-design/pro-components";
import { Button, Checkbox, Form, Input, Select, Tag } from "antd";
import { useCallback, useMemo, useState } from "react";
import { htmlTypeOptions, javaTypeOptions, queryTypeOptions } from "../constants";

/**
 * 字典类型编辑单元格
 */
function DictTypeCell({ index, dictList }: { index: number, dictList?: Develop.Dict[] }) {
	const form = Form.useFormInstance();
	const htmlType = Form.useWatch(["columns", index, "htmlType"], form);
	return (
		<Form.Item
			name={["columns", index, htmlType === "modalSearch" ? "searchId" : "dictType"]}
			style={{ margin: 0 }}
		>
			{htmlType === "modalSearch"
				? <Input style={{ width: 160 }} allowClear />
				: (
					<Select
						style={{ width: 160 }}
						showSearch
						allowClear
						options={dictList?.map((x: any) => ({ label: x.dictName, value: x.dictType, desc: x.dictType }))}
						optionRender={(option) => {
							const data: any = option.data;
							return (
								<div>
									<div style={{ height: 20 }}>{data.label}</div>
									<div style={{ fontSize: 12, color: "grey" }}>{data.desc}</div>
								</div>
							);
						}}
					/>
				)}
		</Form.Item>
	);
}

interface FieldInfoProps {
	/** 字典类型列表 */
	dictList?: Develop.Dict[]
	/** 字段列数据源 */
	dataSource?: Develop.TableColumn[]
}

/**
 * Checkbox 与 "0"/"1" 互转配置
 */
function checkboxItemProps(namePath: (string | number)[]) {
	return {
		name: namePath,
		valuePropName: "checked" as const,
		getValueProps: (v: string | boolean | number) => ({ checked: v === true || v === 1 || v === "1" }),
		getValueFromEvent: (e: { target: { checked: boolean } }) => (e.target.checked ? "1" : "0"),
	};
}

/**
 * 字段信息表格组件
 * @description 查看模式显示枚举标签，编辑模式显示表单控件，支持拖拽排序
 */
export default function FieldInfo({ dictList, dataSource }: FieldInfoProps) {
	const form = Form.useFormInstance();
	const [data, setData] = useState(dataSource);
	const [isEditing, setIsEditing] = useState(false);

	// 字段 ID → 索引 映射表
	const idIndexMap = useMemo(() => {
		const m = new Map<string, number>();
		data?.forEach((r, i) => m.set(r.columnId, i));
		return m;
	}, [data]);

	/**
	 * 拖拽排序完成回调
	 */
	const handleDragSortEnd = useCallback((
		beforeIndex: number,
		afterIndex: number,
		newDataSource: Develop.TableColumn[],
	) => {
		const updated = newDataSource.map((item, index) => ({
			...item,
			sort: index + 1,
		}));
		setData(updated);
		form.setFieldValue("columns", updated);
	}, [form]);

	/**
	 * 编辑模式 - 表单控件列
	 */
	const renderColumnCell = useCallback((dataIndex: keyof Develop.TableColumn, node: React.ReactNode) =>
		(_: React.ReactNode, record: Develop.TableColumn) => {
			const idx = idIndexMap.get(record.columnId);
			if (idx === undefined)
				return null;
			return (
				<Form.Item name={["columns", idx, dataIndex]} style={{ margin: 0 }}>
					{node}
				</Form.Item>
			);
		}, [idIndexMap]);

	/**
	 * 编辑模式 - Checkbox 控件列
	 */
	const renderCheckboxCell = useCallback((dataIndex: string) =>
		(_: React.ReactNode, record: Develop.TableColumn) => {
			const idx = idIndexMap.get(record.columnId);
			if (idx === undefined)
				return null;
			return (
				<div style={{ display: "flex", justifyContent: "center" }}>
					<Form.Item {...checkboxItemProps(["columns", idx, dataIndex])} noStyle>
						<Checkbox />
					</Form.Item>
				</div>
			);
		}, [idIndexMap]);

	/**
	 * 查看模式 - 枚举值 → 标签渲染
	 */
	const renderOptionLabel = useCallback((dataIndex: keyof Develop.TableColumn, options: { value: string, label: string }[]) =>
		(_: React.ReactNode, record: Develop.TableColumn) => {
			const value = record[dataIndex] as string;
			const option = options.find(o => o.value === value);
			return option?.label ?? value ?? "-";
		}, []);

	/**
	 * 查看模式 - 布尔值 → 标签渲染
	 */
	const renderBooleanLabel = useCallback((dataIndex: keyof Develop.TableColumn) =>
		(_: React.ReactNode, record: Develop.TableColumn) => {
			const value = record[dataIndex];
			const checked = value === true || value === 1 || value === "1";
			return <Tag color={checked ? "green" : "default"}>{checked ? "是" : "否"}</Tag>;
		}, []);

	/**
	 * 查看模式 - 字典类型 → 字典名称
	 */
	const renderDictTypeLabel = useCallback((_: React.ReactNode, record: Develop.TableColumn) => {
		const value = record.dictType;
		if (!value)
			return "-";
		const found = dictList?.find(d => d.dictType === value);
		return <Tag>{found?.dictName ?? value}</Tag>;
	}, [dictList]);

	/**
	 * 列定义（按模式切换 render）
	 */
	const columns: ProColumnType<Develop.TableColumn>[] = useMemo(() => {
		const base: ProColumnType<Develop.TableColumn>[] = [
			{ title: "排序", dataIndex: "sort", width: 60, className: "drag-visible", search: false },
			{ title: "字段列名", dataIndex: "columnName", width: 180, search: false },
			{ title: "字段描述", dataIndex: "columnComment", minWidth: 230, search: false },
			{ title: "JAVA属性", dataIndex: "javaField", minWidth: 230, search: false },
			{ title: "字段类型", dataIndex: "columnType", width: 90, search: false },
			{ title: "JAVA类型", dataIndex: "javaType", width: 120, search: false, render: renderOptionLabel("javaType", javaTypeOptions) },
			{ title: "插入", dataIndex: "isInsert", width: 60, align: "center", search: false, render: renderBooleanLabel("isInsert") },
			{ title: "编辑", dataIndex: "isEdit", width: 60, align: "center", search: false, render: renderBooleanLabel("isEdit") },
			{ title: "列表", dataIndex: "isList", width: 60, align: "center", search: false, render: renderBooleanLabel("isList") },
			{ title: "查询", dataIndex: "isQuery", width: 60, align: "center", search: false, render: renderBooleanLabel("isQuery") },
			{ title: "查询方式", dataIndex: "queryType", width: 100, search: false, render: renderOptionLabel("queryType", queryTypeOptions) },
			{ title: "必填", dataIndex: "isRequired", width: 60, align: "center", search: false, render: renderBooleanLabel("isRequired") },
			{ title: "显示类型", dataIndex: "htmlType", width: 120, search: false, render: renderOptionLabel("htmlType", htmlTypeOptions) },
			{ title: "字典类型", dataIndex: "dictType", width: 160, search: false, render: renderDictTypeLabel },
		];

		// 查看模式直接返回
		if (!isEditing)
			return base;

		// 编辑模式：覆盖 render 为表单控件
		base[2].render = renderColumnCell("columnComment", <Input />);
		base[3].render = renderColumnCell("javaField", <Input />);
		base[5].render = renderColumnCell("javaType", <Select style={{ width: 120 }} options={javaTypeOptions} showSearch />);
		base[6].render = renderCheckboxCell("isInsert");
		base[7].render = renderCheckboxCell("isEdit");
		base[8].render = renderCheckboxCell("isList");
		base[9].render = renderCheckboxCell("isQuery");
		base[10].render = renderColumnCell("queryType", <Select style={{ width: 100 }} options={queryTypeOptions} showSearch />);
		base[11].render = renderCheckboxCell("required");
		base[12].render = renderColumnCell("htmlType", <Select style={{ width: 120 }} options={htmlTypeOptions} showSearch />);
		base[13].render = (_: React.ReactNode, record: Develop.TableColumn) => {
			const idx = idIndexMap.get(record.columnId);
			if (idx === undefined)
				return null;
			return <DictTypeCell index={idx} dictList={dictList} />;
		};

		return base;
	}, [idIndexMap, dictList, isEditing, renderColumnCell, renderCheckboxCell, renderOptionLabel, renderBooleanLabel, renderDictTypeLabel]);

	/**
	 * 切换编辑状态
	 * 关闭编辑时将表单最新值同步到 dataSource
	 */
	const handleToggleEdit = useCallback(() => {
		if (isEditing) {
			const values = form.getFieldValue("columns") as Develop.TableColumn[];
			if (values)
				setData(values);
		}
		setIsEditing(!isEditing);
	}, [isEditing, form]);

	return (
		<DragSortTable<Develop.TableColumn>
			rowKey="columnId"
			styles={{ body: { cell: { padding: 5, height: 50 } } }}
			scroll={{ y: "calc(100vh - 511px)", x: "max-content" }}
			dataSource={data}
			pagination={false}
			dragSortKey={isEditing ? "" : "sort"}
			onDragSortEnd={handleDragSortEnd}
			search={false}
			columns={columns}
			toolBarRender={() => [
				<Button
					key="toggle"
					type={isEditing ? "default" : "primary"}
					onClick={handleToggleEdit}
				>
					{isEditing ? "关闭" : "编辑"}
				</Button>,
			]}
		/>
	);
}
