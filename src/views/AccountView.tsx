import { Action, ActionPanel, Detail } from '@raycast/api'
import { useFetch } from '@raycast/utils'
import { useState } from 'react'
import { Account, supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import { AES, enc } from 'crypto-js'
import { useMasterKey } from '~/lib/hooks'

export default function AccountView({
	account,
	session,
}: {
	account: Account
	session: Session
}) {
	const [decryptedPassword, setDecryptedPassword] = useState('')
	const masterKey = useMasterKey()

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
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (!user) {
				return
			}
			const { data: accountData } = await supabase
				.from('account')
				.select('salt')
				.eq('user_id', user.id)
				.eq('password', account.password)
				.single()

			if (!accountData?.salt) {
				return
			}

			const step3 = data.data
			const step2 = AES.decrypt(step3, session.user.id).toString(enc.Utf8)
			const step1 = decryptPassword(masterKey, step2, accountData.salt)
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

export function decryptPassword(
	masterKey: string,
	encryptedPassword: string,
	salt: string,
) {
	const encryptionKey = decryptWithKey(salt, masterKey)
	const plaintextPassword = decryptWithKey(encryptedPassword, encryptionKey)
	return plaintextPassword
}

function decryptWithKey(ciphertext: string, key: string) {
	return AES.decrypt(ciphertext, key).toString(enc.Utf8)
}
