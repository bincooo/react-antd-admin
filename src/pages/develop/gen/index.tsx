import type { ActionType, ProColumns, ProCoreActionType } from "@ant-design/pro-components";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "antd";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import {
	fetchDataNames,
	fetchDeleteDbTables,
	fetchGenarateProj,
	fetchGenarateZip,
	fetchList,
	fetchSyncDbTable,
} from "#src/api/develop/gen";
import { BasicContent } from "#src/components/basic-content";
import { BasicTable } from "#src/components/basic-table";
import { useAccess } from "#src/hooks/use-access";
import { useAuthStore } from "#src/store/auth";
import { getColumns } from "./columns";
import DbTableModal from "./components/db-table-modal";
import CodePreview from "./components/preview";

/**
 * Download according to the background interface file stream
 * @param {*} data
 * @param {*} filename
 * @param {*} mime
 * @param {*} bom
 */
function downloadByData(
	data: BlobPart,
	filename: string,
	mime?: string,
	bom?: BlobPart,
) {
	const blobData = bom === undefined ? [data] : [bom, data];
	const blob = new Blob(blobData, { type: mime || "application/octet-stream" });

	const blobURL = window.URL.createObjectURL(blob);
	const tempLink = document.createElement("a");
	tempLink.style.display = "none";
	tempLink.href = blobURL;
	tempLink.setAttribute("download", filename);
	if (tempLink.download === undefined) {
		tempLink.setAttribute("target", "_blank");
	}
	document.body.append(tempLink);
	tempLink.click();
	tempLink.remove();
	window.URL.revokeObjectURL(blobURL);
}

export default function GenTable() {
	const { t } = useTranslation();
	const { hasPerms } = useAccess();
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const navigate = useNavigate();
	const { data: dataNames } = useQuery({
		queryKey: ["dataName"],
		queryFn: async () => {
			const { data } = await fetchDataNames();
			return data;
		},
		initialData: [],
	});

	const deleteDbTableMutation = useMutation({
		mutationFn: fetchDeleteDbTables,
	});
	const syncDbTableMutation = useMutation({
		mutationFn: fetchSyncDbTable,
	});
	const syncGenarateZipMutation = useMutation({
		mutationFn: async (params: { tableName: string, id: string }) => {
			const data = await fetchGenarateZip([params.id]);
			const filename = `代码生成_${params.tableName}_${dayjs().valueOf()}.zip`;
			downloadByData(data, filename);
		},
	});
	const syncGenarateProjMutation = useMutation({
		mutationFn: async (tableId: string) => {
			const { code, message } = await fetchGenarateProj(tableId);
			if (code !== 200) {
				window.$message?.error(message);
				return;
			}
			window.$message?.success("执行成功");
		},
	});

	const [isOpen, setOpen] = useState(false);
	const [isPreview, showPreview] = useState(false);
	const [previewId, setPreviewId] = useState<string>();
	const actionRef = useRef<ActionType>(null);

	const onCloseChange = () => {
		setOpen(false);
	};

	const refreshTable = () => {
		actionRef.current?.reload();
	};

	const handleDeleteRow = async (ids: string[], action?: ProCoreActionType<object>) => {
		if (!ids || ids.length === 0) {
			window.$message?.error("请选择要删除的行");
			return;
		}

		window.$modal?.confirm({
			title: "确认删除？",
			content: "此操作不可恢复",
			onOk: async () => {
				const ok = await deleteDbTableMutation.mutateAsync(ids);
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

	const handleSyncRow = async (id: string, action?: ProCoreActionType<object>) => {
		window.$modal?.confirm({
			title: "确认要强制同步表结构吗？",
			content: "此操作不可恢复",
			onOk: async () => {
				const ok = await syncDbTableMutation.mutateAsync(id);
				if (!ok)
					return;
				await action?.reload();
			},
		});
	};

	const handleGenarateRow = async (type: string, tableName: string, id: string) => {
		if (type === "1") {
			await syncGenarateProjMutation.mutateAsync(id);
		}
		else {
			await syncGenarateZipMutation.mutateAsync({ id, tableName });
		}
	};

	const columns: ProColumns<Develop.Table>[] = [
		...getColumns(t, [
			(dataIndex) => {
				if (dataIndex === "dataName") {
					return () => dataNames.map(x => ({ label: x, value: x }));
				}
			},
		]),
		{
			title: t("common.action"),
			valueType: "option",
			key: "option",
			width: 120,
			fixed: "right",
			render: (text, record, _, action) => {
				return [
					<Button
						key="edit"
						type="link"
						size="small"
						disabled={!hasPerms("develop:gen:update")}
						onClick={() => navigate(`/develop/gen/${record.tableId}`)}
					>
						编辑
					</Button>,
					<Button
						key="preview"
						type="link"
						size="small"
						onClick={() => {
							setPreviewId(record.tableId);
							showPreview(true);
						}}
					>
						预览
					</Button>,
					<Button
						key="delete"
						type="link"
						size="small"
						disabled={!hasPerms("develop:gen:delete")}
						onClick={() => {
							handleDeleteRow([record.tableId], action);
						}}
					>
						{t("common.delete")}
					</Button>,
					<Button
						key="sync"
						type="link"
						size="small"
						disabled={!hasPerms("develop:gen:sync")}
						onClick={() => {
							handleSyncRow(record.tableId, action);
						}}
					>
						同步
					</Button>,
					<Button
						key="generate"
						type="link"
						size="small"
						disabled={!hasPerms("develop:gen:generate")}
						onClick={() => {
							handleGenarateRow(record.genType, record.tableName, record.tableId);
						}}
					>
						生成
					</Button>,
					<Button
						key="design"
						type="link"
						size="small"
						disabled={record.genType !== "1" || !hasPerms("develop:gen:design")}
						onClick={() => {
							if (!record.options?.pages) {
								window.$message?.error("请生成代码后执行");
								return;
							}
							const { token } = useAuthStore.getState();
							window.open(`https://tango.1micro.top/designer/?tableId=${record.tableId}&accessToken=${token}`);
						}}
					>
						设计器
					</Button>,
				];
			},
		},
	];

	return (
		<BasicContent className="h-full">
			<BasicTable<Develop.Table>
				rowKey="tableId"
				adaptive
				columns={columns}
				actionRef={actionRef}
				rowSelection={{
					selectedRowKeys,
					onChange: (keys) => {
						setSelectedRowKeys(keys);
					},
				}}
				request={async (params) => {
					const responseData = await fetchList(params);
					return {
						...responseData,
						data: responseData.data.list,
						total: responseData.data.total,
					};
				}}
				toolBarRender={() => [
					<Button
						loading={deleteDbTableMutation.isPending}
						key="delete"
						danger
						icon={<DeleteOutlined />}
						disabled={!hasPerms("develop:gen:delete")}
						onClick={() => {
							handleDeleteRow([...selectedRowKeys.map(String)]);
						}}
					>
						{t("common.delete")}
					</Button>,
					<Button
						key="add"
						icon={<PlusCircleOutlined />}
						type="primary"
						disabled={!hasPerms("develop:gen:create")}
						onClick={() => {
							setOpen(true);
						}}
					>
						{t("common.add")}
					</Button>,
				]}
			/>
			<DbTableModal
				open={isOpen}
				dataNames={dataNames}
				onCloseChange={onCloseChange}
				refreshTable={refreshTable}
			/>

			{previewId && <CodePreview key={previewId} id={previewId} open={isPreview} onCloseChange={() => { showPreview(false); }} />}
		</BasicContent>
	);
};
