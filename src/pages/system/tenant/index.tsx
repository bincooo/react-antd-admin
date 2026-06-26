import type {
	ActionType,
	ProColumns,
	ProCoreActionType,
} from "@ant-design/pro-components";

import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as api from "#src/api/system/tenant";
import { BasicContent } from "#src/components/basic-content";
import { BasicTable } from "#src/components/basic-table";

import PermissionButton from "#src/components/permission-button";
import { getColumnList } from "./columns";
import Edit from "./components/edit";

export default function Page() {
	const { t } = useTranslation();
	const [editVisible, setEditVisible] = useState(false);
	const [editId, setEditId] = useState<string | number>();
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	const actionRef = useRef<ActionType>(null);
	const refreshTable = () => {
		actionRef.current?.reload();
	};

	const onCloseChange = (refresh?: boolean) => {
		setEditVisible(false);
		setEditId(undefined);
		if (refresh) {
			refreshTable();
		}
	};

	/** 删除接口 */
	const deleteMutation = useMutation({
		mutationFn: async (ids: (string | number)[]) => {
			const { code, message } = await api.deleteByIds(ids);
			if (code !== 200) {
				window.$message?.error(message);
				throw new Error(message);
			}
			return true;
		},
	});

	const handleDeleteRow = async (
		ids: Array<string | number>,
		action?: ProCoreActionType<object>,
	) => {
		if (!ids || ids.length === 0) {
			window.$message?.error("请选择要删除的行");
			return;
		}

		window.$modal?.confirm({
			title: "确认删除租户？",
			content: "此操作不可恢复",
			onOk: async () => {
				const ok = await deleteMutation.mutateAsync(ids);
				if (!ok)
					return;

				if (action?.reload) {
					await action.reload();
				}
				else {
					refreshTable();
					setSelectedRowKeys([]);
				}
			},
		});
	};

	const columns: ProColumns<System.Tenant>[] = [
		...getColumnList(t, {
			XXX: (column) => {
				// TODO - 自定列
				return column;
			},
		}),
		{
			title: "工具栏",
			valueType: "option",
			key: "option",
			minWidth: 120,
			fixed: "right",
			disable: true,
			render: (node, record) => {
				return [
					<PermissionButton
						key="update"
						type="link"
						size="small"
						perm="system:tenant:update"
						disabled={record.tenantId === "000000"}
						onClick={() => {
							setEditId(record.id);
							setEditVisible(true);
						}}
					>
						编辑
					</PermissionButton>,
					<PermissionButton
						key="delete"
						type="link"
						size="small"
						danger={true}
						perm="system:tenant:delete"
						disabled={record.tenantId === "000000"}
						onClick={() => {
							handleDeleteRow([record.id!]);
						}}
					>
						删除
					</PermissionButton>,
				];
			},
		},
	];

	return (
		<BasicContent className="h-full">
			<BasicTable<System.Tenant>
				adaptive
				rowKey="id"
				columns={columns}
				actionRef={actionRef}
				rowSelection={{
					selectedRowKeys,
					preserveSelectedRowKeys: true,
					onChange: (keys) => {
						setSelectedRowKeys(keys);
					},
				}}
				request={async (params) => {
					const response = await api.page({
						...params,
						pageNum: params.current,
					});
					return {
						...response,
						data: response.data?.list,
						total: response.data?.total,
					};
				}}
				toolBarRender={() => [
					<PermissionButton
						key="delete"
						icon={<DeleteOutlined />}
						danger
						perm="system:tenant:delete"
						onClick={() => {
							handleDeleteRow([...selectedRowKeys.map(String)]);
						}}
					>
						删除
					</PermissionButton>,
					<PermissionButton
						key="create"
						icon={<PlusCircleOutlined />}
						type="primary"
						perm="system:tenant:create"
						onClick={() => {
							setEditVisible(true);
						}}
					>
						新增
					</PermissionButton>,
				]}
			/>

			<Edit
				key={editId}
				pkId={editId}
				open={editVisible}
				onClose={onCloseChange}
			/>
		</BasicContent>
	);
}
