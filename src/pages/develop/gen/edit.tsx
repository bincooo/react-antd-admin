import type {

	TablePaginationConfig,
} from "antd";
import { useMutation, useQueries } from "@tanstack/react-query";
import {
	Button,
	Card,
	Checkbox,
	Col,
	Divider,
	Form,
	Input,
	Layout,

	Radio,
	Row,
	Select,
	Space,
	Spin,
	Table,
	Tabs,
	theme,

	TreeSelect,
} from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import {
	fetchDictList,
	fetchTableInfo,
	getMenuList,
	saveGenerate,
} from "#src/api/develop/gen";
import { BasicContent } from "#src/components/basic-content";
import { useTabsStore } from "#src/store/tabs";

interface Menu {
	menuId: number
	remark: string
	parentId: number
	orderNum?: number
	menuType: string
}

interface TreeNode {
	value: number
	title: React.ReactNode
	children?: TreeNode[]
	orderNum?: number
}

const javaTypeOptions = [
	{ value: "Long", label: "Long" },
	{ value: "String", label: "String" },
	{ value: "Integer", label: "Integer" },
	{ value: "Double", label: "Double" },
	{ value: "BigDecmal", label: "BigDecmal" },
	{ value: "Date", label: "Date" },
	{ value: "Boolean", label: "Boolean" },
];

const queryTypeOptions = [
	{ value: "EQ", label: "等于" },
	{ value: "NE", label: "不等于" },
	{ value: "GT", label: "大于" },
	{ value: "GE", label: "大于等于" },
	{ value: "LT", label: "小于" },
	{ value: "LE", label: "小于等于" },
	{ value: "LIKE", label: "类似" },
	{ value: "BETWEEN", label: "区间" },
];

const htmlTypeOptions = [
	{ value: "input", label: "输入框" },
	{ value: "textarea", label: "文本域" },
	{ value: "number", label: "数字框" },
	{ value: "select", label: "下拉框" },
	{ value: "radio", label: "单选" },
	{ value: "checkbox", label: "多选" },
	{ value: "datetime", label: "日期时间" },
	{ value: "imageUpload", label: "图片上传" },
	{ value: "fileUpload", label: "文件上传" },
	{ value: "editor", label: "富文本" },
];

function buildMenuTreeData(list: Menu[]): TreeNode[] {
	list = (list || []).filter(x => x.menuType === "M");
	const map = new Map<number, TreeNode>();
	for (const item of list) {
		map.set(item.menuId, {
			value: item.menuId,
			title: item.remark,
			orderNum: item.orderNum ?? 0,
			children: [],
		});
	}

	const rootChildren: TreeNode[] = [];
	for (const item of list) {
		const node = map.get(item.menuId)!;
		if (item.parentId === 0) {
			rootChildren.push(node);
		}
		else {
			const parent = map.get(item.parentId);
			// 如果父节点不是 M（被过滤掉了）导致找不到父节点，这里把它挂到根目录下面
			if (parent)
				parent.children!.push(node);
			else rootChildren.push(node);
		}
	}

	const sortTree = (nodes: TreeNode[]) => {
		nodes.sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0));
		nodes.forEach(n => n.children?.length && sortTree(n.children));
	};
	sortTree(rootChildren);

	return [
		{
			value: 0,
			title: "根目录",
			children: rootChildren,
		},
	];
}

function BaseInfo({ style }: any) {
	return (
		<div style={style}>
			<Row>
				<Col span={12}>
					<Form.Item
						label="表名称"
						name="tableName"
						rules={[{ required: true, message: "Please input your tableName!" }]}
					>
						<Input />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						label="表描述"
						name="tableComment"
						rules={[{ required: true, message: "Please input your table comment!" }]}
					>
						<Input />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col span={12}>
					<Form.Item
						label="实体类名称"
						name="className"
						rules={[{ required: true, message: "Please input your tableName!" }]}
					>
						<Input />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						label="作者"
						name="functionAuthor"
						rules={[{ required: true, message: "Please input your table comment!" }]}
					>
						<Input />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col span={24}>
					<Form.Item
						labelCol={{ span: 4 }}
						wrapperCol={{ span: 24 }}
						label="备注"
						name="remark"
					>
						<Input.TextArea rows={5} />
					</Form.Item>
				</Col>
			</Row>
		</div>
	);
}

function FieldInfo({ dictList, dataSource }: any) {
	const { t } = useTranslation();
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 50,
		placement: ["bottomStart"],
		size: "small",
		showSizeChanger: true,
		pageSizeOptions: ["50", "100"],
		showTotal: (total) => {
			return t("common.pagination", { total });
		},
	});
	const idIndexMap = useMemo(() => {
		const m = new Map<any, number>();
		dataSource.forEach((r: any, i: number) => m.set(r.columnId, i));
		return m;
	}, [dataSource]);
	const checkboxItemProps = (namePath: (string | number)[]) => ({
		name: namePath,
		valuePropName: "checked" as const,
		getValueProps: (v: any) => ({ checked: v === true || v === 1 || v === "1" }),
		getValueFromEvent: (e: any) => (e.target.checked ? "1" : "0"),
	});

	return (
		<Table
			rowKey="columnId"
			styles={{
				body: {
					cell: { padding: 5, height: 50 },
				},
			}}
			scroll={{ y: "calc(100vh - 511px)", x: "max-content" }}
			dataSource={dataSource}
			pagination={pagination}
			onChange={p => setPagination({ ...pagination, current: p.current!, pageSize: p.pageSize! })}
			columns={[
				{
					title: "序号",
					render: (_: any, __: any, index: number) => (pagination.current! - 1) * pagination.pageSize! + index + 1,
					width: 70,
				},
				{
					title: "字段列名",
					dataIndex: "columnName",
					width: 180,
				},
				{
					title: "字段描述",
					dataIndex: "columnComment",
					minWidth: 230,
					render: (_: any, record: any) => {
						const i = idIndexMap.get(record.columnId);
						if (i === undefined)
							return null;
						return (
							<Form.Item name={["columns", i, "columnComment"]} style={{ margin: 0 }}>
								<Input />
							</Form.Item>
						);
					},
				},
				{
					title: "JAVA属性",
					dataIndex: "javaField",
					minWidth: 230,
					render: (_: any, record: any) => {
						const i = idIndexMap.get(record.columnId);
						if (i === undefined)
							return null;
						return (
							<Form.Item name={["columns", i, "javaField"]} style={{ margin: 0 }}>
								<Input />
							</Form.Item>
						);
					},
				},
				{
					title: "字段类型",
					dataIndex: "columnType",
					width: 90,
				},
				{
					title: "JAVA类型",
					dataIndex: "javaType",
					width: 120,
					render: (_: any, record: any) => {
						const i = idIndexMap.get(record.columnId);
						if (i === undefined)
							return null;
						return (
							<Form.Item name={["columns", i, "javaType"]} style={{ margin: 0 }}>
								<Select
									style={{ width: 120 }}
									options={javaTypeOptions}
									showSearch
								/>
							</Form.Item>
						);
					},
				},
				{
					title: "插入",
					dataIndex: "isInsert",
					width: 60,
					align: "center",
					render: (_: any, record: any) => {
						const i = idIndexMap.get(record.columnId);
						if (i === undefined)
							return null;
						return (
							<div style={{ display: "flex", justifyContent: "center" }}>
								<Form.Item {...checkboxItemProps(["columns", i, "isInsert"])} noStyle>
									<Checkbox />
								</Form.Item>
							</div>
						);
					},
				},
				{
					title: "编辑",
					dataIndex: "isEdit",
					width: 60,
					align: "center",
					render: (_: any, record: any) => {
						const i = idIndexMap.get(record.columnId);
						if (i === undefined)
							return null;
						return (
							<div style={{ display: "flex", justifyContent: "center" }}>
								<Form.Item {...checkboxItemProps(["columns", i, "isEdit"])} noStyle>
									<Checkbox />
								</Form.Item>
							</div>
						);
					},
				},
				{
					title: "列表",
					dataIndex: "isList",
					width: 60,
					render: (_: any, record: any) => {
						const i = idIndexMap.get(record.columnId);
						if (i === undefined)
							return null;
						return (
							<div style={{ display: "flex", justifyContent: "center" }}>
								<Form.Item {...checkboxItemProps(["columns", i, "isList"])} noStyle>
									<Checkbox />
								</Form.Item>
							</div>
						);
					},
				},
				{
					title: "查询",
					dataIndex: "isQuery",
					width: 60,
					render: (_: any, record: any) => {
						const i = idIndexMap.get(record.columnId);
						if (i === undefined)
							return null;
						return (
							<div style={{ display: "flex", justifyContent: "center" }}>
								<Form.Item {...checkboxItemProps(["columns", i, "isQuery"])} noStyle>
									<Checkbox />
								</Form.Item>
							</div>
						);
					},
				},
				{
					title: "查询方式",
					dataIndex: "queryType",
					width: 100,
					render: (_: any, record: any) => {
						const i = idIndexMap.get(record.columnId);
						if (i === undefined)
							return null;
						return (
							<Form.Item name={["columns", i, "queryType"]} style={{ margin: 0 }}>
								<Select
									style={{ width: 100 }}
									options={queryTypeOptions}
									showSearch
								/>
							</Form.Item>
						);
					},
				},
				{
					title: "必填",
					dataIndex: "isRequired",
					width: 60,
					render: (_: any, record: any) => {
						const i = idIndexMap.get(record.columnId);
						if (i === undefined)
							return null;
						return (
							<div style={{ display: "flex", justifyContent: "center" }}>
								<Form.Item {...checkboxItemProps(["columns", i, "required"])} noStyle>
									<Checkbox />
								</Form.Item>
							</div>
						);
					},
				},
				{
					title: "显示类型",
					dataIndex: "htmlType",
					width: 120,
					render: (_: any, record: any) => {
						const i = idIndexMap.get(record.columnId);
						if (i === undefined)
							return null;
						return (
							<Form.Item name={["columns", i, "htmlType"]} style={{ margin: 0 }}>
								<Select
									style={{ width: 120 }}
									options={htmlTypeOptions}
									showSearch
								/>
							</Form.Item>
						);
					},
				},
				{
					title: "字典类型",
					dataIndex: "dictType",
					width: 160,
					render: (_: any, record: any) => {
						const i = idIndexMap.get(record.columnId);
						if (i === undefined)
							return null;
						return (
							<Form.Item name={["columns", i, "dictType"]} style={{ margin: 0 }}>
								<Select
									style={{ width: 160 }}
									showSearch
									allowClear
									options={dictList.map((x: any) => ({ label: x.dictName, value: x.dictType, desc: x.dictType }))}
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
							</Form.Item>
						);
					},
				},
			]}
		/>
	);
}

function GenerateInfo({ menuList, columns, style }: any) {
	const form = Form.useFormInstance();
	const tplCategory = Form.useWatch<string>("tplCategory", form);
	const treeData = buildMenuTreeData(menuList ?? []);
	return (
		<div style={style}>
			<Row>
				<Col span={12}>
					<Form.Item
						label="生成模板"
						name="tplCategory"
						rules={[{ required: true, message: "请选择【生成模板】" }]}
					>
						<Select
							style={{ width: 120 }}
							options={[
								{ value: "crud", label: "单表" },
								{ value: "tree", label: "树表" },
							]}
						/>
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						label="生成包路径"
						name="packageName"
						rules={[{ required: true, message: "请输入【生成包路径】" }]}
					>
						<Input />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col span={12}>
					<Form.Item
						label="生成模块名"
						name="moduleName"
						rules={[{ required: true, message: "请输入【生成模块名】" }]}
					>
						<Input />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						label="生成业务名"
						name="businessName"
						rules={[{ required: true, message: "请输入【生成业务名】" }]}
					>
						<Input />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col span={12}>
					<Form.Item
						label="生成功能名"
						name="functionName"
						rules={[{ required: true, message: "请输入【生成功能名】" }]}
					>
						<Input />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						label="上级菜单"
						name={["options", "parentMenuId"]}
						rules={[{ required: true, message: "请选择【上级菜单】" }]}
					>
						<TreeSelect
							showSearch
							allowClear
							treeDefaultExpandAll
							treeData={treeData}
						/>
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col span={12}>
					<Form.Item
						label="生成代码方式"
						name="genType"
					>
						<Radio.Group
							block
							options={[
								{ value: "0", label: "ZIP压缩包" },
								{ value: "1", label: "项目路径" },
							]}
						/>
					</Form.Item>
				</Col>
			</Row>
			{
				tplCategory === "tree" && (
					<>
						<Divider titlePlacement="start" styles={{ root: { marginTop: 50 }, content: { margin: 0, fontSize: 14, color: "grey" } }}>
							&gt; 其他信息 &lt;
						</Divider>
						<Row>
							<Col span={12}>
								<Form.Item
									label="树编码字段"
									name={["options", "treeCode"]}
									rules={[{ required: true, message: "请选择【树编码字段】" }]}
								>
									<Select
										showSearch={{ optionFilterProp: "label" }}
										options={
											columns.map((x: any) => ({ value: x.javaField, label: x.columnComment, desc: x.columnName }))
										}
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
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									label="树父编码字段"
									name={["options", "treeParentCode"]}
									rules={[{ required: true, message: "请选择【树父编码字段】" }]}
								>
									<Select
										showSearch={{ optionFilterProp: "label" }}
										options={
											columns.map((x: any) => ({ value: x.javaField, label: x.columnComment, desc: x.columnName }))
										}
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
								</Form.Item>
							</Col>
						</Row>
						<Row>
							<Col span={12}>
								<Form.Item
									label="树名称字段"
									name={["options", "treeName"]}
									rules={[{ required: true, message: "请选择【树名称字段】" }]}
								>
									<Select
										showSearch={{ optionFilterProp: "label" }}
										options={
											columns.map((x: any) => ({ value: x.javaField, label: x.columnComment, desc: x.columnName }))
										}
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
								</Form.Item>
							</Col>
						</Row>
					</>
				)
			}
		</div>
	);
}

export default function Edit() {
	const { tableId } = useParams();
	const { token } = theme.useToken();
	const { removeTab, setActiveKey } = useTabsStore();
	const results = useQueries({
		queries: [
			{
				queryKey: ["tableInfo", tableId],
				queryFn: async () => {
					return (await fetchTableInfo(tableId as string))?.data;
				},
				enabled: !!tableId,
			},
			{
				queryKey: ["menuList"],
				queryFn: async () => {
					return (await getMenuList())?.data;
				},
			},
			{
				queryKey: ["optionSelect"],
				queryFn: async () => {
					return (await fetchDictList())?.data;
				},
			},
		],
	});

	const isLoading = results.some(x => x.isFetching);
	const [tableInfo, menuList, dictList] = results;
	const [form] = Form.useForm();

	const saveGenerateMutation = useMutation({
		mutationKey: ["saveGenerate"],
		mutationFn: async (data: any) => {
			const response = await saveGenerate(data);
			assert(response);
			window.$message?.success("保存成功");
			removeTab();
			setActiveKey("/develop/gen", false);
		},
	});

	return (
		isLoading
			? <Spin />
			: (
				<BasicContent className="h-full">
					<Card>
						<Layout>
							<Layout.Content style={{ backgroundColor: token.colorBgContainer }}>
								<Form
									name="basic"
									form={form}
									labelCol={{ span: 8 }}
									wrapperCol={{ span: 16 }}
									autoComplete="off"
									initialValues={tableInfo.data?.info}
								>
									<Tabs
										styles={{
											content: { height: "calc(100vh - 400px)", overflow: "auto" },
										}}
										defaultActiveKey="1"
										items={[
											{
												key: "1",
												label: "基础信息",
												forceRender: true,
												children: <BaseInfo style={{ maxWidth: 900, margin: "0 auto" }} />,
											},
											{
												key: "2",
												label: "字段信息",
												forceRender: true,
												children: <FieldInfo dictList={dictList.data} dataSource={tableInfo.data?.info.columns ?? []} />,
											},
											{
												key: "3",
												label: "生成信息",
												forceRender: true,
												children: (
													<GenerateInfo
														style={{ maxWidth: 900, margin: "0 auto" }}
														columns={tableInfo.data?.info.columns}
														menuList={menuList.data}
													/>
												),
											},
										]}
									/>
								</Form>
							</Layout.Content>
							<Layout.Footer style={{ textAlign: "center", backgroundColor: token.colorBgContainer }}>
								<Divider />
								<Space>
									<Button
										type="primary"
										loading={saveGenerateMutation.isPending}
										onClick={async () => {
											try {
												await form.validateFields();
												const values = form.getFieldsValue(true);
												if (values.options) {
													const options = values.options;
													if (values.tplCategory !== "tree") {
														delete options.treeCode;
														delete options.treeName;
														delete options.treeParentCode;
													}
												}
												saveGenerateMutation.mutateAsync(values);
											}
											catch (err: any) {
												window.$message?.error(`校验不通过: ${err.message}`);
											}
										}}
									>
										保存
									</Button>
									<Button onClick={() => {
										removeTab();
										setActiveKey("/develop/gen", false);
									}}
									>
										返回
									</Button>
								</Space>
							</Layout.Footer>
						</Layout>
					</Card>
				</BasicContent>
			)
	);
}
