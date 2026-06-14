import { Button } from "antd";
import { useAccess } from "#src/hooks/use-access";

interface PermButtonProps {
	perm: string
	disabled?: boolean
	onClick: () => void
	children: React.ReactNode
}

export default function PermButton({ perm, disabled, onClick, children }: PermButtonProps) {
	const { hasPerms } = useAccess();
	return (
		<Button
			type="link"
			size="small"
			disabled={disabled || !hasPerms(perm)}
			onClick={onClick}
		>
			{children}
		</Button>
	);
}
