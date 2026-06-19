declare namespace System {

	export interface OssConfig {
		/**
		 * 主键
		 */
		ossConfigId?: string | number

		/**
		 * 租户编码
		 */
		tenantId?: string | number

		/**
		 * 配置key
		 */
		configKey?: string

		/**
		 * accessKey
		 */
		accessKey?: string

		/**
		 * 秘钥
		 */
		secretKey?: string

		/**
		 * 桶名称
		 */
		bucketName?: string

		/**
		 * 前缀
		 */
		prefix?: string

		/**
		 * 访问站点
		 */
		endpoint?: string

		/**
		 * 自定义域名
		 */
		domain?: string

		/**
		 * 是否https（Y是 N否）
		 */
		isHttps?: string

		/**
		 * 域
		 */
		region?: string

		/**
		 * 桶权限类型（0private 1public 2custom）
		 */
		accessPolicy?: string

		/**
		 * 是否默认（0是 1否）
		 */
		status?: string

		/**
		 * 扩展字段
		 */
		ext1?: string

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

	export namespace OssConfig {

		export interface UpdateStatus {
			/**
			 * 主键
			 */
			ossConfigId?: string | number

			/**
			 * 是否默认（0是 1否）
			 */
			status?: string
		}

	}
}
