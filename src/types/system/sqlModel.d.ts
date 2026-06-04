declare namespace System {

	export interface SqlModel {
		/**
		 * 唯一ID
		 */
		id?: string | number

		/**
		 * sql语句
		 */
		sqlText?: string

		/**
		 * 模型名称
		 */
		name?: string

		/**
		 * 模型描述
		 */
		description?: string

		/**
		 * 创建时间
		 */
		createTime?: string

		/**
		 * 更新时间
		 */
		updateTime?: string

		/**
		 * 创建人
		 */
		createBy?: string

		/**
		 * 更新人
		 */
		updateBy?: string

		/**
		 * $column.columnComment
		 */
		tenantId?: string | number

	}

}
