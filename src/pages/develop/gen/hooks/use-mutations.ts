import type { ProCoreActionType } from "@ant-design/pro-components";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";

import {
	fetchDeleteDbTables,
	fetchGenarateProj,
	fetchGenarateZip,
	fetchSyncDbTable,
} from "#src/api/develop/gen";
import { downloadByData } from "../utils/download";

export function useGenMutations(refreshTable: () => void, setSelectedRowKeys: (keys: React.Key[]) => void) {
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

	return {
		deleteDbTableMutation,
		syncDbTableMutation,
		syncGenarateZipMutation,
		syncGenarateProjMutation,
		handleDeleteRow,
		handleSyncRow,
		handleGenarateRow,
	};
}
