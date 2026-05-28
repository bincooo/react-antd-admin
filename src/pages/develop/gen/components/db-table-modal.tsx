import type {
	ProColumns,
	ProFormInstance,
} from "@ant-design/pro-components";
import { PlusSquareOutlined } from "@ant-design/icons";
import {
	ProTable,
} from "@ant-design/pro-components";
import { Button, Modal } from "antd";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchImportTable } from "#src/api/develop/gen";
import { fetchDbList } from "#src/api/develop/gen/index";

interface ElementProps {
	open: boolean
	onCloseChange: () => void
	refreshTable?: () => void

	dataNames: string[]
}

export default function DbTableModal({ open, dataNames, onCloseChange, refreshTable }: ElementProps) {
	const { t } = useTranslation();
	const formRef = useRef<ProFormInstance>(undefined);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const columns: ProColumns<Develop.DbTable>[] = [
		{
			title: "数据源",
			width: 100,
			dataIndex: "dataName",
			valueType: "select",
			initialValue: dataNames?.[0],
			fieldProps: {
				allowClear: false,
				options: dataNames.map(x => ({ label: x, value: x })),
			},
			formItemProps: {
				rules: [{ required: true, message: "请选择数据源" }],
			},
		},
		{
			title: "表名称",
			width: 120,
			dataIndex: "tableName",
		},
		{
			title: "表描述",
			dataIndex: "tableComment",
		},
		{
			title: "创建时间",
			dataIndex: "createTime",
			valueType: "date",
			search: false,
		},
		{
			title: "更新时间",
			dataIndex: "updateTime",
			valueType: "date",
			search: false,
		},
	];

	return (
		<Modal
			width="90%"
			style={{ maxWidth: 1200 }}
			title="导入数据表"
			open={open}
			footer={null}
			onOk={onCloseChange}
			onCancel={onCloseChange}
		>
			<ProTable<Develop.DbTable>
				rowKey="tableName"
				formRef={formRef}
				form={{
					ignoreRules: false,
				}}
				columns={columns}
				rowSelection={{
					selectedRowKeys,
					onChange: (keys) => {
						setSelectedRowKeys(keys);
					},
				}}
				toolBarRender={action => [
					<Button
						key="Add"
						type="primary"
						icon={<PlusSquareOutlined />}
						onClick={async () => {
							if (selectedRowKeys.length === 0) {
								window.$message?.error("请选择要导入的表");
								return;
							}
							const dataName = formRef.current?.getFieldValue("dataName");
							const response = await fetchImportTable(selectedRowKeys.map(String), dataName);
							if (response.code !== 200) {
								window.$message?.error(response.message);
								return;
							}

							window.$message?.success("导入成功");
							action?.reload();
							onCloseChange?.();
							refreshTable?.();
						}}
					>
						导入
					</Button>,
				]}
				request={async (params) => {
					const response = await fetchDbList(params);
					return {
						...response,
						data: response.data.list,
						total: response.data.total,
					};
				}}
				pagination={{
					placement: ["bottomStart"],
					defaultPageSize: 10,
					showQuickJumper: true,
					showTotal: total => t("common.pagination", { total }),
				}}
			/>
		</Modal>
	);
};
