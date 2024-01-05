import { Action, ActionPanel, Detail, getPreferenceValues } from '@raycast/api'
import { useFetch } from '@raycast/utils'
import { useState } from 'react'
import { Account } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import { AES, enc } from 'crypto-js'

const { userKey } = getPreferenceValues()

export default function AccountView({
	account,
	session,
}: {
	account: Account
	session: Session
}) {
	const [decryptedPassword, setDecryptedPassword] = useState('')

	const { isLoading } = useFetch<{
		data: string
		message?: string
	}>('https://vault.emiljohansson.dev/api/secret', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.access_token}`,
		},
		body: JSON.stringify({
			password: account.password,
		}),
		onData: async (data) => {
			const step3 = data.data
			const step2 = AES.decrypt(step3, session.user.id).toString(enc.Utf8)
			const step1 = AES.decrypt(step2, userKey).toString(enc.Utf8)
			setDecryptedPassword(step1 || 'Failed to decrypt')
		},
	})

	return (
		<Detail
			isLoading={isLoading}
			markdown={decryptedPassword || 'Loading…'}
			actions={
				<ActionPanel>
					<Action.CopyToClipboard
						title="Copy Password"
						content={decryptedPassword}
					/>
				</ActionPanel>
			}
		/>
	)
}
