declare namespace System {

	export interface Role {
		/**
		 * 角色ID
		 */
		roleId?: string | number

		/**
		 * 租户编号
		 */
		tenantId?: string | number

		/**
		 * 角色名称
		 */
		roleName?: string

		/**
		 * 权限字符
		 */
		roleKey?: string

		/**
		 * 显示顺序
		 */
		roleSort?: number

		/**
		 * 数据范围（1=全部数据权限, 2=自定数据权限, 3=本部门数据权限, 4=本部门及以下数据权限, 5=仅本人数据权限, 6=部门及以下或本人数据权限）
		 */
		dataScope?: string

		/**
		 * 菜单树选择项是否关联显示
		 */
		menuCheckStrictly?: boolean

		/**
		 * 部门树选择项是否关联显示
		 */
		deptCheckStrictly?: boolean

		/**
		 * 角色状态（0=正常, 1=停用）
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

		/**
		 * 备注
		 */
		remark?: string

	}

}
