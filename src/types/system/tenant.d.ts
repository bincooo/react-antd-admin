declare namespace System {

	export interface Tenant {
		/**
		 * $column.columnComment
		 */
		id?: string | number

		/**
		 * 租户编号
		 */
		tenantId?: string | number

		/**
		 * 联系人
		 */
		contactUserName?: string

		/**
		 * 联系电话
		 */
		contactPhone?: string

		/**
		 * 企业名称
		 */
		companyName?: string

		/**
		 * 统一社会信用代码
		 */
		licenseNumber?: string

		/**
		 * 地址
		 */
		address?: string

		/**
		 * 企业简介
		 */
		intro?: string

		/**
		 * 域名
		 */
		domain?: string

		/**
		 * 备注
		 */
		remark?: string

		/**
		 * 租户套餐编号
		 */
		packageId?: string | number

		/**
		 * 过期时间
		 */
		expireTime?: string

		/**
		 * 用户数量（-1不限制）
		 */
		accountCount?: number

		/**
		 * 租户状态（0正常 1停用）
		 */
		status?: string

		/**
		 * 删除标志（0代表存在 1代表删除）
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
