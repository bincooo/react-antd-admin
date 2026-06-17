/**
 * 代码生成器 - 列表页
 * 展示生成表列表，支持表格操作（新增、编辑、删除、同步、生成）
 */

import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import {
	fetchDataNames,
	fetchList,
} from "#src/api/develop/gen";
import { BasicContent } from "#src/components/basic-content";
import { BasicTable } from "#src/components/basic-table";
import { getColumns } from "./columns";
import { getActionColumns } from "./components/action-columns";
import DbTableModal from "./components/db-table-modal";
import CodePreview from "./components/preview";
import ToolBarRender from "./components/tool-bar-render";
import { useGenMutations } from "./hooks/use-mutations";

/**
 * 代码生成器列表页
 */
export default function GenTable() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const actionRef = useRef<ActionType>(null);

	// 状态管理
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [isPreview, setIsPreview] = useState(false);
	const [previewId, setPreviewId] = useState<string>();

	// 数据源名称列表
	const { data: dataNames } = useQuery({
		queryKey: ["dataName"],
		queryFn: async () => {
			const { data } = await fetchDataNames();
			return data;
		},
		initialData: [],
	});

	/**
	 * 刷新表格数据
	 */
	const refreshTable = () => {
		actionRef.current?.reload();
	};

	// 增删改查操作
	const {
		deleteDbTableMutation,
		handleDeleteRow,
		handleSyncRow,
		handleGenarateRow,
	} = useGenMutations(refreshTable, setSelectedRowKeys);

	// 表格列定义
	const columns: ProColumns<Develop.Table>[] = [
		...getColumns(t, [
			(dataIndex) => {
				if (dataIndex === "dataName") {
					return () => dataNames.map(x => ({ label: x, value: x }));
				}
			},
		]),
		...getActionColumns({
			onPreview: (tableId) => {
				setPreviewId(tableId);
				setIsPreview(true);
			},
			onDelete: handleDeleteRow,
			onSync: handleSyncRow,
			onGenerate: handleGenarateRow,
			onEdit: tableId => navigate(`/develop/gen/${tableId}`),
		}),
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
					preserveSelectedRowKeys: true,
					onChange: keys => setSelectedRowKeys(keys),
				}}
				request={async (params) => {
					const res = await fetchList({ ...params, pageNum: params.current });
					return {
						...res,
						data: res.data.list,
						total: res.data.total,
					};
				}}
				toolBarRender={() => ToolBarRender({
					deleteLoading: deleteDbTableMutation.isPending,
					onDelete: () => handleDeleteRow([...selectedRowKeys.map(String)]),
					onAdd: () => setIsOpen(true),
				})}
			/>

			{/* 导入表弹窗 */}
			<DbTableModal
				open={isOpen}
				dataNames={dataNames}
				onCloseChange={() => setIsOpen(false)}
				refreshTable={refreshTable}
			/>

			{/* 代码预览弹窗 */}
			{previewId && (
				<CodePreview
					key={previewId}
					id={previewId}
					open={isPreview}
					onCloseChange={() => setIsPreview(false)}
				/>
			)}
		</BasicContent>
	);
};
