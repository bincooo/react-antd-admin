import { Col, Form, Input, Row } from "antd";

interface BaseInfoProps {
	style?: React.CSSProperties
}

export default function BaseInfo({ style }: BaseInfoProps) {
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
