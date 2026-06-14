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

export default function GenTable() {
	const { t } = useTranslation();
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

	const actionRef = useRef<ActionType>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [isPreview, setIsPreview] = useState(false);
	const [previewId, setPreviewId] = useState<string>();

	const refreshTable = () => {
		actionRef.current?.reload();
	};

	const {
		deleteDbTableMutation,
		handleDeleteRow,
		handleSyncRow,
		handleGenarateRow,
	} = useGenMutations(refreshTable, setSelectedRowKeys);

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
					onChange: (keys) => {
						setSelectedRowKeys(keys);
					},
				}}
				request={async (params) => {
					const responseData = await fetchList({ ...params, pageNum: params.current });
					return {
						...responseData,
						data: responseData.data.list,
						total: responseData.data.total,
					};
				}}
				toolBarRender={() => ToolBarRender({
					selectedRowKeys,
					deleteLoading: deleteDbTableMutation.isPending,
					onDelete: () => {
						handleDeleteRow([...selectedRowKeys.map(String)]);
					},
					onAdd: () => {
						setIsOpen(true);
					},
				})}
			/>
			<DbTableModal
				open={isOpen}
				dataNames={dataNames}
				onCloseChange={() => setIsOpen(false)}
				refreshTable={refreshTable}
			/>

			{previewId && <CodePreview key={previewId} id={previewId} open={isPreview} onCloseChange={() => { setIsPreview(false); }} />}
		</BasicContent>
	);
};
