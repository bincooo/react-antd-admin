/**
 * 工具栏组件
 * 展示批量删除和新增按钮
 */

import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import PermissionButton from "#src/components/permission-button";

/**
 * 工具栏属性
 */
interface ToolBarRenderProps {
	/** 删除按钮加载状态 */
	deleteLoading: boolean
	/** 删除回调 */
	onDelete: () => void
	/** 新增回调 */
	onAdd: () => void
}

/**
 * 表格工具栏
 * @description 渲染批量删除和新增按钮，根据权限控制启用状态
 */
export default function ToolBarRender({
	deleteLoading,
	onDelete,
	onAdd,
}: ToolBarRenderProps) {
	return [
		// 批量删除按钮
		<PermissionButton
			loading={deleteLoading}
			key="delete"
			danger
			icon={<DeleteOutlined />}
			perm="develop:gen:delete"
			onClick={onDelete}
		>
			删除
		</PermissionButton>,
		// 新增按钮
		<PermissionButton
			key="add"
			icon={<PlusCircleOutlined />}
			type="primary"
			perm="develop:gen:create"
			onClick={onAdd}
		>
			新增
		</PermissionButton>,
	];
}
