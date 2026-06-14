import type { ProColumns, ProCoreActionType } from "@ant-design/pro-components";
import { Button } from "antd";

import { useAuthStore } from "#src/store/auth";
import PermButton from "./perm-button";

interface ActionColumnsProps {
	onPreview: (tableId: string) => void
	onDelete: (ids: string[], action?: ProCoreActionType<object>) => void
	onSync: (id: string, action?: ProCoreActionType<object>) => void
	onGenerate: (type: string, tableName: string, id: string) => void
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
					<PermButton
						key="edit"
						perm="develop:gen:update"
						onClick={() => onEdit(record.tableId)}
					>
						编辑
					</PermButton>,
					<Button
						key="preview"
						type="link"
						size="small"
						onClick={() => onPreview(record.tableId)}
					>
						预览
					</Button>,
					<PermButton
						key="delete"
						perm="develop:gen:delete"
						onClick={() => onDelete([record.tableId], action)}
					>
						删除
					</PermButton>,
					<PermButton
						key="sync"
						perm="develop:gen:sync"
						onClick={() => onSync(record.tableId, action)}
					>
						同步
					</PermButton>,
					<PermButton
						key="generate"
						perm="develop:gen:generate"
						onClick={() => onGenerate(record.genType, record.tableName, record.tableId)}
					>
						生成
					</PermButton>,
					record.genType === "1" && (
						<PermButton
							key="design"
							perm="develop:gen:design"
							disabled={!record.options?.pages}
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
						</PermButton>
					),
				].filter(Boolean);
			},
		},
	];
}
