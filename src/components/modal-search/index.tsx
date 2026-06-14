import type { ProColumns } from "@ant-design/pro-components";
import { SearchOutlined } from "@ant-design/icons";
import {

	ProTable,
} from "@ant-design/pro-components";

import { Form, Input, Modal } from "antd";
import { useEffect, useState } from "react";
import { executeSql } from "#src/api/common";

export interface ModalSearchProp<T> extends Record<string, any> {
	title?: string
	width?: string | number
	style?: React.CSSProperties
	placeholder?: string
	defaultValue?: number | string
	searchId?: string
	value?: T
	columns?: ProColumns<any>[]

	// request?: ProTableProps<T, any>["request"]
	onChange?: (value?: any) => void
};

async function request(id: string, query?: any) {
	const response = await executeSql(id, query);
	return {
		...response,
		data: response.data.list,
		total: response.data.total,
	};
}

function ProModalSearchField<T,>({ width, readonly, placeholder, searchId, name, label, allowClear, required, disabled, fieldProps, ...rest }: {
	searchId?: string
	name?: string
	label?: string
	fieldProps?: ModalSearchProp<T>
	placeholder?: string
	disabled?: boolean
	readonly?: boolean
	required?: boolean
	width?: number | string | "xl" | "lg" | "md" | "sm" | "xs" | undefined
	allowClear?: boolean
}) {
	return (
		<Form.Item label={label} name={name} required={required} {...rest}>
			<ModalSearchField<T>
				searchId={searchId}
				allowClear={allowClear}
				width={width}
				placeholder={placeholder}
				readonly={readonly}
				disabled={disabled}
				{...fieldProps}
			/>
		</Form.Item>
	);
}

function ModalSearchField<T,>({ title, width = "95%", style = { maxWidth: "900px" }, value: _value, defaultValue, searchId, readonly = false, columns, onChange, ...rest }: ModalSearchProp<T>) {
	if (!style.maxWidth) {
		style.maxWidth = "900px";
	}
	const [modalVisible, setModalVisible] = useState(false);
	const [value, setValue] = useState<{ value?: string | number, name?: string }>({});
	const [row, setRow] = useState<Record<string, any>>();
	useEffect(() => {
		const id = _value || defaultValue;
		if (searchId && !!id) {
			request(searchId, { id }).then((res) => {
				if (res.data && res.data.length > 0) {
					setValue({ value: res.data[0].id, name: res.data[0].name });
				}
			});
		}
	}, [defaultValue, _value]);

	if (readonly) {
		return <span>{value.name || "-"}</span>;
	}

	if (!columns || columns.length === 0) {
		columns = [
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
				dataIndex: "remark",
				search: false,
			},
		];
	}

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
				value={value?.name}
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
						setValue({ value: row.id, name: row.name });
						onChange?.(row.id);
					}
					setModalVisible(false);
				}}
			>
				<ProTable
					{...rest}
					rowKey="id"
					size="small"
					columns={columns}
					request={async (params) => {
						if (!searchId) {
							return { data: [] };
						}
						return await request(searchId, { ...params, pageNum: params.current });
					}}
					rowSelection={{
						type: "radio",
						onSelect(record: Record<string, any>, selected: boolean) {
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

export default ModalSearchField;
export { ProModalSearchField };
