import type {
	ActionType,
	ProColumns,
	ProCoreActionType,
} from "@ant-design/pro-components";

import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Switch, Tag } from "antd";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as api from "#src/api/system/ossConfig";
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

	const udpateStatusMutation = useMutation({
		mutationFn: async (data: System.OssConfig.UpdateStatus) => {
			const { code, message } = await api.changeStatus(data);
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
			title: "确认删除对象存储配置？",
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

	const handleStatusRow = async (data: System.OssConfig.UpdateStatus) => {
		window.$modal?.confirm({
			title: `确认${data.status === "1" ? "停用" : "启用"}对象存储配置？`,
			content: "此操作不可恢复",
			onOk: async () => {
				const ok = await udpateStatusMutation.mutateAsync(data);
				if (!ok)
					return;
				refreshTable();
			},
		});
	};

	const columns: ProColumns<System.OssConfig>[] = [
		...getColumnList(t, {
			status: (column) => {
				return {
					...column,
					render(node, record) {
						return (
							<Switch
								loading={udpateStatusMutation.isPending}
								checkedChildren="是"
								unCheckedChildren="否"
								checked={record.status === "0"}
								onChange={(checked) => {
									handleStatusRow({
										ossConfigId: record.ossConfigId,
										status: checked ? "0" : "1",
									});
								}}
							/>
						);
					},
				};
			},
			isHttps: (column) => {
				return {
					...column,
					render(node, record) {
						return (
							<Tag
								color={record.isHttps === "0" ? "success" : "default"}
								children={node}
							/>
						);
					},
				};
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
						perm="system:ossConfig:update"
						onClick={() => {
							setEditId(record.ossConfigId);
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
						perm="system:ossConfig:delete"
						onClick={() => {
							handleDeleteRow([record.ossConfigId!]);
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
			<BasicTable<System.OssConfig>
				adaptive
				rowKey="ossConfigId"
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
						perm="system:ossConfig:delete"
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
						perm="system:ossConfig:create"
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
