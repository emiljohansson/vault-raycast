import { LocalStorage } from '@raycast/api'
import { useEffect, useState } from 'react'

export function useMasterKey() {
	const [masterKey, setMasterKey] = useState('')

	useEffect(() => {
		async function init() {
			const key = (await LocalStorage.getItem('vault_master_key')) as string
			setMasterKey(key || '')
		}

		init()
	}, [])

	return masterKey
}
