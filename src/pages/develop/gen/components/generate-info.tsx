import type { DefaultOptionType } from "antd/es/select";
import { Col, Divider, Form, Input, Radio, Row, Select, TreeSelect } from "antd";
import { buildMenuTreeData } from "../utils/menu-tree";

interface GenerateInfoProps {
	menuList?: Develop.Menu[]
	columns?: Develop.TableColumn[]
	style?: React.CSSProperties
}

export default function GenerateInfo({ menuList, columns, style }: GenerateInfoProps) {
	const form = Form.useFormInstance();
	const tplCategory = Form.useWatch<string>("tplCategory", form);
	const treeData = buildMenuTreeData(menuList ?? []);

	const columnFieldOptions = (columns ?? []).map(x => ({
		value: x.javaField,
		label: x.columnComment ?? "",
		desc: x.columnName,
	}));

	const columnFieldSelect = () => (
		<Select
			showSearch={{ optionFilterProp: "label" }}
			options={columnFieldOptions}
			optionRender={(option: DefaultOptionType & { desc?: string }) => (
				<div>
					<div style={{ height: 20 }}>{option.label}</div>
					<div style={{ fontSize: 12, color: "grey" }}>{option.desc}</div>
				</div>
			)}
		/>
	);

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
							其他信息
						</Divider>
						<Row>
							<Col span={12}>
								<Form.Item
									label="树编码字段"
									name={["options", "treeCode"]}
									rules={[{ required: true, message: "请选择【树编码字段】" }]}
								>
									{columnFieldSelect()}
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									label="树父编码字段"
									name={["options", "treeParentCode"]}
									rules={[{ required: true, message: "请选择【树父编码字段】" }]}
								>
									{columnFieldSelect()}
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
									{columnFieldSelect()}
								</Form.Item>
							</Col>
						</Row>
					</>
				)
			}
		</div>
	);
}
