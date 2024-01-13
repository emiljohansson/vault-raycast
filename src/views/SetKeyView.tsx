import {
	Action,
	ActionPanel,
	Form,
	Icon,
	LocalStorage,
	Toast,
	showToast,
	useNavigation,
} from '@raycast/api'
import CryptoJS from 'crypto-js'
import { supabase } from '~/lib/supabase'

export function SetKeyView() {
	return (
		<Form
			actions={
				<ActionPanel>
					<LoginAction />
				</ActionPanel>
			}
		>
			<Form.TextField id="key" title="Key" placeholder="Enter your key…" />
		</Form>
	)
}

function LoginAction() {
	const { pop } = useNavigation()

	async function handleSubmit({ key }: { key: string }) {
		const toast = await showToast({
			style: Toast.Style.Animated,
			title: 'Storing key…',
		})

		const {
			data: { user },
			error,
		} = await supabase.auth.getUser()

		if (error) {
			showToast({
				style: Toast.Style.Failure,
				title: 'Login Failed',
				message: error.message,
			})
			return
		}

		const { data } = await supabase
			.from('key')
			.select('salt')
			.eq('id', key)
			.eq('user_id', user?.id || '')
			.single()

		const derivedKey = pbkdf2HmacSha256(
			key,
			data?.salt || 'wrong key',
			10000,
			256,
		)

		LocalStorage.setItem('vault_master_key', derivedKey)

		toast.style = Toast.Style.Success
		toast.title = 'Login Successful'
		toast.message = 'You are now logged in'
		pop()
	}

	return (
		<Action.SubmitForm icon={Icon.Lock} title="Save" onSubmit={handleSubmit} />
	)
}

function pbkdf2HmacSha256(
	password: string,
	salt: string,
	iterations: number,
	keyLength: number,
) {
	const key = CryptoJS.PBKDF2(password, salt, {
		keySize: keyLength / 32,
		iterations: iterations,
		hasher: CryptoJS.algo.SHA256,
	})

	return key.toString(CryptoJS.enc.Hex)
}
