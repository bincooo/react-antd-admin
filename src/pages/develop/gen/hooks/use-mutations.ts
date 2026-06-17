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

/**
 * 代码生成器列表-增删改查 Hook
 * 封装表格数据的增、删、同步、生成操作
 */

/**
 * 代码生成器列表操作 Hook
 * @param refreshTable - 刷新表格数据
 * @param setSelectedRowKeys - 更新选中行状态
 * @returns mutations 实例和操作处理函数
 */
export function useGenMutations(refreshTable: () => void, setSelectedRowKeys: (keys: React.Key[]) => void) {
	// 删除表
	const deleteDbTableMutation = useMutation({
		mutationFn: fetchDeleteDbTables,
	});

	// 同步表
	const syncDbTableMutation = useMutation({
		mutationFn: fetchSyncDbTable,
	});

	// 生成 ZIP 包并下载
	const syncGenarateZipMutation = useMutation({
		mutationFn: async (params: { tableName: string, id: string }) => {
			const data = await fetchGenarateZip([params.id]);
			const filename = `代码生成_${params.tableName}_${dayjs().valueOf()}.zip`;
			downloadByData(data, filename);
		},
	});

	// 生成代码到项目目录
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

	/**
	 * 删除选中行
	 * @param ids - 要删除的表 ID 列表
	 * @param action - ProTable 操作实例（可选，用于刷新）
	 */
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

	/**
	 * 同步表结构
	 * @param id - 表 ID
	 * @param action - ProTable 操作实例（可选，用于刷新）
	 */
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

	/**
	 * 生成代码（项目目录 / ZIP 下载）
	 * @param type - 生成方式："0"=ZIP 下载，"1"=项目目录
	 * @param tableName - 表名称
	 * @param id - 表 ID
	 */
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
