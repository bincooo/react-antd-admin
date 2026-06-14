import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { useAccess } from "#src/hooks/use-access";

interface ToolBarRenderProps {
	selectedRowKeys: React.Key[]
	deleteLoading: boolean
	onDelete: () => void
	onAdd: () => void
}

export default function ToolBarRender({
	selectedRowKeys,
	deleteLoading,
	onDelete,
	onAdd,
}: ToolBarRenderProps) {
	const { hasPerms } = useAccess();
	return [
		<Button
			loading={deleteLoading}
			key="delete"
			danger
			icon={<DeleteOutlined />}
			disabled={!hasPerms("develop:gen:delete")}
			onClick={onDelete}
		>
			删除
		</Button>,
		<Button
			key="add"
			icon={<PlusCircleOutlined />}
			type="primary"
			disabled={!hasPerms("develop:gen:create")}
			onClick={onAdd}
		>
			新增
		</Button>,
	];
}
