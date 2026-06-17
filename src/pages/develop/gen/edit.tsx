/**
 * 代码生成器 - 编辑页
 * 包含三个方面标签：基础信息、字段信息、生成信息
 */

import { useMutation } from "@tanstack/react-query";
import {
	Button,
	Card,
	Divider,
	Form,
	Layout,
	Space,
	Spin,
	Tabs,
	theme,
} from "antd";
import { useParams } from "react-router";
import { saveGenerate } from "#src/api/develop/gen";
import { BasicContent } from "#src/components/basic-content";
import { useTabsStore } from "#src/store/tabs";
import BaseInfo from "./components/base-info";
import FieldInfo from "./components/field-info";
import GenerateInfo from "./components/generate-info";
import { useTableQueries } from "./hooks/use-table-queries";

/**
 * 代码生成器编辑页
 */
export default function Edit() {
	const { tableId } = useParams();
	const { token } = theme.useToken();
	const { removeTab, setActiveKey } = useTabsStore();
	const { isLoading, tableInfo, menuList, dictList } = useTableQueries(tableId);
	const [form] = Form.useForm();

	/**
	 * 保存生成配置
	 */
	const saveGenerateMutation = useMutation({
		mutationKey: ["saveGenerate"],
		mutationFn: async (data: Develop.TableMeta["info"]) => {
			const { code, message } = await saveGenerate(data);
			if (code !== 200)
				throw new Error(message);
			window.$message?.success("保存成功");
			removeTab();
			setActiveKey("/develop/gen", false);
		},
	});

	/**
	 * 校验并保存表单
	 */
	const handleSave = async () => {
		try {
			await form.validateFields();
			const values = form.getFieldsValue(true);
			// 非树表模板时，清除树相关字段
			if (values.options) {
				const options = values.options as Record<string, unknown>;
				if (values.tplCategory !== "tree") {
					delete options.treeCode;
					delete options.treeName;
					delete options.treeParentCode;
				}
			}
			saveGenerateMutation.mutateAsync(values);
		}
		catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err);
			window.$message?.error(`校验不通过: ${message}`);
		}
	};

	/**
	 * 返回列表页
	 */
	const handleBack = () => {
		removeTab();
		setActiveKey("/develop/gen", false);
	};

	// 加载中
	if (isLoading)
		return <Spin />;
	return (
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
										children: (
											<FieldInfo
												dictList={dictList.data ?? []}
												dataSource={tableInfo.data?.info.columns ?? []}
											/>
										),
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

					{/* 底部操作栏 */}
					<Layout.Footer style={{ textAlign: "center", backgroundColor: token.colorBgContainer }}>
						<Divider />
						<Space>
							<Button
								type="primary"
								loading={saveGenerateMutation.isPending}
								onClick={handleSave}
							>
								保存
							</Button>
							<Button onClick={handleBack}>
								返回
							</Button>
						</Space>
					</Layout.Footer>
				</Layout>
			</Card>
		</BasicContent>
	);
}
