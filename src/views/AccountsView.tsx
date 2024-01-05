import { Action, ActionPanel, List, Toast, showToast } from '@raycast/api'
import { useEffect, useState } from 'react'
import { Account, supabase } from '../lib/supabase'
import AccountView from './AccountView'
import { Session } from '@supabase/supabase-js'

export default function AccountsView() {
	const session = useSession()
	const accounts = useAccounts()

	return (
		<List navigationTitle="Accounts" isLoading={accounts === null}>
			{session &&
				accounts?.map((account) => (
					<List.Item
						key={account.id}
						title={account.website}
						subtitle={account.username}
						actions={
							<ActionPanel>
								<Action.Push
									title="Go to Account"
									target={<AccountView session={session} account={account} />}
								/>
							</ActionPanel>
						}
					/>
				))}
		</List>
	)
}

function useSession() {
	const [session, setSession] = useState<Session | null>(null)

	useEffect(() => {
		async function init() {
			const { data, error } = await supabase.auth.getSession()
			const { session } = data

			if (!session || error) {
				await showToast({
					style: Toast.Style.Failure,
					title: 'Not logged in',
					message: 'Please log in',
				})
				return
			}

			setSession(session)
		}

		init()
	}, [])

	return session
}

function useAccounts() {
	const [accounts, setAccounts] = useState<Account[] | null>(null)
	const session = useSession()

	useEffect(() => {
		if (!session) return

		async function init() {
			const toast = await showToast({
				style: Toast.Style.Animated,
				title: 'Loading accounts…',
			})

			const {
				data: { user },
			} = await supabase.auth.getUser()
			const { data: accounts } = await supabase
				.from('account')
				.select('*')
				.eq('user_id', user?.id)

			if (!accounts) {
				toast.style = Toast.Style.Failure
				toast.title = 'No Accounts'
				toast.message = 'Please add an account'
				setAccounts([])
				return
			}

			toast.style = Toast.Style.Success
			toast.title = 'Accounts Loaded'

			setAccounts(accounts)
		}

		init()
	}, [session])

	return accounts
}
