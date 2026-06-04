import type { ProFieldFCRenderProps, ProRenderFieldPropsType } from "@ant-design/pro-components";
import ModalSearch from "./modal-search";

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
			const { request } = props as any;
			return (
				<ModalSearch
					{...rest}
					title={title}
					style={{ maxWidth: "900px" }}
					width="95%"
					request={request}
				/>
			);
		},
	},
};

export default globalValueTypeMap;
