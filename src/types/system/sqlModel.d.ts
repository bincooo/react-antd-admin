declare namespace System {

	export interface SqlModel {
		/**
		 * 唯一ID
		 */
		id?: string | number

		/**
		 * 模型名称
		 */
		name?: string

		/**
		 * 主键类型（0数值 1字符）
		 */
		javaType?: string

		/**
		 * sql语句
		 */
		sqlText?: string

		/**
		 * 描述
		 */
		remark?: string

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

		/**
		 * $column.columnComment
		 */
		createDept?: number

	}

}
