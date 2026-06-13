import type { ProFieldFCRenderProps, ProRenderFieldPropsType } from "@ant-design/pro-components";
import ModalSearchField from "./modal-search";

/**
 * 全局注册表单
 */
const globalValueTypeMap: Record<string, ProRenderFieldPropsType> = {
	modalSearch: {
		// 表格展示
		render: (text: any) => {
			return text;
		},

		formItemRender: (
			text: any,
			{ fieldProps, ...props }: ProFieldFCRenderProps,
		) => {
			const { title, ...rest } = fieldProps;
			const { searchId } = props as any;
			return (
				<ModalSearchField
					{...rest}
					title={title}
					searchId={searchId}
				/>
			);
		},
	},
};

export default globalValueTypeMap;
