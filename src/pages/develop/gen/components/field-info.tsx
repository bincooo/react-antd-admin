import type { ProColumnType } from "@ant-design/pro-components";
import { DragSortTable } from "@ant-design/pro-components";
import { Checkbox, Form, Input, Select } from "antd";
import { useMemo, useState } from "react";
import { htmlTypeOptions, javaTypeOptions, queryTypeOptions } from "../constants";

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
						options={(dictList ?? []).map(x => ({
							label: x.dictName,
							value: x.dictType,
						}))}
					/>
				)}
		</Form.Item>
	);
}

interface FieldInfoProps {
	dictList?: Develop.Dict[]
	dataSource?: Develop.TableColumn[]
}

export default function FieldInfo({ dictList, dataSource }: FieldInfoProps) {
	const form = Form.useFormInstance();
	const [data, setData] = useState(dataSource);
	const idIndexMap = useMemo(() => {
		const m = new Map<string, number>();
		data?.forEach((r, i) => m.set(r.columnId, i));
		return m;
	}, [data]);
	const checkboxItemProps = (namePath: (string | number)[]) => ({
		name: namePath,
		valuePropName: "checked" as const,
		getValueProps: (v: string | boolean | number) => ({ checked: v === true || v === 1 || v === "1" }),
		getValueFromEvent: (e: { target: { checked: boolean } }) => (e.target.checked ? "1" : "0"),
	});
	const handleDragSortEnd = (
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
	};

	const renderColumnCell = (dataIndex: keyof Develop.TableColumn, node: React.ReactNode) =>
		(_: React.ReactNode, record: Develop.TableColumn) => {
			const idx = idIndexMap.get(record.columnId);
			if (idx === undefined)
				return null;
			return (
				<Form.Item name={["columns", idx, dataIndex]} style={{ margin: 0 }}>
					{node}
				</Form.Item>
			);
		};

	const renderCheckboxCell = (dataIndex: string) =>
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
		};

	const columns: ProColumnType<Develop.TableColumn>[] = [
		{
			title: "排序",
			dataIndex: "sort",
			width: 60,
			className: "drag-visible",
			search: false,
		},
		{
			title: "字段列名",
			dataIndex: "columnName",
			width: 180,
			search: false,
		},
		{
			title: "字段描述",
			dataIndex: "columnComment",
			minWidth: 230,
			search: false,
			render: renderColumnCell("columnComment", <Input />),
		},
		{
			title: "JAVA属性",
			dataIndex: "javaField",
			minWidth: 230,
			search: false,
			render: renderColumnCell("javaField", <Input />),
		},
		{
			title: "字段类型",
			dataIndex: "columnType",
			width: 90,
			search: false,
		},
		{
			title: "JAVA类型",
			dataIndex: "javaType",
			width: 120,
			search: false,
			render: renderColumnCell("javaType", <Select style={{ width: 120 }} options={javaTypeOptions} showSearch />),
		},
		{
			title: "插入",
			dataIndex: "isInsert",
			width: 60,
			align: "center",
			search: false,
			render: renderCheckboxCell("isInsert"),
		},
		{
			title: "编辑",
			dataIndex: "isEdit",
			width: 60,
			align: "center",
			search: false,
			render: renderCheckboxCell("isEdit"),
		},
		{
			title: "列表",
			dataIndex: "isList",
			width: 60,
			search: false,
			render: renderCheckboxCell("isList"),
		},
		{
			title: "查询",
			dataIndex: "isQuery",
			width: 60,
			search: false,
			render: renderCheckboxCell("isQuery"),
		},
		{
			title: "查询方式",
			dataIndex: "queryType",
			width: 100,
			search: false,
			render: renderColumnCell("queryType", <Select style={{ width: 100 }} options={queryTypeOptions} showSearch />),
		},
		{
			title: "必填",
			dataIndex: "isRequired",
			width: 60,
			search: false,
			render: renderCheckboxCell("required"),
		},
		{
			title: "显示类型",
			dataIndex: "htmlType",
			width: 120,
			search: false,
			render: renderColumnCell("htmlType", <Select style={{ width: 120 }} options={htmlTypeOptions} showSearch />),
		},
		{
			title: "字典类型",
			dataIndex: "dictType",
			width: 160,
			search: false,
			render: (_: React.ReactNode, record: Develop.TableColumn) => {
				const idx = idIndexMap.get(record.columnId);
				if (idx === undefined)
					return null;
				return <DictTypeCell index={idx} dictList={dictList} />;
			},
		},
	];

	return (
		<DragSortTable<Develop.TableColumn>
			rowKey="columnId"
			styles={{
				body: {
					cell: { padding: 5, height: 50 },
				},
			}}
			scroll={{ y: "calc(100vh - 511px)", x: "max-content" }}
			dataSource={data}
			pagination={false}
			toolBarRender={false}
			dragSortKey="sort"
			onDragSortEnd={handleDragSortEnd}
			search={false}
			columns={columns}
		/>
	);
}
