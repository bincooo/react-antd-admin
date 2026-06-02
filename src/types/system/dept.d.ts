declare namespace System {

	export interface Dept {
		/**
		 * 部门ID
		 */
		deptId?: string | number

		/**
		 * 租户编号
		 */
		tenantId?: string | number

		/**
		 * 父部门ID
		 */
		parentId?: string | number

		/**
		 * 祖级列表
		 */
		ancestors?: string

		/**
		 * 部门名称
		 */
		deptName?: string

		/**
		 * 部门类别编码
		 */
		deptCategory?: string

		/**
		 * 显示顺序
		 */
		orderNum?: number

		/**
		 * 负责人
		 */
		leader?: number

		/**
		 * 联系电话
		 */
		phone?: string

		/**
		 * 邮箱
		 */
		email?: string

		/**
		 * 部门状态（0=正常, 1=停用）
		 */
		status?: string

		/**
		 * 删除标志（0=代表存在, 1=代表删除）
		 */
		delFlag?: string

		/**
		 * 创建部门
		 */
		createDept?: number

		/**
		 * 创建者
		 */
		createBy?: number

		/**
		 * 创建时间
		 */
		createTime?: string

		/**
		 * 更新者
		 */
		updateBy?: number

		/**
		 * 更新时间
		 */
		updateTime?: string

	}

}
