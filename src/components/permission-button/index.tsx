import type { ButtonProps } from "antd";
import type { ReactNode } from "react";
import { Button } from "antd";
import { useAccess } from "#src/hooks/use-access";

export interface PermButtonProps extends ButtonProps {
	/** 权限标识符 */
	perm?: string
	/** 角色标识符 */
	role?: string
	/** 是否禁用（权限检查后会与此值取并集） */
	disabled?: boolean

	children?: ReactNode
}

export default function PermissionButton(props: PermButtonProps) {
	const { perm, role, disabled, children, ...antdButtonProps } = props;
	const { hasPerms, hasRoles } = useAccess();
	return (
		<Button
			type="primary"
			disabled={disabled || (!hasPerms(perm) && !hasRoles(role))}
			{...antdButtonProps}
		>
			{children}
		</Button>
	);
}
