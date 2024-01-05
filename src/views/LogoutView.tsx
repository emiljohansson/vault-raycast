import { Detail, Toast, showToast } from '@raycast/api'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LogoutView() {
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function init() {
			const toast = await showToast({
				style: Toast.Style.Animated,
				title: 'Logging out…',
			})
			const { error } = await supabase.auth.signOut()
			setIsLoading(false)
			if (error) {
				toast.style = Toast.Style.Failure
				toast.title = 'Logout Failed'
				toast.message = error.message
				return
			}
			toast.style = Toast.Style.Success
			toast.title = 'Logout Successful'
		}
		init()
	}, [])

	return <Detail isLoading={isLoading} markdown="Logged out" />
}
