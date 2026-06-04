import type {
	ProTableProps,
} from "@ant-design/pro-components";
import { SearchOutlined } from "@ant-design/icons";

import {
	ProTable,
} from "@ant-design/pro-components";
import { Input, Modal } from "antd";
import { useEffect, useState } from "react";

export interface ModalSearchProp<T> extends Record<string, any> {
	title?: string
	width?: string
	style?: React.CSSProperties
	placeholder?: string
	defaultValue?: number | string

	request?: ProTableProps<T, any>["request"]
	onChange: (value?: any) => void
};

export default function Search<T extends Record<string, any>>({ title, width, style, defaultValue, onChange, request, ...rest }: ModalSearchProp<T>) {
	const [modalVisible, setModalVisible] = useState(false);
	const [value, setValue] = useState<{ value?: string | number, text?: string }>({});
	const [row, setRow] = useState<T>();
	useEffect(() => {
		if (request && !!defaultValue) {
			request({ id: defaultValue }, {}, {}).then((res) => {
				if (res.data && res.data.length > 0) {
					setValue({ value: res.data[0].id, text: res.data[0].name });
				}
			});
		}
	}, [defaultValue]);
	return (
		<>
			<Input
				allowClear={true}
				{...rest}
				suffix={(
					<SearchOutlined
						style={{ cursor: "pointer" }}
						onClick={() => {
							setModalVisible(true);
						}}
					/>
				)}
				value={value?.text}
				onClear={() => {
					setValue({});
					onChange?.();
				}}
				onKeyDown={e => e.preventDefault()}
				onPaste={e => e.preventDefault()}
				onDrop={e => e.preventDefault()}
			/>

			<Modal
				title={title ?? "请选择"}
				open={modalVisible}
				width={width}
				style={style}
				onCancel={() => setModalVisible(false)}
				onOk={() => {
					if (row) {
						setValue({ value: row.id, text: row.name });
						onChange?.(row.id);
					}
					setModalVisible(false);
				}}
			>
				<ProTable<T>
					{...rest}
					rowKey="id"
					size="small"
					columns={[
						{
							title: "编码",
							dataIndex: "code",
							proFieldProps: {
								placeholder: "请输入编码",
							},
							width: 180,
						},
						{
							title: "名称",
							dataIndex: "name",
							proFieldProps: {
								placeholder: "请输入名称",
							},
							width: 210,
						},
						{
							title: "描述",
							dataIndex: "desc",
							search: false,
						},
					]}
					request={async (params, sort, filter) => {
						if (!request) {
							return { data: [] };
						}
						const resposne = await request(params, sort, filter);
						return resposne;
					}}
					rowSelection={{
						type: "radio",
						onSelect(record: T, selected: boolean) {
							if (selected) {
								setRow(record);
							}
						},
					}}
				/>
			</Modal>
		</>
	);
}
