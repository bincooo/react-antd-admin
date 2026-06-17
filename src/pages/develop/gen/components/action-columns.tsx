import type { ProColumns, ProCoreActionType } from "@ant-design/pro-components";
import PermissionButton from "#src/components/permission-button";

import { useAuthStore } from "#src/store/auth";
import { useAccess } from "#src/hooks/use-access";

/**
 * 代码生成器列表 - 操作列配置
 * 定义表格操作列的按钮及其交互逻辑
 */

/**
 * 操作列回调函数接口
 */
interface ActionColumnsProps {
	/** 预览代码 */
	onPreview: (tableId: string) => void
	/** 删除表格 */
	onDelete: (ids: string[], action?: ProCoreActionType<object>) => void
	/** 同步数据库表结构 */
	onSync: (id: string, action?: ProCoreActionType<object>) => void
	/** 生成代码（下载或写入项目） */
	onGenerate: (type: string, tableName: string, id: string) => void
	/** 编辑表格配置 */
	onEdit: (tableId: string) => void
}

export function getActionColumns({
	onPreview,
	onDelete,
	onSync,
	onGenerate,
	onEdit,
}: ActionColumnsProps): ProColumns<Develop.Table>[] {
	return [
		{
			title: "操作",
			valueType: "option",
			key: "option",
			width: 120,
			fixed: "right",
			render: (text, record, _, action) => {
				return [
					// 编辑
					<PermissionButton
						key="edit"
						type="link"
						size="small"
						perm="develop:gen:update"
						onClick={() => onEdit(record.tableId)}
					>
						编辑
					</PermissionButton>,
					// 预览
					<PermissionButton
						key="preview"
						type="link"
						size="small"
						onClick={() => onPreview(record.tableId)}
					>
						预览
					</PermissionButton>,
					// 删除
					<PermissionButton
						key="delete"
						type="link"
						size="small"
						perm="develop:gen:delete"
						onClick={() => onDelete([record.tableId], action)}
					>
						删除
					</PermissionButton>,
					// 同步表结构
					<PermissionButton
						key="sync"
						type="link"
						size="small"
						perm="develop:gen:sync"
						onClick={() => onSync(record.tableId, action)}
					>
						同步
					</PermissionButton>,
					// 生成代码
					<PermissionButton
						key="generate"
						type="link"
						size="small"
						perm="develop:gen:generate"
						onClick={() => onGenerate(record.genType, record.tableName, record.tableId)}
					>
						生成
					</PermissionButton>,
					// 设计器入口（仅项目目录模式可用）
					record.genType === "1" && (
						<PermissionButton
							key="design"
							type="link"
							size="small"
							disabled={!record.options?.pages}
							perm="develop:gen:design"
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
						</PermissionButton>
					),
				].filter(Boolean);
			},
		},
	];
}
