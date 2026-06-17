import type { LanguageType } from "#src/locales";
import { Button, type ButtonProps, type MenuProps } from "antd";

import { useLanguage } from "#src/hooks/use-language";
import { getLanguageItems } from "#src/layout/widgets/preferences/blocks/general/utils";

import { TranslationOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";

export function LanguageButton({ ...restProps }: ButtonProps) {
	const { language, setLanguage } = useLanguage();

	const items: MenuProps["items"] = getLanguageItems();

	const onClick: MenuProps["onClick"] = ({ key }) => {
		setLanguage(key as LanguageType);
	};

	return (
		<Dropdown
			menu={{
				items,
				onClick,
				selectable: true,
				selectedKeys: [language],
			}}
			trigger={["click"]}
			arrow={false}
			placement="bottom"
		>
			<Button
				type="text"
				{...restProps}
			>
				<TranslationOutlined />
			</Button>
		</Dropdown>
	);
}
