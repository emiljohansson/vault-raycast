import {
	Action,
	ActionPanel,
	Form,
	Icon,
	Toast,
	showToast,
	useNavigation,
} from '@raycast/api'
import { supabase } from '~/lib/supabase'

export function LoginView() {
	return (
		<Form
			actions={
				<ActionPanel>
					<LoginAction />
				</ActionPanel>
			}
		>
			<Form.TextField
				id="email"
				title="Email"
				value=""
				placeholder="Enter email address…"
			/>
			<Form.PasswordField
				id="password"
				title="password"
				value=""
				placeholder="Enter password…"
			/>
		</Form>
	)
}

function LoginAction() {
	const { pop } = useNavigation()

	async function handleSubmit({
		email,
		password,
	}: {
		email: string
		password: string
	}) {
		const toast = await showToast({
			style: Toast.Style.Animated,
			title: 'Logging in…',
		})

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) {
			showToast({
				style: Toast.Style.Failure,
				title: 'Login Failed',
				message: error.message,
			})
			return
		}

		toast.style = Toast.Style.Success
		toast.title = 'Login Successful'
		toast.message = 'You are now logged in'
		pop()
	}

	return (
		<Action.SubmitForm icon={Icon.Lock} title="Login" onSubmit={handleSubmit} />
	)
}
